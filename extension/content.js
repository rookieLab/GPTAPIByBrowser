// content.js

class ChatGPTWebAPI {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.observer = null;
    this.stop = false;
    this.statusElement = null;
    this.lastText = null;
  }

  log(...args) {
    console.log('[ChatGPTWebAPI]', ...args);
  }

  cleanText(input) {
    const invisibleChars = /[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F]/g;
    return input.replace(invisibleChars, '');
  }

  getTextFromNode(node) {
    if (!node || (node.classList?.contains('text-token-text-secondary') && node.classList.contains('bg-token-main-surface-secondary'))) return '';

    let result = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        result += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        result += this.getTextFromNode(child);
      }
    }
    return this.cleanText(result);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage({ text }) {
    const editButton = document.querySelector('button.flex.h-9.w-9.items-center.justify-center.rounded-full.text-token-text-secondary.transition.hover\\:bg-token-main-surface-tertiary');
    // const editor = document.querySelector('textarea');

    const editor = document.querySelector('#prompt-textarea');
    if (!editor) return this.log('Error: Textarea not found');

    editor.innerHTML = text;
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await this.sleep(500);

    if (editButton) {
      editButton.click();
      await this.sleep(500);
    }

    const sendButton = document.querySelector('#composer-submit-button');
    if (sendButton) {
      this.observeMutations();
      sendButton.click();

    } else {
      this.log('Error: Send button not found');
    }
  }

  observeMutations() {
    let interactionStarted = false;

    this.observer = new MutationObserver(() => {
      try {
        const stopBtn = document.querySelector('button.bg-black .icon-lg');
        console.log("MutationObserver stopBtn", stopBtn)
        if (stopBtn) interactionStarted = true;
        if (!interactionStarted) return;

        // this.socket.send(JSON.stringify({ type: 'answer', text }));

        if (!document.querySelector('button.bg-black .icon-lg')) {
          this.observer.disconnect();
          if (this.stop) return;
          this.stop = true;

          const replies = document.querySelectorAll('div.agent-turn');
          const lastReply = replies[replies.length - 1];
          const textNode = lastReply?.querySelector('[data-message-author-role="assistant"]');

          const text = this.getTextFromNode(textNode);
          console.log("MutationObserver text", text)
          this.socket.send(JSON.stringify({ type: 'answer', text }));
          // this.socket.send(JSON.stringify({ type: 'stop' }));
        }
      } catch (error) {
        console.error(error)
      }

    });
    console.log("MutationObserver start...")
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  sendHeartbeat() {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }

  connectSocket() {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      this.log('WebSocket connected');
      this.setStatus('API Connected!', 'green');
    };

    this.socket.onclose = () => {
      this.log('WebSocket disconnected. Reconnecting...');
      this.setStatus('API Disconnected!', 'red');
      setTimeout(() => this.connectSocket(), 2000);
    };

    this.socket.onerror = (err) => {
      this.log('WebSocket error:', err);
      this.setStatus('API Error!', 'red');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.log('Received:', data);
        this.sendMessage(data);
      } catch (err) {
        this.log('Error parsing message:', err);
      }
    };
  }

  setStatus(text, color) {
    console.log("ChatGPTWebAPI  setStatus")
    if (!this.statusElement) return;
    this.statusElement.innerHTML = `<div style="color: ${color};">${text}</div>`;
  }

  initUI() {
    console.log("ChatGPTWebAPI init load")
    this.statusElement = document.createElement('div');
    this.statusElement.id = "ap-chat-gpt-web-api"
    this.statusElement.style = 'position: fixed; top: 10px; right: 10px; z-index: 9999;';
    document.body.appendChild(this.statusElement);
  }

  init() {
    console.log("ChatGPTWebAPI init")
    window.addEventListener('load', () => {
      console.log("ChatGPTWebAPI init load")
      this.initUI();
      this.connectSocket();
      setInterval(() => this.sendHeartbeat(), 30000);
    });
  }
}

(function () {
  const app = new ChatGPTWebAPI('ws://localhost:8765/ws');
  app.init();
})();
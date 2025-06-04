# 🚀 ChatgptApiByBrowser

> Free, minimalist Chrome plug-in API gateway for ChatGPT

Use the browser web page to bypass API Key restrictions and make ChatGPT your local smart API!

---

## ✨ Project Introduction

**ChatgptApiByBrowser** is a tool that "freeloads" ChatGPT web pages into APIs. 
It consists of a Chrome plug-in + Python WebSocket server, allowing you to automatically call ChatGPT's enhanced capabilities locally without the OpenAI API Key.

The architecture is as follows: 
Chrome extension 🔁 WebSocket 🔁 Python server 🔁 Your application (Bot / Web interface / CLI)

---
## 🎯 Product positioning

- **Target users**: developers / automation enthusiasts / ordinary users without API Key

- **Application scenarios**:
- Local command line Q&A
- Automatic reply robot (QQ / WeChat / Telegram)
- AI assistant embedded in web pages
- Any scenario that requires a local intelligent Q&A interface

- **Core advantages**:
- ✅ Zero API cost
- ✅ Ultra-low latency response
- ✅ Strong customization capabilities (Prompt controllable / chain call)

---

## 🔧 Features

| Function | Description |
|------------------------|------|
| ✅ API encapsulation | Convert ChatGPT response to WebSocket API interface |
| ✅ Chrome plug-in automatic operation | Automatically control ChatGPT webpage to send messages and get replies |
| ✅ WebSocket real-time communication | The backend can receive and respond to conversation content through WebSocket |
| ✅ No API Key required | Use the browser's existing login status to call GPT, free of charge |
| ✅ Highly customizable | Support prompt templates, context input, multi-round dialogue expansion |
---

## 💡 Usage Examples

```bash
import requests


def send_request(_messages, model="gpt-4"):
    response = requests.post(
        "http://localhost:8765/v1/chat/completions",
        json={"messages": _messages, "model": model, "newChat": False, "webhook": ""}
    ).json()
    return response


if __name__ == '__main__':
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": """jxxx"""
        }
    ]
    print(send_request(messages))

```

---
## 🧩 Installation tutorial

### 1️⃣ Install Chrome extension

> Extension directory: `/extension`

1. Open Chrome and visit: `chrome://extensions/`

2. Enable "Developer mode"

3. Click "Load unpacked extension" and select the `/extension` directory

4. Log in to ChatGPT webpage ([chat.openai.com](https://chat.openai.com)) and keep it open

---

### 2️⃣ Start Python server (Docker is recommended)

> Server directory: `/server`

#### Quick deployment using Docker

```bash
# clone 
git clone https://github.com/yourname/ChatgptApiByBrowser.git
cd ChatgptApiByBrowser/server

# build image
docker build -t chatgpt-api-server .

# start container
docker run -d -p 8765:8765 --name chatgpt-api chatgpt-api-server
```
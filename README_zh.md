# 🚀 ChatgptApiByBrowser

> 免费、高效、极简封装 ChatGPT 的 Chrome 插件 API 网关  
> 使用浏览器网页绕过 API Key 限制，让 ChatGPT 成为你的本地智能 API！

---

## ✨ 项目简介

**ChatgptApiByBrowser** 是一个将 ChatGPT 网页“白嫖式”封装成 API 的工具。  
它由 Chrome 插件 + Python WebSocket 服务端组成，让你无需 OpenAI API Key，也能在本地自动调用 ChatGPT 的强大能力。

架构如下：  
Chrome Extension 🔁 WebSocket 🔁 Python Server 🔁 你的应用（Bot / Web前端 / CLI）


---

## 🎯 产品定位

- **目标用户**：开发者 / 自动化爱好者 / 无 API Key 的普通用户  
- **应用场景**：
  - 本地命令行问答
  - 自动回复机器人（QQ / 微信 / Telegram）
  - 嵌入网页的 AI 助手
  - 任何需要本地智能问答接口的场景  
- **核心优势**：
  - ✅ 零 API 成本
  - ✅ 超低延迟响应
  - ✅ 自定义能力强（Prompt 可控 / 链式调用）

---

## 🔧 功能特性

| 功能                   | 描述 |
|------------------------|------|
| ✅ API 封装             | 将 ChatGPT 响应转为 WebSocket API 接口 |
| ✅ Chrome 插件自动操作  | 自动控制 ChatGPT 网页发送消息并获取回复 |
| ✅ WebSocket 实时通讯   | 后端可通过 WebSocket 接收和响应对话内容 |
| ✅ 无需 API Key         | 使用浏览器已有登录状态调用 GPT，无需付费 |
| ✅ 高定制性             | 支持 Prompt 模板、上下文传入、多轮对话扩展 |

---

## 💡 使用示例

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

## 🧩 安装教程

### 1️⃣ 安装 Chrome 插件

> 插件目录：`/extension`

1. 打开 Chrome，访问：`chrome://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `/extension` 目录
4. 登录 ChatGPT 网页（[chat.openai.com](https://chat.openai.com)），保持打开

---

### 2️⃣ 启动 Python 服务端（推荐使用 Docker）

> 服务端目录：`/server`

#### 使用 Docker 快速部署

```bash
# 克隆仓库
git clone https://github.com/yourname/ChatgptApiByBrowser.git
cd ChatgptApiByBrowser/server

# 构建镜像
docker build -t chatgpt-api-server .

# 启动容器
docker run -d -p 8765:8765 --name chatgpt-api chatgpt-api-server
```
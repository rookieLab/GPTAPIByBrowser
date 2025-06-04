import asyncio

import httpx
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn

app = FastAPI()

# 跨域设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WebSocketServer:
    def __init__(self):
        self.connected_socket: WebSocket | None = None
        self.webhook = None
        self.response = None
        self.event = asyncio.Event()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connected_socket = websocket
        print("Browser connected, can process requests now.")

    async def disconnect(self):
        print("Browser disconnected.")
        self.connected_socket = None

    async def websocket_handler(self, websocket: WebSocket):
        await self.connect(websocket)
        while True:
            try:
                message = await self.connected_socket.receive_text()
                data = json.loads(message)
                if data["type"] == "heartbeat":
                    pass
                elif data["type"] == "stop":
                    break
                elif data["type"] == "answer":
                    print(f"receive data:{data}")
                    self.response = data["text"]
                    self.event.set()
            except WebSocketDisconnect:
                await self.disconnect()
            except Exception as e:
                print("Error receiving message:", e)
                break

    async def send_request(self, request_data):
        if not self.connected_socket or self.connected_socket.client_state.name != "CONNECTED":
            print("Browser not connected.")
            return "api error"
        try:
            await self.connected_socket.send_text(json.dumps(request_data))
            try:
                await asyncio.wait_for(self.event.wait(), timeout=60 * 3)
            except asyncio.TimeoutError:
                print("等待超时，事件未触发")
            return self.response
        except Exception as e:
            print("Error receiving message:", e)

    async def callback(self, answer):
        payload = {
            "answer": answer  # 把结果包装成 JSON 的 answer 字段
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.webhook, json=payload)
                if response.status_code == 200:
                    print("✅ Webhook sent successfully.")
                else:
                    print(f"❌ Webhook failed with status code: {response.status_code}")
                    print(f"Response body: {response.text}")
            except Exception as e:
                print(f"⚠️ Error sending webhook: {e}")


web_socket_server = WebSocketServer()


# 路由：用于浏览器连接 WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await web_socket_server.websocket_handler(websocket)


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    model = body.get("model")
    stream = body.get("stream", False)
    new_chat = body.get("newChat", True)
    webhook = body.get("webhook")

    print("request body", body)
    request_payload = f"""Now you must play the role of system and answer the user.

        {json.dumps(messages, ensure_ascii=False)}

        Your answer:
    """
    answer = await web_socket_server.send_request({
        "text": request_payload,
        "model": model,
        "newChat": new_chat
    })
    return JSONResponse(content=answer)


if __name__ == "__main__":
    import httpx
    from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
    from fastapi.responses import StreamingResponse, JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    import json
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8765, reload=True)

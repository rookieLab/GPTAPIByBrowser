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

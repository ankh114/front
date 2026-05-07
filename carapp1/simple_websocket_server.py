#!/usr/bin/env python3
"""
简单的WebSocket测试服务器
用于测试路径格式
"""

import asyncio
import websockets

async def echo(websocket, path):
    print(f"接收到连接，路径: {path}")
    await websocket.send(f"你好! 你的路径是: {path}")
    
    try:
        async for message in websocket:
            print(f"收到消息: {message}")
            await websocket.send(f"收到: {message}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"连接关闭: {e}")

async def main():
    async with websockets.serve(echo, "0.0.0.0", 8000):
        print("服务器启动在 ws://localhost:8000")
        print("按 Ctrl+C 停止")
        await asyncio.Future()  # 保持运行

if __name__ == "__main__":
    asyncio.run(main())

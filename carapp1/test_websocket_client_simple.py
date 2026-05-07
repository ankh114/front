#!/usr/bin/env python3
"""
简单的WebSocket客户端测试工具
用于测试WebSocket服务器是否正常工作
"""

import asyncio
import websockets
import json

async def test_websocket_connection(car_id=1):
    """测试WebSocket连接"""
    ws_url = f"ws://localhost:8001/history/{car_id}/monitor"
    print(f"Trying to connect to: {ws_url}")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("Connection successful!")
            
            # 接收欢迎消息
            welcome_message = await websocket.recv()
            print(f"Received welcome message: {welcome_message}")
            
            # 发送测试消息
            test_message = {"type": "ping", "message": "test message"}
            await websocket.send(json.dumps(test_message))
            print(f"Sent test message: {test_message}")
            
            # 接收响应
            response = await websocket.recv()
            print(f"Received response: {response}")
            
            # 接收2条状态消息
            print("\nReceiving status messages:")
            for i in range(2):
                status_message = await websocket.recv()
                print(f"Status message {i+1}: {status_message}")
                
            print("\nTest completed successfully!")
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    import sys
    
    car_id = 1
    if len(sys.argv) > 1:
        try:
            car_id = int(sys.argv[1])
        except ValueError:
            print(f"Invalid car ID: {sys.argv[1]}, using default: 1")
    
    print(f"Starting WebSocket connection test for car {car_id}...")
    asyncio.run(test_websocket_connection(car_id))

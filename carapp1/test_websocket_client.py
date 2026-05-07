#!/usr/bin/env python3
"""
WebSocket客户端测试工具
用于测试WebSocket服务器是否正常工作
"""

import asyncio
import websockets
import json

async def test_websocket_connection(car_id=1):
    """测试WebSocket连接"""
    ws_url = f"ws://localhost:8000/history/{car_id}/monitor"
    print(f"尝试连接到: {ws_url}")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("✅ 连接成功!")
            
            # 接收欢迎消息
            welcome_message = await websocket.recv()
            print(f"收到欢迎消息: {welcome_message}")
            
            # 发送测试消息
            test_message = {"type": "ping", "message": "测试消息"}
            await websocket.send(json.dumps(test_message))
            print(f"发送测试消息: {test_message}")
            
            # 接收响应
            response = await websocket.recv()
            print(f"收到响应: {response}")
            
            # 接收2条状态消息
            print("\n接收状态消息:")
            for i in range(2):
                status_message = await websocket.recv()
                print(f"状态消息 {i+1}: {status_message}")
                
            print("\n✅ 测试完成，WebSocket连接正常！")
            
    except Exception as e:
        print(f"❌ 连接失败: {e}")

if __name__ == "__main__":
    import sys
    
    car_id = 1
    if len(sys.argv) > 1:
        try:
            car_id = int(sys.argv[1])
        except ValueError:
            print(f"无效的小车ID: {sys.argv[1]}, 使用默认值: 1")
    
    print(f"开始测试小车 {car_id} 的WebSocket连接...")
    asyncio.run(test_websocket_connection(car_id))

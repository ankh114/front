#!/usr/bin/env python3
"""
WebSocket测试服务器
用于测试前端小车状态数据的接收

启动方式:
1. 直接运行: python websocket_test_server.py
2. 或带端口运行: python websocket_test_server.py 8001

测试方法:
1. 打开浏览器访问 http://localhost:8080/websocket-test.html
2. 查看WebSocket测试页面
3. 在测试页面中输入小车ID，查看是否能正常接收模拟数据
"""

import asyncio
import json
import random
import time
from datetime import datetime


try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    print("警告: websockets库未安装，WebSocket服务器将无法启动")
    print("安装方式: pip install websockets")

# WebSocket服务器配置
DEFAULT_PORT = 8000

# 客户端管理
clients = set()
car_subscriptions = {}


async def handle_client(websocket):
    """处理WebSocket客户端连接"""
    print(f"\n[连接] 新的WebSocket连接")
    
    # 从WebSocket请求中获取路径
    # 注意：在某些websockets库版本中，路径可能需要从其他地方获取
    # 这里我们暂时使用默认的小车ID 1
    car_id = "1"
    print(f"[小车ID] 使用默认值: {car_id}")
    
    # 注册客户端
    clients.add(websocket)
    if car_id not in car_subscriptions:
        car_subscriptions[car_id] = set()
    car_subscriptions[car_id].add(websocket)
    print(f"[注册] 客户端订阅小车: {car_id}")
    print(f"[统计] 当前订阅的小车: {list(car_subscriptions.keys())}")

    try:
        # 发送欢迎消息
        welcome_msg = {
            "type": "welcome",
            "message": f"已连接到小车{car_id}的实时数据流",
            "car_id": car_id,
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(welcome_msg))

        # 开始发送模拟数据
        async def send_status_data():
            while websocket in clients:
                # 生成模拟的小车状态数据
                status_data = {
                    "car_id": car_id,
                    "battery": random.randint(20, 100),
                    "speed": round(random.uniform(0, 5), 2),
                    "temperature": round(random.uniform(20, 40), 1),
                    "signal": random.randint(50, 100),
                    "status": random.choice(["idle", "running", "charging", "error"]),
                    "longitude": round(random.uniform(0, 100), 6),
                    "latitude": round(random.uniform(0, 100), 6),
                    "timestamp": datetime.now().isoformat()
                }

                try:
                    await websocket.send(json.dumps(status_data))
                    print(f"[发送] 向小车{car_id}发送: {json.dumps(status_data)[:100]}...")
                except websockets.exceptions.ConnectionClosed:
                    break
                
                await asyncio.sleep(1)

        # 启动发送数据的任务
        send_task = asyncio.create_task(send_status_data())

        # 保持连接并处理消息
        async for message in websocket:
            try:
                data = json.loads(message)
                print(f"[收到] 来自客户端的消息: {json.dumps(data)[:200]}...")

                # 处理客户端发送的消息（如心跳、命令等）
                if data.get('type') == 'ping':
                    await websocket.send(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }))

            except json.JSONDecodeError:
                print(f"[错误] 无法解析JSON消息: {message}")

    except websockets.exceptions.ConnectionClosed as e:
        print(f"[断开] 客户端连接关闭: {e}")
    finally:
        # 取消发送任务
        send_task.cancel()
        
        # 清理客户端
        clients.discard(websocket)
        if car_id and car_id in car_subscriptions:
            car_subscriptions[car_id].discard(websocket)
            if not car_subscriptions[car_id]:
                del car_subscriptions[car_id]
        print(f"[注销] 客户端取消订阅")


def create_mock_database():
    """创建模拟数据库结构"""
    return {
        "cars": [
            {
                "id": 1,
                "name": "测试小车1号",
                "status": "idle",
                "battery": 85,
                "speed": 0.0,
                "temperature": 25.5,
                "signal": 95
            },
            {
                "id": 2,
                "name": "测试小车2号",
                "status": "running",
                "battery": 62,
                "speed": 2.3,
                "temperature": 32.1,
                "signal": 88
            },
            {
                "id": 3,
                "name": "测试小车3号",
                "status": "charging",
                "battery": 45,
                "speed": 0.0,
                "temperature": 28.0,
                "signal": 76
            }
        ],
        "paths": [],
        "tasks": []
    }


def print_test_instructions():
    """打印测试说明"""
    print("""
========================================
  WebSocket 测试说明
========================================

  1. 启动后端服务器:
     python websocket_test_server.py

  2. 打开前端测试页面:
     http://localhost:8080/websocket-test.html

  3. 在测试页面中:
     - 输入小车ID (如 1, 2, 3)
     - 点击"连接"按钮
     - 查看实时接收的数据

  4. 测试页面功能:
     - 手动发送测试消息
     - 查看接收的数据日志
     - 数据可视化显示

========================================
""")


async def run_server(port=DEFAULT_PORT):
    """运行服务器"""
    if not WEBSOCKETS_AVAILABLE:
        print("错误: websockets库未安装，无法启动WebSocket服务器")
        return

    print("========================================")
    print("  WebSocket 测试服务器")
    print("========================================")
    print(f"  端口: {port}")
    print("  路径: 任意路径都可以连接")
    print(f"  示例: ws://localhost:{port}/任意路径")
    print("")
    print("  启动广播测试:")
    print("  1. 连接后服务器会自动发送模拟数据")
    print("  2. 可以修改代码中的 interval 参数调整发送频率")
    print("")
    print("  按 Ctrl+C 停止服务器")
    print("========================================")
    print("")

    async with websockets.serve(handle_client, "0.0.0.0", port):
        await asyncio.Future()  # 保持服务器运行


if __name__ == "__main__":
    import sys

    # 解析命令行参数
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"无效的端口号: {sys.argv[1]}, 使用默认端口: {DEFAULT_PORT}")

    print_test_instructions()

    # 运行服务器
    try:
        asyncio.run(run_server(port))
    except KeyboardInterrupt:
        print("\n[停止] 服务器已停止")

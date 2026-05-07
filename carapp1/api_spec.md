# FastAPI后端API接口规范

## 数据结构定义

### 1. 任务(Task)数据结构
```json
{
  "id": 1,
  "name": "区域A日常巡检",
  "device": "ROBOT-001",
  "status": "running",
  "time": "2025-06-15 14:00-16:00",
  "progress": 65,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [{"lon": 120.0, "lat": 30.0, "alt": 0.0}, ...],
  "checkPoints": [{"lon": 120.0015, "lat": 30.0002, "alt": 0.0, "name": "检查点A"}, ...],
  "startTime": "2025-06-15 14:00",
  "endTime": "2025-06-15 16:00",
  "description": "对区域A进行日常巡检",
  "inspectionMode": "快速巡检",
  "speed": "低速 (0.5m/s)",
  "sensorConfig": "全传感器开启"
}
```

### 2. 设备(Device)数据结构
```json
{
  "id": "ROBOT-001",
  "name": "机器人1号",
  "battery": 78.5,
  "speed": 0.8,
  "temperature": 32.1,
  "signal": 92.5,
  "status": "running"
}
```

### 3. 问题(Issue)数据结构
```json
{
  "id": "ISSUE-001",
  "type": "设备异常",
  "location": "区域A-设备区",
  "time": "2025-06-15 14:32",
  "status": "待处理",
  "device": "ROBOT-001",
  "description": "检测到区域A设备区的3号配电柜存在异常温度升高现象...",
  "images": ["https://picsum.photos/400/300?random=10", ...],
  "logs": [{"content": "系统自动创建问题单", "time": "2025-06-15 14:32:15"}, ...]
}
```

### 4. 车辆状态(VehicleStatus)数据结构
```json
{
  "battery": 78.5,
  "speed": 0.8,
  "temperature": 32.1,
  "signal": 92.5,
  "status": "running"
}
```

## API接口列表

### 1. 任务管理接口

#### GET /api/tasks
获取所有任务列表

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "区域A日常巡检",
    "device": "ROBOT-001",
    "status": "running",
    "time": "2025-06-15 14:00-16:00",
    "progress": 65,
    "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
    "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
    "path": [{"lon": 120.0, "lat": 30.0, "alt": 0.0}, ...],
    "checkPoints": [{"lon": 120.0015, "lat": 30.0002, "alt": 0.0, "name": "检查点A"}, ...]
  },
  ...
]
```

#### GET /api/tasks/{id}
获取单个任务详情

**响应示例：**
```json
{
  "id": 1,
  "name": "区域A日常巡检",
  "device": "ROBOT-001",
  "status": "running",
  "time": "2025-06-15 14:00-16:00",
  "progress": 65,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [{"lon": 120.0, "lat": 30.0, "alt": 0.0}, ...],
  "checkPoints": [{"lon": 120.0015, "lat": 30.0002, "alt": 0.0, "name": "检查点A"}, ...]
}
```

#### POST /api/tasks
创建新任务

**请求示例：**
```json
{
  "name": "新任务",
  "device": "ROBOT-001",
  "status": "pending",
  "time": "2025-06-16 10:00-12:00",
  "progress": 0,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [],
  "checkPoints": []
}
```

**响应示例：**
```json
{
  "id": 4,
  "name": "新任务",
  "device": "ROBOT-001",
  "status": "pending",
  "time": "2025-06-16 10:00-12:00",
  "progress": 0,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [],
  "checkPoints": []
}
```

#### PUT /api/tasks/{id}
更新任务信息

**请求示例：**
```json
{
  "name": "区域A日常巡检(更新)",
  "device": "ROBOT-001",
  "status": "running",
  "time": "2025-06-15 14:00-16:00",
  "progress": 70
}
```

**响应示例：**
```json
{
  "id": 1,
  "name": "区域A日常巡检(更新)",
  "device": "ROBOT-001",
  "status": "running",
  "time": "2025-06-15 14:00-16:00",
  "progress": 70,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [{"lon": 120.0, "lat": 30.0, "alt": 0.0}, ...],
  "checkPoints": [{"lon": 120.0015, "lat": 30.0002, "alt": 0.0, "name": "检查点A"}, ...]
}
```

#### PUT /api/tasks/{id}/status
更新任务状态

**请求示例：**
```json
{
  "status": "completed"
}
```

**响应示例：**
```json
{
  "id": 1,
  "name": "区域A日常巡检",
  "device": "ROBOT-001",
  "status": "completed",
  "time": "2025-06-15 14:00-16:00",
  "progress": 100,
  "mapCenter": {"lon": 120.0, "lat": 30.0, "alt": 500.0},
  "robotPosition": {"lon": 120.0, "lat": 30.0, "alt": 0.0},
  "path": [{"lon": 120.0, "lat": 30.0, "alt": 0.0}, ...],
  "checkPoints": [{"lon": 120.0015, "lat": 30.0002, "alt": 0.0, "name": "检查点A"}, ...]
}
```

#### DELETE /api/tasks/{id}
删除任务

**响应示例：**
```json
{
  "message": "任务已删除"
}
```

### 2. 设备管理接口

#### GET /api/devices
获取所有设备列表

**响应示例：**
```json
[
  {
    "id": "ROBOT-001",
    "name": "机器人1号",
    "battery": 78.5,
    "speed": 0.8,
    "temperature": 32.1,
    "signal": 92.5,
    "status": "running"
  },
  ...
]
```

#### GET /api/devices/{id}
获取单个设备详情

**响应示例：**
```json
{
  "id": "ROBOT-001",
  "name": "机器人1号",
  "battery": 78.5,
  "speed": 0.8,
  "temperature": 32.1,
  "signal": 92.5,
  "status": "running"
}
```

#### GET /api/devices/{id}/status
获取设备实时状态

**响应示例：**
```json
{
  "battery": 78.5,
  "speed": 0.8,
  "temperature": 32.1,
  "signal": 92.5,
  "status": "running"
}
```

### 3. 问题管理接口

#### GET /api/issues
获取所有问题列表

**响应示例：**
```json
[
  {
    "id": "ISSUE-001",
    "type": "设备异常",
    "location": "区域A-设备区",
    "time": "2025-06-15 14:32",
    "status": "待处理",
    "device": "ROBOT-001",
    "description": "检测到区域A设备区的3号配电柜存在异常温度升高现象...",
    "images": ["https://picsum.photos/400/300?random=10", ...],
    "logs": [{"content": "系统自动创建问题单", "time": "2025-06-15 14:32:15"}, ...]
  },
  ...
]
```

#### GET /api/issues/{id}
获取单个问题详情

**响应示例：**
```json
{
  "id": "ISSUE-001",
  "type": "设备异常",
  "location": "区域A-设备区",
  "time": "2025-06-15 14:32",
  "status": "待处理",
  "device": "ROBOT-001",
  "description": "检测到区域A设备区的3号配电柜存在异常温度升高现象...",
  "images": ["https://picsum.photos/400/300?random=10", ...],
  "logs": [{"content": "系统自动创建问题单", "time": "2025-06-15 14:32:15"}, ...]
}
```

#### POST /api/issues
创建新问题

**请求示例：**
```json
{
  "type": "设备异常",
  "location": "区域B-设备区",
  "time": "2025-06-15 15:00",
  "status": "待处理",
  "device": "ROBOT-002",
  "description": "检测到异常",
  "images": [],
  "logs": []
}
```

**响应示例：**
```json
{
  "id": "ISSUE-004",
  "type": "设备异常",
  "location": "区域B-设备区",
  "time": "2025-06-15 15:00",
  "status": "待处理",
  "device": "ROBOT-002",
  "description": "检测到异常",
  "images": [],
  "logs": []
}
```

#### PUT /api/issues/{id}/status
更新问题状态

**请求示例：**
```json
{
  "status": "处理中"
}
```

**响应示例：**
```json
{
  "id": "ISSUE-001",
  "type": "设备异常",
  "location": "区域A-设备区",
  "time": "2025-06-15 14:32",
  "status": "处理中",
  "device": "ROBOT-001",
  "description": "检测到区域A设备区的3号配电柜存在异常温度升高现象...",
  "images": ["https://picsum.photos/400/300?random=10", ...],
  "logs": [{"content": "系统自动创建问题单", "time": "2025-06-15 14:32:15"}, ...]
}
```

### 3. 机器人控制接口

#### POST /api/robots/{id}/command
发送控制命令

**请求示例：**
```json
{
  "command": "start"
}
```

**响应示例：**
```json
{
  "message": "命令已发送"
}
```

#### GET /api/robots/{id}/status
获取机器人实时状态

**响应示例：**
```json
{
  "battery": 78.5,
  "speed": 0.8,
  "temperature": 32.1,
  "signal": 92.5,
  "status": "running"
}
```

## 部署配置

### Gunicorn配置
```ini
[gunicorn]
workers = 4
worker_class = uvicorn.workers.UvicornWorker
bind = 0.0.0.0:8000
timeout = 120
```

### Nginx配置
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
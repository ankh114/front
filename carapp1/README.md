# 无人巡检小车监控平台

## 项目概述

这是一个基于Vue 3和Leaflet.js开发的无人巡检小车监控平台，用于实时监控小车位置、管理任务、查看设备状态等功能。

## 技术栈

### 前端
- **Vue 3** - 前端框架
- **Leaflet.js** - 开源地图库
- **JavaScript** - 开发语言
- **Vite** - 构建工具
- **Axios** - HTTP客户端
- **WebSocket** - 实时通信

### 后端（独立部署）
- **FastAPI** - Python Web框架
- **WebSocket** - 实时通信
- **SQLAlchemy** - ORM库

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # Vue组件
│   ├── CarManagement.vue      # 小车管理
│   ├── DeviceManagement.vue   # 设备管理
│   ├── IssueManagement.vue    # 警告管理
│   ├── MapImport.vue          # 地图服务
│   ├── MapMonitor.vue         # 地图监控
│   ├── SchedulePlanning.vue   # 调度规划
│   └── TaskPlanning.vue       # 任务规划
├── utils/           # 工具函数
│   ├── api.js                 # API请求封装
│   └── device.js              # 设备相关工具
├── App.vue          # 主应用组件
├── main.js          # 应用入口
└── style.css        # 全局样式
```

## 核心功能

### 1. 地图监控
- 实时显示小车位置和状态
- 任务路径可视化
- 定时任务管理
- 操作日志实时更新
- 多车辆位置监控

### 2. 任务管理
- 任务创建和编辑
- 路径规划（点选模式和多边形模式）
- 任务状态管理（开始、暂停、继续、取消）
- 定时任务设置

### 3. 小车管理
- 小车列表显示
- 设备绑定与解绑
- 小车状态监控

### 4. 设备管理
- 设备列表显示
- 设备状态监控
- 设备数据更新

### 5. 警告管理
- 警告列表显示
- 警告状态管理

### 6. 地图服务
- 地图数据导入
- 地点管理

## 安装与运行

### 前提条件
- Node.js 16.0+
- npm 7.0+

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## API接口

前端通过以下API与后端通信：

- **基础URL**: http://192.168.31.56:8000
- **设备API**: /devices/
- **小车API**: /cars/
- **任务API**: /tasks/
- **路径API**: /paths/
- **历史API**: /history/
- **WebSocket**: ws://[localhost:8000](http://192.168.31.56:8000)/history/{carId}/monitor

## 开发注意事项

1. **后端服务**：前端需要后端服务运行在 http://192.168.31.56:8000
2. **WebSocket连接**：用于实时数据更新，确保后端WebSocket服务正常运行
3. **地图初始化**：使用Leaflet.js初始化地图，需要确保DOM元素存在
4. **状态管理**：使用Vue 3的Composition API和ref/reactive进行状态管理
5. **错误处理**：添加适当的错误处理，确保用户体验

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
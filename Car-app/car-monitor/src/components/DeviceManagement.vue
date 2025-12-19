<script setup>
import { ref } from 'vue'

const devices = ref([
  {
    id: 'ROBOT-001',
    name: '一号巡检小车',
    status: '运行中',
    lastOnline: '刚刚',
    battery: '78%',
    currentTask: '区域A巡检',
    statusColor: 'status-running'
  },
  {
    id: 'ROBOT-002',
    name: '二号巡检小车',
    status: '待机中',
    lastOnline: '5分钟前',
    battery: '92%',
    currentTask: '无',
    statusColor: 'status-standby'
  },
  {
    id: 'ROBOT-003',
    name: '三号巡检小车',
    status: '故障',
    lastOnline: '1小时前',
    battery: '45%',
    currentTask: '区域C巡检',
    statusColor: 'status-fault'
  }
])
</script>

<template>
  <div class="device-page">
    <h2 class="page-title">设备管理</h2>
    
    <!-- 搜索和添加按钮 -->
    <div class="search-add-container">
      <input 
        type="text" 
        placeholder="搜索设备..." 
        class="search-input"
      />
      <button class="btn-primary">
        <i class="fa fa-plus mr-2"></i>添加设备
      </button>
    </div>
    
    <!-- 设备列表 -->
    <div class="device-table-container">
      <table class="device-table">
        <thead>
          <tr class="table-header">
            <th class="table-header-cell">设备编号</th>
            <th class="table-header-cell">设备名称</th>
            <th class="table-header-cell">状态</th>
            <th class="table-header-cell">最后在线</th>
            <th class="table-header-cell">电池电量</th>
            <th class="table-header-cell">当前任务</th>
            <th class="table-header-cell">操作</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="device in devices" :key="device.id" class="table-row">
            <td class="table-cell">{{ device.id }}</td>
            <td class="table-cell">{{ device.name }}</td>
            <td class="table-cell">
              <span class="status-badge" :class="device.statusColor">{{ device.status }}</span>
            </td>
            <td class="table-cell">{{ device.lastOnline }}</td>
            <td class="table-cell">{{ device.battery }}</td>
            <td class="table-cell">{{ device.currentTask }}</td>
            <td class="table-cell action-cell">
              <button class="btn-view">查看</button>
              <button class="btn-edit">编辑</button>
              <button class="btn-delete">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 设备详情 -->
    <div class="device-details-container">
      <!-- 基本信息 -->
      <div class="detail-card">
        <h3 class="detail-title">ROBOT-001 详情</h3>
        <div class="detail-content">
          <div class="detail-item">
            <span class="detail-label">设备型号</span>
            <span class="detail-value">XJ-2023A</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">安装位置</span>
            <span class="detail-value">厂区A区</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">IP地址</span>
            <span class="detail-value">192.168.1.101</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ROS版本</span>
            <span class="detail-value">Noetic</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">固件版本</span>
            <span class="detail-value">v2.3.1</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">安装日期</span>
            <span class="detail-value">2023-03-15</span>
          </div>
        </div>
      </div>
      
      <!-- 传感器状态 -->
      <div class="detail-card">
        <h3 class="detail-title">传感器状态</h3>
        <div class="detail-content">
          <div class="sensor-item">
            <span class="sensor-name">前视摄像头</span>
            <span class="status-badge status-running">正常</span>
          </div>
          <div class="sensor-item">
            <span class="sensor-name">后视摄像头</span>
            <span class="status-badge status-running">正常</span>
          </div>
          <div class="sensor-item">
            <span class="sensor-name">左视摄像头</span>
            <span class="status-badge status-standby">信号弱</span>
          </div>
          <div class="sensor-item">
            <span class="sensor-name">右视摄像头</span>
            <span class="status-badge status-running">正常</span>
          </div>
          <div class="sensor-item">
            <span class="sensor-name">激光雷达</span>
            <span class="status-badge status-running">正常</span>
          </div>
        </div>
      </div>
      
      <!-- 指令下发 -->
      <div class="detail-card">
        <h3 class="detail-title">指令下发</h3>
        <div class="detail-content">
          <div class="preset-commands">
            <div class="preset-title">预设指令</div>
            <button class="preset-command-btn">返回基站</button>
          </div>
          

          
          <div class="command-history">
            <div class="history-title">指令历史</div>
            <div class="history-list">
              <div class="history-item">move_base 目标点设置</div>
              <div class="history-time">2023-09-15 14:10:23</div>
              <div class="history-item">开始区域任务A</div>
              <div class="history-time">2023-09-15 14:00:05</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-page {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
}

.search-add-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.btn-primary {
  padding: 10px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-primary.full-width {
  width: 100%;
}

.device-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.device-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.table-header-cell {
  padding: 16px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.table-row {
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.table-row:hover {
  background-color: #fafafa;
}

.table-cell {
  padding: 16px 24px;
  font-size: 14px;
  color: #333;
}

.action-cell {
  text-align: right;
}

.btn-view {
  color: #1890ff;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  margin-right: 16px;
}

.btn-edit {
  color: #faad14;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  margin-right: 16px;
}

.btn-delete {
  color: #f5222d;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-running {
  background-color: #52c41a;
}

.status-standby {
  background-color: #faad14;
}

.status-fault {
  background-color: #f5222d;
}

.device-details-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.detail-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.sensor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensor-name {
  font-size: 14px;
  color: #333;
}

.preset-commands {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preset-title {
  background-color: #f5f5f5;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.preset-command-btn {
  width: 100%;
  text-align: left;
  padding: 16px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.3s;
}

.preset-command-btn:hover {
  background-color: #fafafa;
}



.command-history {
  margin-top: 24px;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  font-size: 12px;
  color: #666;
}

.history-time {
  font-size: 12px;
  color: #999;
}
</style>
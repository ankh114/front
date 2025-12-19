<script setup>
import { ref } from 'vue'

const tasks = ref([
  {
    id: 'TASK-001',
    name: '厂区巡检任务',
    status: '进行中',
    priority: '高',
    startTime: '2023-06-15 08:30',
    endTime: '2023-06-15 12:00',
    robot: 'ROBOT-001'
  },
  {
    id: 'TASK-002',
    name: '仓库巡检任务',
    status: '待执行',
    priority: '中',
    startTime: '2023-06-15 14:00',
    endTime: '2023-06-15 16:30',
    robot: 'ROBOT-002'
  },
  {
    id: 'TASK-003',
    name: '园区巡检任务',
    status: '已完成',
    priority: '低',
    startTime: '2023-06-14 09:00',
    endTime: '2023-06-14 11:30',
    robot: 'ROBOT-003'
  }
])

const currentTask = ref(tasks.value[0])
</script>

<template>
  <div class="task-page">
    <h2 class="page-title">任务规划</h2>
    
    <div class="page-header">
      <div class="button-group">
        <button class="btn-primary">新建任务</button>
        <button class="btn-secondary">导入任务</button>
      </div>
      <div class="search-box">
        <input type="text" placeholder="搜索任务" class="search-input">
        <i class="fa fa-search search-icon"></i>
      </div>
    </div>
    
    <div class="page-grid">
      <!-- 任务列表 -->
      <div class="task-list-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">任务列表</h3>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>任务编号</th>
                    <th>任务名称</th>
                    <th>状态</th>
                    <th>优先级</th>
                    <th>执行时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in tasks" :key="task.id" class="table-row">
                    <td>{{ task.id }}</td>
                    <td>{{ task.name }}</td>
                    <td>
                      <span :class="['status-badge', task.status.toLowerCase().replace(' ', '-')]">
                        {{ task.status }}
                      </span>
                    </td>
                    <td>
                      <span :class="['priority-badge', task.priority.toLowerCase()]">
                        {{ task.priority }}
                      </span>
                    </td>
                    <td>{{ task.startTime }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn view-btn">查看</button>
                        <button class="action-btn start-btn">启动</button>
                        <button class="action-btn delete-btn">删除</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 任务详情 -->
      <div class="task-detail-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">任务详情</h3>
          </div>
          <div class="card-body">
            <div class="detail-section">
              <h4 class="detail-title">任务信息</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <span class="detail-label">任务编号</span>
                  <span class="detail-value">{{ currentTask.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">任务名称</span>
                  <span class="detail-value">{{ currentTask.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">执行机器人</span>
                  <span class="detail-value">{{ currentTask.robot }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">执行时间</span>
                  <span class="detail-value">{{ currentTask.startTime }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">任务状态</h4>
              <div class="detail-content">
                <div class="status-info">
                  <i class="fa fa-circle status-icon"></i>
                  <span class="status-text">{{ currentTask.status }}</span>
                </div>
                <div class="progress-section">
                  <div class="progress-label">任务进度</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 65%"></div>
                  </div>
                  <div class="progress-text">65%</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">操作日志</h4>
              <div class="detail-content log-content">
                <div class="log-item">2023-06-15 08:30: 任务启动</div>
                <div class="log-item">2023-06-15 09:15: 到达巡检点A</div>
                <div class="log-item">2023-06-15 10:00: 到达巡检点B</div>
              </div>
            </div>
            
            <div class="detail-section">
              <button class="btn-primary full-width">暂停任务</button>
              <button class="btn-secondary full-width">结束任务</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-page {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: #e6e6e6;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.task-list-section {
  grid-column: span 8;
}

.task-detail-section {
  grid-column: span 4;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  background-color: #fafafa;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-body {
  padding: 16px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #fafafa;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  border-bottom: 1px solid #eee;
}

.data-table tbody tr:hover {
  background-color: #fafafa;
}

.data-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.进行中 {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-badge.待执行 {
  background-color: #f5f5f5;
  color: #333;
}

.status-badge.已完成 {
  background-color: #f6ffed;
  color: #52c41a;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-badge.高 {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.priority-badge.中 {
  background-color: #fffbe6;
  color: #faad14;
}

.priority-badge.低 {
  background-color: #f6ffed;
  color: #52c41a;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.view-btn {
  color: #1890ff;
}

.view-btn:hover {
  color: #40a9ff;
}

.start-btn {
  color: #52c41a;
}

.start-btn:hover {
  color: #73d13d;
}

.delete-btn {
  color: #ff4d4f;
}

.delete-btn:hover {
  color: #ff7875;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.detail-content {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-icon {
  color: #1890ff;
  font-size: 12px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.progress-section {
  margin-top: 16px;
}

.progress-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  border-radius: 4px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.log-content {
  padding: 12px;
}

.log-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.log-item:last-child {
  margin-bottom: 0;
}

.full-width {
  width: 100%;
  margin-bottom: 8px;
}

.full-width:last-child {
  margin-bottom: 0;
}
</style>
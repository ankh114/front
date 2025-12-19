<script setup>
import { ref } from 'vue'

const issues = ref([
  {
    id: 'ISSUE-001',
    title: '摄像头画面模糊',
    severity: '中等',
    status: '待处理',
    robot: 'ROBOT-001',
    time: '2023-06-15 09:25',
    description: '厂区巡检时摄像头画面模糊，影响巡检效果'
  },
  {
    id: 'ISSUE-002',
    title: '无线信号不稳定',
    severity: '紧急',
    status: '处理中',
    robot: 'ROBOT-002',
    time: '2023-06-15 10:10',
    description: '仓库区域无线信号弱，导致数据传输中断'
  },
  {
    id: 'ISSUE-003',
    title: '电量消耗过快',
    severity: '低',
    status: '已处理',
    robot: 'ROBOT-003',
    time: '2023-06-14 14:30',
    description: '巡检过程中电量消耗速度超出正常范围'
  }
])

const currentIssue = ref(issues.value[0])
</script>

<template>
  <div class="issue-page">
    <h2 class="page-title">问题管理</h2>
    
    <div class="page-header">
      <div class="button-group">
        <button class="btn-primary">新建问题</button>
        <button class="btn-secondary">导出报表</button>
      </div>
      <div class="search-box">
        <input type="text" placeholder="搜索问题" class="search-input">
        <i class="fa fa-search search-icon"></i>
      </div>
    </div>
    
    <div class="page-grid">
      <!-- 问题列表 -->
      <div class="issue-list-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">问题列表</h3>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>问题编号</th>
                    <th>问题标题</th>
                    <th>严重程度</th>
                    <th>状态</th>
                    <th>上报时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="issue in issues" :key="issue.id" class="table-row">
                    <td>{{ issue.id }}</td>
                    <td>{{ issue.title }}</td>
                    <td>
                      <span :class="['severity-badge', issue.severity.toLowerCase().replace(' ', '-')]">
                        {{ issue.severity }}
                      </span>
                    </td>
                    <td>
                      <span :class="['status-badge', issue.status.toLowerCase().replace(' ', '-')]">
                        {{ issue.status }}
                      </span>
                    </td>
                    <td>{{ issue.time }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn view-btn">查看</button>
                        <button class="action-btn process-btn">处理</button>
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
      
      <!-- 问题详情 -->
      <div class="issue-detail-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">问题详情</h3>
          </div>
          <div class="card-body">
            <div class="detail-section">
              <h4 class="detail-title">问题信息</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <span class="detail-label">问题编号</span>
                  <span class="detail-value">{{ currentIssue.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">问题标题</span>
                  <span class="detail-value">{{ currentIssue.title }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">涉及机器人</span>
                  <span class="detail-value">{{ currentIssue.robot }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">上报时间</span>
                  <span class="detail-value">{{ currentIssue.time }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">问题描述</h4>
              <div class="detail-content description-content">
                <p class="description-text">{{ currentIssue.description }}</p>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">处理状态</h4>
              <div class="detail-content status-content">
                <div class="status-info">
                  <i class="fa fa-circle status-icon"></i>
                  <span class="status-text">{{ currentIssue.status }}</span>
                </div>
                <div class="progress-buttons">
                  <div class="progress-label">处理进度</div>
                  <div class="button-group">
                    <button class="progress-btn">未处理</button>
                    <button class="progress-btn active">处理中</button>
                    <button class="progress-btn">已解决</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">处理日志</h4>
              <div class="detail-content log-content">
                <div class="log-item">2023-06-15 09:25: 问题上报</div>
                <div class="log-item">2023-06-15 09:30: 技术人员已确认</div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="detail-title">处理备注</h4>
              <textarea class="remark-input" rows="3" placeholder="输入处理备注..."></textarea>
            </div>
            
            <div class="detail-section">
              <button class="btn-primary full-width">保存备注</button>
              <button class="btn-secondary full-width">标记为已解决</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-page {
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

.issue-list-section {
  grid-column: span 8;
}

.issue-detail-section {
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

.severity-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.severity-badge.紧急 {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.severity-badge.中等 {
  background-color: #fffbe6;
  color: #faad14;
}

.severity-badge.低 {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.待处理 {
  background-color: #f5f5f5;
  color: #333;
}

.status-badge.处理中 {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-badge.已处理 {
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

.process-btn {
  color: #52c41a;
}

.process-btn:hover {
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

.description-content {
  padding: 12px;
}

.description-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.status-content {
  padding: 12px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-icon {
  color: #999;
  font-size: 12px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.progress-buttons {
  margin-top: 16px;
}

.progress-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.progress-buttons .button-group {
  gap: 8px;
}

.progress-btn {
  background-color: #f0f0f0;
  color: #666;
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.progress-btn:hover {
  background-color: #e6e6e6;
}

.progress-btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #1890ff;
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

.remark-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
}

.remark-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.full-width {
  width: 100%;
  margin-bottom: 8px;
}

.full-width:last-child {
  margin-bottom: 0;
}
</style>
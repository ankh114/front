<script setup>
import { ref } from 'vue'
import MapMonitor from './components/MapMonitor.vue'
import DeviceManagement from './components/DeviceManagement.vue'
import TaskPlanning from './components/TaskPlanning.vue'
import IssueManagement from './components/IssueManagement.vue'

const activePage = ref('device')

const switchPage = (page) => {
  activePage.value = page
}

const pageComponents = {
  map: MapMonitor,
  device: DeviceManagement,
  task: TaskPlanning,
  issue: IssueManagement
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <h1 class="app-title">无人巡检小车监控平台</h1>
      </div>
      
      <div class="header-right">
        <!-- 页面导航 -->
        <nav class="nav">
          <button 
            @click="switchPage('map')"
            :class="['nav-btn', activePage === 'map' ? 'active' : '']"
          >
            地图监控
          </button>
          <button 
            @click="switchPage('device')"
            :class="['nav-btn', activePage === 'device' ? 'active' : '']"
          >
            设备管理
          </button>
          <button 
            @click="switchPage('task')"
            :class="['nav-btn', activePage === 'task' ? 'active' : '']"
          >
            任务规划
          </button>
          <button 
            @click="switchPage('issue')"
            :class="['nav-btn', activePage === 'issue' ? 'active' : '']"
          >
            问题管理
          </button>
        </nav>
        
        <!-- 用户信息 -->
        <div class="user-info">
          <span class="user-name">管理员</span>
          <div class="user-avatar">
            <i class="fa fa-user"></i>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">地图控制</h3>
          <div class="sidebar-item">
            <i class="fa fa-location-arrow"></i>
            <span>定位小车</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-refresh"></i>
            <span>刷新地图</span>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="section-title">小车状态</h3>
          <div class="sidebar-item">
            <i class="fa fa-video-camera"></i>
            <span>摄像头画面</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-bolt"></i>
            <span>电量信息</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-tachometer"></i>
            <span>运行速度</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-signal"></i>
            <span>信号强度</span>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3 class="section-title">系统设置</h3>
          <div class="sidebar-item">
            <i class="fa fa-cog"></i>
            <span>系统配置</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-history"></i>
            <span>操作日志</span>
          </div>
          <div class="sidebar-item">
            <i class="fa fa-question-circle"></i>
            <span>帮助中心</span>
          </div>
        </div>
      </aside>

      <!-- 页面内容区 -->
      <div class="page-content">
        <component :is="pageComponents[activePage]" />
      </div>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, sans-serif;
}

.header {
  height: 64px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.nav-btn.active {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: #666666;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #ffffff;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  padding: 24px 0;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #999999;
  text-transform: uppercase;
  padding: 0 24px;
  margin-bottom: 12px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #666666;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sidebar-item:hover {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.sidebar-item i {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

.page-content {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  background-color: #f5f5f5;
}
</style>
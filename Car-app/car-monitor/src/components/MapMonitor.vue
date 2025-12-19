<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Cesium地图初始化
  if (typeof Cesium !== 'undefined') {
    // 移除访问令牌，使用默认的Bing地图
    const viewer = new Cesium.Viewer('cesiumContainer', {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      geocoder: false,
      imageryProvider: new Cesium.BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: 'AnzHf5wO4aZ-H3204WJnJ3GfX4XlZfX4XlZfX4XlZfX4XlZfX4XlZfX4XlZfX4XlZfX4XlZfX4XlZfX4',
        mapStyle: Cesium.BingMapsStyle.AERIAL
      })
    })
    
    // 设置初始视图
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 1000)
    })
  }
})
</script>

<template>
  <div class="map-page">
    <!-- 地图容器 -->
    <div id="cesiumContainer" class="map-container"></div>
    
    <!-- 右侧信息面板 -->
    <div class="info-panel">
      <!-- 摄像头画面 -->
      <div class="panel-section">
        <h3 class="panel-title">摄像头画面</h3>
        <div class="camera-grid">
          <div class="camera-item">
            <img src="https://picsum.photos/id/906/300/200" alt="摄像头1" class="camera-img">
            <span class="camera-label">前视</span>
          </div>
          <div class="camera-item">
            <img src="https://picsum.photos/id/153/300/200" alt="摄像头2" class="camera-img">
            <span class="camera-label">后视</span>
          </div>
          <div class="camera-item">
            <img src="https://picsum.photos/id/582/300/200" alt="摄像头3" class="camera-img">
            <span class="camera-label">左视</span>
          </div>
          <div class="camera-item">
            <img src="https://picsum.photos/id/959/300/200" alt="摄像头4" class="camera-img">
            <span class="camera-label">右视</span>
          </div>
        </div>
      </div>
      
      <!-- 小车状态 -->
      <div class="panel-section">
        <h3 class="panel-title">小车状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">电量</div>
            <div class="status-value">
              <i class="fa fa-battery-three-quarters text-success"></i>
              <span class="battery-percentage">78%</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">速度</div>
            <div class="status-value">
              <i class="fa fa-tachometer text-primary"></i>
              <span class="vehicle-speed">0.8 m/s</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">温度</div>
            <div class="status-value">
              <i class="fa fa-thermometer-half text-warning"></i>
              <span class="temperature">25°C</span>
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">信号</div>
            <div class="status-value">
              <i class="fa fa-signal text-success"></i>
              <span class="signal-strength">-55 dBm</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 巡检路线 -->
      <div class="panel-section route-section">
        <h3 class="panel-title">巡检路线</h3>
        <div class="route-list">
          <div class="route-item completed">
            <div class="route-header">
              <span class="route-name">巡检点 A</span>
              <span class="route-status">已完成</span>
            </div>
            <div class="route-coordinate">坐标: 116.3974, 39.9092</div>
          </div>
          <div class="route-item in-progress">
            <div class="route-header">
              <span class="route-name">巡检点 B</span>
              <span class="route-status">进行中</span>
            </div>
            <div class="route-coordinate">坐标: 116.3980, 39.9098</div>
          </div>
          <div class="route-item pending">
            <div class="route-header">
              <span class="route-name">巡检点 C</span>
              <span class="route-status">待执行</span>
            </div>
            <div class="route-coordinate">坐标: 116.3985, 39.9102</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 32px);
}

.panel-section {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  border-bottom: none;
  flex: 1;
  overflow-y: auto;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.camera-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 3/2;
  background-color: #f5f5f5;
}

.camera-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-label {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}

.status-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.text-success {
  color: #52c41a;
}

.text-primary {
  color: #1890ff;
}

.text-warning {
  color: #faad14;
}

.route-section {
  padding: 12px;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.route-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.route-status {
  font-size: 12px;
  font-weight: 500;
}

.route-item.completed .route-status {
  color: #52c41a;
}

.route-item.in-progress .route-status {
  color: #1890ff;
}

.route-item.pending .route-status {
  color: #999;
}

.route-coordinate {
  font-size: 12px;
  color: #666;
}
</style>
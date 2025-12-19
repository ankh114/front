<template>
  <div class="w-full h-full">
    <!-- 地图容器 -->
    <div id="cesiumContainer" class="w-full h-full"></div>
    
    <!-- 右侧信息面板 -->
    <div class="absolute right-4 top-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100%-32px)]">
      <!-- 摄像头画面 -->
      <div class="p-3 border-b">
        <h3 class="font-medium mb-2">摄像头画面</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=1" alt="前视摄像头" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">前视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=2" alt="后视摄像头" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">后视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=3" alt="左视摄像头" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">左视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=4" alt="右视摄像头" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">右视</span>
          </div>
        </div>
      </div>
      
      <!-- 小车状态 -->
      <div class="p-3 border-b">
        <h3 class="font-medium mb-2">小车状态</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">电量</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-battery-three-quarters text-success"></i>
              <span class="font-medium battery-percentage">78%</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">速度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-tachometer text-primary"></i>
              <span class="font-medium vehicle-speed">0.8 m/s</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">温度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-thermometer-half text-warning"></i>
              <span class="font-medium vehicle-temperature">32°C</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">信号</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-signal text-success"></i>
              <span class="font-medium signal-strength">92%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 实时警报 -->
      <div class="flex-1 overflow-y-auto p-3">
        <h3 class="font-medium mb-2 flex justify-between">
          <span>实时警报</span>
          <span class="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">3条新消息</span>
        </h3>
        <div class="space-y-2 alert-container">
          <div class="bg-danger/10 p-2 rounded border-l-4 border-danger">
            <div class="text-sm font-medium">检测到障碍物</div>
            <div class="text-xs text-gray-500 mt-1">2023-06-15 14:32:15</div>
          </div>
          <div class="bg-warning/10 p-2 rounded border-l-4 border-warning">
            <div class="text-sm font-medium">左前轮异常振动</div>
            <div class="text-xs text-gray-500 mt-1">2023-06-15 14:28:42</div>
          </div>
          <div class="bg-primary/10 p-2 rounded border-l-4 border-primary">
            <div class="text-sm font-medium">到达检查点A</div>
            <div class="text-xs text-gray-500 mt-1">2023-06-15 14:25:10</div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="p-3 border-t flex gap-2">
        <button class="flex-1 btn-primary" id="start-vehicle">
          <i class="fa fa-play mr-1"></i> 启动
        </button>
        <button class="flex-1 btn-outline" id="pause-vehicle">
          <i class="fa fa-pause mr-1"></i> 暂停
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 初始化Cesium地图
onMounted(() => {
  // 等待Cesium加载完成
  if (window.Cesium) {
    const viewer = new window.Cesium.Viewer('cesiumContainer', {
      terrainProvider: window.Cesium.createWorldTerrain(),
      baseLayerPicker: false, // 隐藏图层选择器
      geocoder: false // 隐藏地址搜索
    })
    
    // 定位到默认位置（示例：北京）
    viewer.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(116.39, 39.9, 1500)
    })
  } else {
    console.error('Cesium库加载失败')
  }
})
</script>
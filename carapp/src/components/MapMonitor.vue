<template>
  <div class="page-content" id="map-page">
    <!-- 地图容器 -->
    <div id="cesiumContainer" class="w-full h-full"></div>
    
    <!-- 右侧信息面板 -->
    <div class="absolute right-4 top-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100%-32px)]">
      <!-- 摄像头画面 -->
      <div class="p-3 border-b">
        <h3 class="font-medium mb-2">摄像头画面</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=1" alt="摄像头1" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">前视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=2" alt="摄像头2" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">后视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=3" alt="摄像头3" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">左视</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative">
            <img src="https://picsum.photos/300/200?random=4" alt="摄像头4" class="w-full h-full object-cover">
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
              <span class="font-medium battery-percentage">{{ vehicleStatus.battery }}%</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">速度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-tachometer text-primary"></i>
              <span class="font-medium vehicle-speed">{{ vehicleStatus.speed.toFixed(1) }} m/s</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">温度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-thermometer-half text-warning"></i>
              <span class="font-medium vehicle-temperature">{{ vehicleStatus.temperature }}°C</span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">信号</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-signal text-success"></i>
              <span class="font-medium signal-strength">{{ vehicleStatus.signal }}%</span>
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
        <button class="flex-1 btn-primary" id="start-vehicle" @click="startVehicle">
          <i class="fa fa-play mr-1"></i> 启动
        </button>
        <button class="flex-1 btn-outline" id="pause-vehicle" @click="pauseVehicle">
          <i class="fa fa-pause mr-1"></i> 暂停
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

let viewer = null
let statusUpdateInterval = null

const vehicleStatus = ref({
  battery: 78,
  speed: 0.8,
  temperature: 32,
  signal: 92,
  status: 'running'
})

onMounted(() => {
  initMainMap()
})

onUnmounted(() => {
  // 清理Cesium实例
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
  // 清理状态更新定时器
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
  }
})

const initMainMap = () => {
  if (!window.Cesium) {
    console.error('Cesium library not loaded')
    return
  }
  
  try {
    viewer = new window.Cesium.Viewer('cesiumContainer', {
      imageryProvider: new window.Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      }),
      baseLayerPicker: false,
      geocoder: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      navigationOptions: {
        enableZoom: true
      }
    })
    
    viewer.camera.setView({
      destination: window.Cesium.Cartesian3.fromDegrees(120.0, 30.0, 500.0)
    })
    
    const robotEntity = viewer.entities.add({
      name: 'ROBOT-001',
      position: window.Cesium.Cartesian3.fromDegrees(120.0, 30.0, 0),
      point: {
        pixelSize: 10,
        color: window.Cesium.Color.RED,
        outlineColor: window.Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: 'ROBOT-001 (运行中)',
        font: '14px sans-serif',
        fillColor: window.Cesium.Color.WHITE,
        outlineColor: window.Cesium.Color.BLACK,
        outlineWidth: 2,
        style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new window.Cesium.Cartesian2(0, 20),
        heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    
    const pathPositions = [
      window.Cesium.Cartesian3.fromDegrees(120.0, 30.0, 0),
      window.Cesium.Cartesian3.fromDegrees(120.0005, 30.0003, 0),
      window.Cesium.Cartesian3.fromDegrees(120.001, 30.0005, 0),
      window.Cesium.Cartesian3.fromDegrees(120.0015, 30.0002, 0)
    ]
    
    const path = viewer.entities.add({
      polyline: {
        positions: pathPositions,
        width: 3,
        material: window.Cesium.Color.BLUE,
        clampToGround: true
      }
    })
    
    const checkPoint = viewer.entities.add({
      name: '检查点A',
      position: window.Cesium.Cartesian3.fromDegrees(120.0015, 30.0002, 0),
      point: {
        pixelSize: 8,
        color: window.Cesium.Color.GREEN,
        outlineColor: window.Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: '检查点A',
        font: '12px sans-serif',
        fillColor: window.Cesium.Color.WHITE,
        outlineColor: window.Cesium.Color.BLACK,
        outlineWidth: 1,
        pixelOffset: new window.Cesium.Cartesian2(0, 15)
      }
    })
    
    startVehicleStatusUpdate()
  } catch (error) {
    console.error('Failed to initialize Cesium viewer:', error)
  }
}

const updateVehicleStatusDisplay = () => {
  const batteryIcon = document.querySelector('.fa-battery-three-quarters')
  if (vehicleStatus.value.battery < 20) {
    batteryIcon.className = 'fa fa-battery-empty text-danger'
  } else if (vehicleStatus.value.battery < 50) {
    batteryIcon.className = 'fa fa-battery-half text-warning'
  } else {
    batteryIcon.className = 'fa fa-battery-three-quarters text-success'
  }
  
  const tempIcon = document.querySelector('.fa-thermometer-half')
  if (vehicleStatus.value.temperature > 40) {
    tempIcon.className = 'fa fa-thermometer-full text-danger'
  } else if (vehicleStatus.value.temperature > 35) {
    tempIcon.className = 'fa fa-thermometer-three-quarters text-warning'
  } else {
    tempIcon.className = 'fa fa-thermometer-half text-warning'
  }
  
  const signalIcon = document.querySelector('.fa-signal')
  if (vehicleStatus.value.signal < 30) {
    signalIcon.className = 'fa fa-signal text-danger'
  } else if (vehicleStatus.value.signal < 60) {
    signalIcon.className = 'fa fa-signal text-warning'
  } else {
    signalIcon.className = 'fa fa-signal text-success'
  }
}

const fetchVehicleStatusFromROS = () => {
  vehicleStatus.value.battery = Math.max(20, vehicleStatus.value.battery - (Math.random() * 0.5))
  vehicleStatus.value.speed = Math.max(0, Math.min(2, vehicleStatus.value.speed + (Math.random() * 0.2 - 0.1)))
  vehicleStatus.value.temperature = Math.max(25, Math.min(45, vehicleStatus.value.temperature + (Math.random() * 0.4 - 0.2)))
  vehicleStatus.value.signal = Math.max(50, Math.min(100, vehicleStatus.value.signal + (Math.random() * 2 - 1)))
  
  updateVehicleStatusDisplay()
}

const startVehicleStatusUpdate = () => {
  fetchVehicleStatusFromROS()
  statusUpdateInterval = setInterval(() => {
    fetchVehicleStatusFromROS()
  }, 2000)
}

const startVehicle = () => {
  vehicleStatus.value.status = 'running'
  startVehicleStatusUpdate()
  sendCommandToROS('start')
}

const pauseVehicle = () => {
  vehicleStatus.value.status = 'paused'
  sendCommandToROS('pause')
}

const sendCommandToROS = (command) => {
  console.log(`发送指令到ROS: ${command}`)
}

// 定位小车
const locateTrolley = () => {
  if (!viewer) return
  
  // 将地图视图定位到小车位置
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(120.0, 30.0, 500.0),
    duration: 1.5
  })
}

// 刷新地图并恢复初始大小
const refreshMap = () => {
  if (!viewer) return
  
  // 恢复地图初始视图
  viewer.camera.setView({
    destination: window.Cesium.Cartesian3.fromDegrees(120.0, 30.0, 500.0)
  })
}

// 暴露方法给父组件
defineExpose({
  locateTrolley,
  refreshMap
})
</script>

<style scoped>
#map-page {
  height: 100%;
  width: 100%;
  position: relative;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
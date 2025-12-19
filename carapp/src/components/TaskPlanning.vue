<template>
  <div class="page-content" id="task-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">任务规划与调度</h2>
        <div class="flex gap-3">
          <button class="btn-primary">
            <i class="fa fa-plus mr-1"></i> 新建任务
          </button>
          <button class="btn-outline">
            <i class="fa fa-play mr-1"></i> 开始任务
          </button>
          <button class="btn-outline">
            <i class="fa fa-pause mr-1"></i> 暂停任务
          </button>
          <button class="btn-outline">
            <i class="fa fa-play-circle mr-1"></i> 继续任务
          </button>
          <button class="btn-outline">
            <i class="fa fa-times mr-1"></i> 取消任务
          </button>
        </div>
      </div>
      
      <!-- 任务规划内容区 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧任务列表 -->
        <div class="w-80 border-r overflow-y-auto">
          <div class="p-4">
            <div class="relative">
              <select class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white">
                <option>所有任务</option>
                <option>进行中</option>
                <option>待执行</option>
                <option>已完成</option>
                <option>已取消</option>
              </select>
              <i class="fa fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <div class="mt-4 space-y-1">
              <button class="w-full text-left sidebar-item active">
                <i class="fa fa-list w-5 text-center"></i>
                <span>所有任务</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-play-circle w-5 text-center"></i>
                <span>进行中</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-clock-o w-5 text-center"></i>
                <span>待执行</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-check-circle w-5 text-center"></i>
                <span>已完成</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-times-circle w-5 text-center"></i>
                <span>已取消</span>
              </button>
            </div>
          </div>
          
          <div class="border-t p-4">
            <h3 class="text-sm font-medium mb-3">任务列表</h3>
            <div class="space-y-2">
              <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg cursor-pointer">
                <div class="font-medium text-sm">区域A日常巡检</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-001 · 进行中</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 14:00-16:00</div>
              </div>
              
              <div class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <div class="font-medium text-sm">区域B设备检查</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-002 · 待执行</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 16:30-17:30</div>
              </div>
              
              <div class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <div class="font-medium text-sm">区域C夜间巡逻</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-003 · 已取消</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 20:00-22:00</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧地图和路径规划 -->
        <div class="flex-1 flex flex-col">
          <!-- 路径规划工具栏 -->
          <div class="bg-white border-b p-3 flex items-center gap-3">
            <button class="btn-outline text-sm">
              <i class="fa fa-mouse-pointer mr-1"></i> 点选模式
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-arrows mr-1"></i> 多边形模式
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-repeat mr-1"></i> 自动规划
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-trash mr-1"></i> 清除路径
            </button>
            <div class="ml-auto">
              <button class="btn-primary text-sm">
                <i class="fa fa-save mr-1"></i> 保存路径
              </button>
              <button class="btn-outline text-sm ml-2">
                <i class="fa fa-upload mr-1"></i> 导入地图
              </button>
            </div>
          </div>
          
          <!-- 路径规划地图 -->
          <div class="flex-1" id="task-map-container"></div>
          
          <!-- 任务参数设置 -->
          <div class="bg-white border-t p-4">
            <h3 class="font-medium mb-3">任务参数设置</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">任务名称</label>
                <input type="text" value="区域A日常巡检" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">执行设备</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>ROBOT-001</option>
                  <option>ROBOT-002</option>
                  <option>ROBOT-003</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">开始时间</label>
                <input type="datetime-local" value="2023-06-15T14:00" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">结束时间</label>
                <input type="datetime-local" value="2023-06-15T16:00" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">巡检模式</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>快速巡检</option>
                  <option>精细巡检</option>
                  <option>重点区域巡检</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">移动速度</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>低速 (0.5m/s)</option>
                  <option>中速 (1.0m/s)</option>
                  <option>高速 (1.5m/s)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">传感器配置</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>全传感器开启</option>
                  <option>仅雷达</option>
                  <option>仅摄像头</option>
                </select>
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-xs text-gray-500 mb-1">任务描述</label>
              <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-16" placeholder="输入任务描述...">对区域A进行日常巡检，重点检查设备运行状态和安全隐患，每30分钟上报一次数据。</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let viewer = null

onMounted(() => {
  initTaskMap()
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})

const initTaskMap = () => {
  if (!window.Cesium) {
    console.error('Cesium library not loaded')
    return
  }
  
  try {
    viewer = new window.Cesium.Viewer('task-map-container', {
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
    
    const taskArea = viewer.entities.add({
      name: '巡检区域',
      polygon: {
        hierarchy: window.Cesium.Cartesian3.fromDegreesArray([
          119.999, 29.999,
          120.002, 29.999,
          120.002, 30.002,
          119.999, 30.002
        ]),
        material: new window.Cesium.ColorMaterialProperty(window.Cesium.Color.BLUE.withAlpha(0.1)),
        outline: true,
        outlineColor: window.Cesium.Color.BLUE
      }
    })
    
    const plannedPath = viewer.entities.add({
      polyline: {
        positions: window.Cesium.Cartesian3.fromDegreesArray([
          120.0, 30.0,
          120.0005, 30.0,
          120.0005, 30.0005,
          120.001, 30.0005,
          120.001, 30.001,
          120.0015, 30.001,
          120.0015, 30.0015,
          120.0, 30.0015,
          120.0, 30.0
        ]),
        width: 4,
        material: new window.Cesium.PolylineDashMaterialProperty({
          color: window.Cesium.Color.GREEN
        }),
        clampToGround: true
      }
    })
    
    const waypoints = [
      { lon: 120.0, lat: 30.0, name: '起点' },
      { lon: 120.001, lat: 30.0005, name: '检查点1' },
      { lon: 120.0015, lat: 30.001, name: '检查点2' },
      { lon: 120.0015, lat: 30.0015, name: '检查点3' },
      { lon: 120.0, lat: 30.0015, name: '检查点4' },
      { lon: 120.0, lat: 30.0, name: '终点' }
    ]
    
    waypoints.forEach((point, index) => {
      viewer.entities.add({
        name: point.name,
        position: window.Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 0),
        point: {
          pixelSize: 8,
          color: index === 0 || index === waypoints.length - 1 ? window.Cesium.Color.RED : window.Cesium.Color.YELLOW,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: point.name,
          font: '12px sans-serif',
          fillColor: window.Cesium.Color.WHITE,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 1,
          pixelOffset: new window.Cesium.Cartesian2(0, 15)
        }
      })
    })
  } catch (error) {
    console.error('Failed to initialize Cesium viewer:', error)
  }
}
</script>

<style scoped>
#task-page {
  height: 100%;
  width: 100%;
}

#task-map-container {
  width: 100%;
  height: 100%;
}
</style>
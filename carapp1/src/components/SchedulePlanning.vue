<template>
  <div class="page-content" id="schedule-page">
    <!-- 保存成功消息 -->
    <div v-if="savedMessage" class="saved-message">
      {{ savedMessage }}
    </div>
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-bold">定时任务管理</h2>
        <div class="flex gap-2">
          <button class="btn-primary text-sm px-4 py-2" @click="showNewScheduleModal = true">
            <i class="fa fa-plus mr-1"></i> 新建定时任务
          </button>
        </div>
      </div>
      
      <!-- 统计卡片 -->
      <div class="p-4 bg-white border-b">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-600 font-medium">总任务数</p>
                <p class="text-2xl font-bold text-blue-800 mt-1">{{ schedules.length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fa fa-tasks text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 border border-green-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-green-600 font-medium">已启用</p>
                <p class="text-2xl font-bold text-green-800 mt-1">{{ schedules.filter(s => s.is_active).length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <i class="fa fa-play-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-yellow-600 font-medium">已禁用</p>
                <p class="text-2xl font-bold text-yellow-800 mt-1">{{ schedules.filter(s => !s.is_active).length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <i class="fa fa-pause-circle text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-purple-600 font-medium">今日任务</p>
                <p class="text-2xl font-bold text-purple-800 mt-1">{{ todaySchedules }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <i class="fa fa-calendar-check text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--管理内容区 -->
      <div class="flex-1 overflow-hidden">
        <!-- 任务列表视图 -->
        <div v-if="!selectedSchedule" class="h-full flex flex-col">
          <div class="p-4 bg-gray-50 border-b">
            <div class="relative">
              <select v-model="filterStatus" class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white shadow-sm">
                <option value="">所有任务</option>
                <option value="active">已启用</option>
                <option value="inactive">已禁用</option>
              </select>
              <i class="fa fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div class="flex-1 overflow-x-auto overflow-y-auto">
            <!-- 确保表格有足够的宽度来显示所有列 -->
            <table class="w-full border-collapse min-w-[520px]">
              <thead>
                <tr class="bg-primary text-white">
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[120px]">任务名称</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[90px]">执行小车</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[280px]">执行时间</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[80px]">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 whitespace-nowrap">
                <tr 
                  v-for="schedule in filteredSchedules" 
                  :key="schedule.id"
                  :class="[
                    'cursor-pointer hover:bg-primary/5 transition-all duration-200',
                    selectedSchedule && selectedSchedule.id === schedule.id ? 'bg-primary/10 ring-2 ring-primary/30' : '',
                    schedule.is_active ? 'bg-green-50 !important' : 'bg-gray-50 !important'
                  ]"
                  @click="selectSchedule(schedule)"
                >
                  <td class="px-6 py-4 text-sm font-medium text-gray-800 min-w-[120px] whitespace-nowrap">
                    {{ schedule.name }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 min-w-[90px] whitespace-nowrap">
                    {{ getCarNameById(schedule.default_car_id) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 min-w-[280px] whitespace-nowrap">
                    {{ formatTime(schedule.run_time) }}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap">
                    <button 
                      class="text-blue-600 hover:text-blue-800 focus:outline-none mr-3"
                      @click.stop="editSchedule(schedule)"
                      title="编辑任务"
                    >
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button 
                      class="text-red-600 hover:text-red-800 focus:outline-none"
                      @click.stop="deleteSchedule(schedule)"
                      title="删除任务"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 任务详情视图 -->
        <div v-else class="h-full flex flex-col">
          <!-- 任务详情头部 -->
          <div class="bg-white border-b p-4 flex items-center justify-between">
            <div class="flex items-center">
              <button class="btn-outline text-sm px-4 py-2 mr-4" @click="deselectSchedule">
                <i class="fa fa-arrow-left mr-1"></i> 返回任务列表
              </button>
              <h3 class="text-lg font-medium">{{ selectedSchedule.name }}</h3>

            </div>
            <div class="flex items-center gap-2">

              <button class="btn-outline text-sm px-4 py-2" @click="togglePauseResume">
                <i class="fa fa-pause mr-1" v-if="selectedSchedule.is_active"></i>
                <i class="fa fa-play-circle mr-1" v-else-if="!selectedSchedule.is_active"></i>
                {{ selectedSchedule.is_active ? '暂停任务' : '继续任务' }}
              </button>
              <button class="btn-outline text-sm px-4 py-2" @click="completeTask">
                <i class="fa fa-check-circle mr-1"></i> 完成任务
              </button>
              <button class="btn-outline text-sm px-4 py-2 text-red-600 border-red-300 hover:bg-red-50" @click="deleteSchedule(selectedSchedule)">
                <i class="fa fa-trash mr-1"></i> 删除任务
              </button>
            </div>
          </div>
          
          <!-- 路径规划工具栏 -->
          <div class="bg-white border-b p-2 flex items-center gap-2">
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('point')">
              <i class="fa fa-mouse-pointer mr-1"></i> 点选模式
            </button>
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('polygon')">
              <i class="fa fa-arrows mr-1"></i> 多边形模式
            </button>
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('auto')">
              <i class="fa fa-repeat mr-1"></i> 自动规划
            </button>
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('clear')">
              <i class="fa fa-trash mr-1"></i> 清除路径
            </button>
            <button class="btn-primary text-sm px-4 py-2" @click="showCurrentTaskPath">
              <i class="fa fa-map-marker mr-1"></i> 显示路径
            </button>
            <button class="btn-primary text-sm px-4 py-2" @click="savePath">
              <i class="fa fa-save mr-1"></i> 保存路径
            </button>
          </div>
          
          <!-- 左右布局容器 -->
          <div class="flex-1 flex overflow-hidden">
            <!-- 左侧地图区域 -->
            <div class="flex-1 overflow-hidden" id="schedule-map-container"></div>
            
            <!-- 右侧任务参数区域 -->
            <div class="w-80 bg-white border-l p-4 overflow-y-auto">
              <!-- 小车实时数据 -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium">小车实时数据</h3>
                  <div class="text-xs text-gray-600">
                    当前执行：{{ selectedSchedule.default_car_id ? getCarNameById(selectedSchedule.default_car_id) : '未知' }}
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-3">
                  <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div class="text-xs text-green-600 mb-1">电量</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-battery-three-quarters text-green-600"></i>
                      <span class="font-medium">{{ isNaN(carRealTimeData.battery) ? '--%' : carRealTimeData.battery + '%' }}</span>
                      <div class="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 rounded-full" :style="{ width: isNaN(carRealTimeData.battery) ? '0%' : carRealTimeData.battery + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div class="text-xs text-blue-600 mb-1">速度</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-tachometer text-blue-600"></i>
                      <span class="font-medium">{{ isNaN(carRealTimeData.speed) ? '-- m/s' : carRealTimeData.speed + ' m/s' }}</span>
                      <div class="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" :style="{ width: isNaN(carRealTimeData.speed) ? '0%' : Math.min(carRealTimeData.speed * 20, 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div class="text-xs text-yellow-600 mb-1">温度</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-thermometer-half text-yellow-600"></i>
                      <span class="font-medium">{{ isNaN(carRealTimeData.temperature) ? '--°C' : carRealTimeData.temperature + '°C' }}</span>
                    </div>
                  </div>
                  <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <div class="text-xs text-purple-600 mb-1">信号</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-signal text-purple-600"></i>
                      <span class="font-medium">{{ isNaN(carRealTimeData.signal) ? '--%' : carRealTimeData.signal + '%' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新建/编辑定时任务模态框 -->
    <div v-if="showNewScheduleModal || editingSchedule" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium">{{ editingSchedule ? '编辑定时任务' : '新建定时任务' }}</h3>
          <button @click="closeScheduleModal" class="text-gray-400 hover:text-gray-600">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">任务名称</label>
              <input type="text" v-model="newScheduleForm.name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="输入任务名称">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">执行小车</label>
              <select v-model="newScheduleForm.carId" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option value="" disabled selected>选择小车</option>
                <option v-for="car in props.cars" :key="car.id" :value="car.id">
                  {{ car.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">选择地点</label>
              <select v-model="newScheduleForm.locationId" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option value="" disabled selected>选择地点</option>
                <option v-for="location in props.locations" :key="location.id" :value="location.id">
                  {{ location.name }} ({{ location.address || `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}` }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
              <input type="time" v-model="newScheduleForm.startTime" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" style="min-width: 0; max-width: 100%;">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
              <select v-model="newScheduleForm.isActive" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option :value="true">启用</option>
                <option :value="false">禁用</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" @click="closeScheduleModal">
            取消
          </button>
          <button class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" @click="saveSchedule">
            {{ editingSchedule ? '更新任务' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { scheduleApi, carApi, mapApi, pathApi } from '../utils/api.js'
import { getWebSocketUrl } from '../utils/config.js'
import axios from 'axios'

// 接收从父组件传递的数据
const props = defineProps({
  cars: {
    type: Array,
    default: () => []
  },
  maps: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['new-schedule-click'])

// 保存成功消息
const savedMessage = ref('')

// 定时任务列表
const schedules = ref([])

// 当前选中的定时任务
const selectedSchedule = ref(null)

// 筛选状态
const filterStatus = ref('')

// 模态框状态
const showNewScheduleModal = ref(false)
const editingSchedule = ref(null)

// 新建/编辑定时任务表单
const newScheduleForm = reactive({
  name: '',
  carId: null,
  locationId: null,
  startTime: '',
  isActive: true
})

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '未设置'
  try {
    return timeString
  } catch (error) {
    return '格式错误'
  }
}

// 根据小车ID获取小车名称
const getCarNameById = (carId) => {
  if (!carId) return '未设置'
  const car = props.cars.find(c => c.id === carId)
  return car ? car.name : `小车${carId}`
}

// 获取小车状态
const getCarStatus = (status) => {
  switch (status) {
    case 0:
      return '待机'
    case 1:
      return '充电执行中'
    case 2:
      return '任务执行中'
    case 3:
      return '任务完成返回中'
    case 4:
      return '异常状态'
    default:
      return '未知'
  }
}

// 根据地图ID获取地图名称
const getMapNameById = (mapId) => {
  if (!mapId) return '未设置'
  const map = props.maps.find(m => m.id === mapId)
  return map ? map.name : `地图${mapId}`
}

// 过滤后的定时任务列表
const filteredSchedules = computed(() => {
  return schedules.value.filter(schedule => {
    // 状态过滤
    if (filterStatus.value === 'active' && !schedule.is_active) return false
    if (filterStatus.value === 'inactive' && schedule.is_active) return false
    return true
  })
})

// 今日定时任务数
const todaySchedules = computed(() => {
  return schedules.value.length
})

// 地图相关
const viewer = ref(null)
const waypoints = ref([])
const isDrawingPath = ref(false)
const showCarControl = ref(false)
const carMarker = ref(null)
let pathLayer = null

// 小车实时数据
const carRealTimeData = reactive({
  battery: NaN,
  speed: NaN,
  temperature: NaN,
  signal: NaN,
  longitude: NaN,
  latitude: NaN,
  car_status: 0
})

// websocket连接状态
const websocket = ref(null)
const isWebSocketConnected = ref(false)
let wsChangeTimeout = null

// 选择定时任务
const selectSchedule = (schedule) => {
  selectedSchedule.value = schedule
  // 初始化地图
  initScheduleMap()
  
  // 清除之前的路径点，确保每次选择任务时都是干净的状态
  waypoints.value = []
  isDrawingPath.value = false
  
  // 连接WebSocket获取实时数据
  if (schedule.default_car_id) {
    // 防抖处理，避免频繁切换任务时的WebSocket连接风暴
    if (wsChangeTimeout) {
      clearTimeout(wsChangeTimeout)
    }
    wsChangeTimeout = setTimeout(() => {
      connectWebSocket(schedule.default_car_id)
    }, 300)
  }
}

// 取消选择定时任务
const deselectSchedule = () => {
  selectedSchedule.value = null
  // 清除地图实例
  if (viewer.value) {
    viewer.value.remove()
    viewer.value = null
  }
  // 清除小车标记
  if (carMarker.value) {
    carMarker.value.remove()
    carMarker.value = null
  }
  // 断开WebSocket连接
  disconnectWebSocket()
  // 清除防抖计时器
  if (wsChangeTimeout) {
    clearTimeout(wsChangeTimeout)
    wsChangeTimeout = null
  }
}

// 初始化定时任务地图
const initScheduleMap = () => {
  const mapContainer = document.getElementById('schedule-map-container')
  if (!mapContainer) {
    console.error('地图容器未找到')
    return
  }
  
  // 强制清理地图容器内容，确保没有残留的地图实例
  mapContainer.innerHTML = ''
  
  // 如果已经有地图实例，先销毁
  if (viewer.value) {
    try {
      viewer.value.remove() // 使用remove代替destroy，更彻底地清理地图
      viewer.value = null
    } catch (error) {
      console.error('销毁地图实例失败:', error)
      // 即使销毁失败，也要将viewer设置为null
      viewer.value = null
    }
  }
  
  // 使用预加载的Leaflet地图库初始化地图
  if (typeof window.L === 'undefined') {
    console.error('Leaflet地图库未加载')
    mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">地图库加载失败，请刷新页面重试</div>'
    return
  }
  
  try {
    // 获取任务的目标地点坐标，如果没有则使用默认坐标
    let lng, lat
    
    // 使用默认坐标（国科大杭州高等研究院）
    lng = 120.07447
    lat = 30.13442
    
    // 创建地图实例，优化性能配置
    const map = window.L.map(mapContainer, {
      center: [lat, lng], // Leaflet使用[纬度, 经度]格式
      zoom: 18, // 设置缩放级别为18
      minZoom: 3, // 设置最小缩放级别
      maxZoom: 20, // 设置最大缩放级别
      zoomControl: false, // 关闭缩放控件
      attributionControl: false, // 关闭属性控件
      scrollWheelZoom: true, // 启用滚轮缩放
      doubleClickZoom: true, // 启用双击缩放
      dragging: true, // 启用拖动
      touchZoom: true, // 启用触摸缩放
      keyboard: false // 关闭键盘控制
    })
    
    // 添加高德地图瓦片图层
    window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      maxZoom: 20,
      tileSize: 256,
      zoomOffset: 0,
      updateWhenZooming: true, // 缩放时更新瓦片
      updateWhenIdle: true // 空闲时更新瓦片
    }).addTo(map)
    
    // 存储地图实例
    viewer.value = map
    
    // 添加点击事件监听
    map.on('click', (e) => {
      if (isDrawingPath.value) {
        addWaypoint(e.latlng)
      }
    })
  } catch (error) {
    console.error('初始化地图失败:', error)
    mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">地图初始化失败，请刷新页面重试</div>'
  }
}

// 添加路径点
const addWaypoint = (latlng) => {
  if (!viewer.value || !isDrawingPath.value) return
  
  // 创建自定义图标
  const icon = window.L.divIcon({
    className: 'waypoint-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">${waypoints.value.length + 1}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -15]
  })
  
  // 创建标记点
  const marker = window.L.marker(latlng, { icon: icon }).addTo(viewer.value)
  marker.bindPopup(`目标点 ${waypoints.value.length + 1}`).openPopup()
  
  // 添加到路径点数组
  waypoints.value.push({
    lat: latlng.lat,
    lng: latlng.lng
  })
  
  // 更新路径绘制
  updatePathDrawing()
}

// 更新路径绘制
const updatePathDrawing = () => {
  if (!viewer.value) return
  
  // 清除旧路径
  if (pathLayer) {
    viewer.value.removeLayer(pathLayer)
    pathLayer = null
  }
  
  // 如果有至少2个点，绘制新路径
  if (waypoints.value.length >= 2) {
    const pathCoords = waypoints.value.map(point => [point.lat, point.lng])
    pathLayer = window.L.polyline(pathCoords, {
      color: '#FF0000',
      weight: 4,
      opacity: 0.8
    }).addTo(viewer.value)
  }
}

// 保存路径
const savePath = async () => {
  if (!selectedSchedule.value) {
    savedMessage.value = '请先选择一个定时任务'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  if (waypoints.value.length === 0) {
    savedMessage.value = '请先在地图上点击选择目标点'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  if (waypoints.value.length < 2) {
    savedMessage.value = '路径点数量不足，至少需要2个点'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  try {
    // 转换为后端需要的格式
    const backendWaypoints = waypoints.value.map(point => ({
      lat: point.lat,
      lng: point.lng
    }))
    
    // 创建路径
    const pathResponse = await pathApi.post({
      task_id: selectedSchedule.value.id,
      car_id: selectedSchedule.value.default_car_id,
      map_id: selectedSchedule.value.map_id || 1,
      name: selectedSchedule.value.name + ' - 路径',
      waypoints: backendWaypoints
    })
    
    // 将路径与定时任务绑定
    await scheduleApi.bindPath(selectedSchedule.value.id, pathResponse.data.id)
    
    // 重新获取定时任务详情，确保绑定的路径信息更新
    const updatedScheduleResponse = await scheduleApi.getById(selectedSchedule.value.id)
    selectedSchedule.value = updatedScheduleResponse.data
    
    savedMessage.value = '路径创建并绑定成功'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    
    // 退出点选模式
    isDrawingPath.value = false
    
    // 广播路径数据到WebSocket，实现与地图监控页面的同步
    if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
      const pathData = {
        type: 'path_update',
        task_id: selectedSchedule.value.id,
        path: waypoints.value,
        timestamp: new Date().toISOString()
      }
      websocket.value.send(JSON.stringify(pathData))
      console.log('路径数据已通过WebSocket广播:', pathData)
    }
  } catch (error) {
    console.error('发送路径失败:', error)
    savedMessage.value = '发送路径失败: ' + (error.message || '未知错误')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 路径规划模式切换
const setPathMode = (mode) => {
  switch (mode) {
    case 'point':
      isDrawingPath.value = true
      savedMessage.value = '进入点选模式，点击地图添加路径点'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      break
    case 'polygon':
      isDrawingPath.value = false
      savedMessage.value = '多边形模式暂未实现'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      break
    case 'auto':
      isDrawingPath.value = false
      savedMessage.value = '自动规划模式暂未实现'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      break
    case 'clear':
      clearPath()
      break
  }
}

// 清除所有路径
const clearPath = () => {
  if (viewer.value) {
    // 清除所有标记点和路径线
    viewer.value.eachLayer(layer => {
      // 检查是否是路径点标记
      if (layer instanceof window.L.Marker) {
        // 清除自定义红色图标的标记点
        if (layer.options.icon && layer.options.icon.options && layer.options.icon.options.className === 'waypoint-marker') {
          viewer.value.removeLayer(layer)
        }
        // 清除使用默认图标但标记内容为目标点的标记
        if (layer._popup && layer._popup._content && layer._popup._content.includes('目标点')) {
          viewer.value.removeLayer(layer)
        }
        // 清除小车标记
        if (layer.options.icon && layer.options.icon.options && layer.options.icon.options.className === 'car-marker') {
          viewer.value.removeLayer(layer)
        }
      }
      // 清除路径线
      if (layer instanceof window.L.Polyline) {
        viewer.value.removeLayer(layer)
      }
    })
    
    // 清除路径
    if (pathLayer) {
      viewer.value.removeLayer(pathLayer)
      pathLayer = null
    }
  }
  
  // 清空路径点数组
  waypoints.value = []
  isDrawingPath.value = false
  
  savedMessage.value = '路径已清除'
  setTimeout(() => {
    savedMessage.value = ''
  }, 2000)
}

// 开始任务
const startTask = async () => {
  if (!selectedSchedule.value) return
  
  try {
    const updatedSchedule = {
      ...selectedSchedule.value,
      is_active: true
    }
    await scheduleApi.update(selectedSchedule.value.id, updatedSchedule)
    selectedSchedule.value.is_active = true
    savedMessage.value = '定时任务已开始'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('开始定时任务失败:', error)
    savedMessage.value = '开始定时任务失败: ' + (error.message || '请重试')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 切换暂停/继续任务
const togglePauseResume = async () => {
  if (!selectedSchedule.value) return
  
  try {
    const updatedSchedule = {
      ...selectedSchedule.value,
      is_active: !selectedSchedule.value.is_active
    }
    await scheduleApi.update(selectedSchedule.value.id, updatedSchedule)
    selectedSchedule.value.is_active = !selectedSchedule.value.is_active
    savedMessage.value = `定时任务已${selectedSchedule.value.is_active ? '继续' : '暂停'}`
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('切换定时任务状态失败:', error)
    savedMessage.value = '操作失败: ' + (error.message || '请重试')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 完成任务
const completeTask = async () => {
  if (!selectedSchedule.value) return
  
  try {
    const updatedSchedule = {
      ...selectedSchedule.value,
      is_active: false
    }
    await scheduleApi.update(selectedSchedule.value.id, updatedSchedule)
    selectedSchedule.value.is_active = false
    savedMessage.value = '定时任务已完成'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('完成定时任务失败:', error)
    savedMessage.value = '完成定时任务失败: ' + (error.message || '请重试')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 显示当前任务路径
const showCurrentTaskPath = async () => {
  if (!selectedSchedule.value) return
  
  try {
    // 获取定时任务绑定的路径ID
    let pathId = selectedSchedule.value.path_id
    
    // 如果没有path_id，尝试从任务详情中获取
    if (!pathId) {
      const response = await scheduleApi.getById(selectedSchedule.value.id)
      const fullSchedule = response.data
      pathId = fullSchedule.path_id
    }
    
    if (!pathId) {
      savedMessage.value = '定时任务未绑定路径'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    // 获取路径数据
    const pathResponse = await pathApi.getById(pathId)
    const pathData = pathResponse.data
    
    if (!pathData || !Array.isArray(pathData.waypoints)) {
      savedMessage.value = '未获取到路径数据'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    // 清除现有路径
    clearPath()
    
    // 转换坐标并显示路径
    const path = pathData.waypoints.map(point => {
      if (point.x !== undefined && point.y !== undefined) {
        return { lat: point.y, lon: point.x }
      }
      return { lat: point.lat, lon: point.lon || point.lng }
    })
    
    // 更新路径点数组
    waypoints.value = path
    
    // 显示路径
    if (viewer.value && path.length >= 2) {
      const pathCoords = path.map(point => [point.lat, point.lon])
      window.L.polyline(pathCoords, {
        color: '#FF0000',
        weight: 4,
        opacity: 0.8
      }).addTo(viewer.value)
      
      // 添加路径点标记
      path.forEach((point, index) => {
        let waypointIcon
        
        if (index === 0) {
          // 起点
          waypointIcon = window.L.divIcon({
            className: 'waypoint-marker start-marker',
            html: `<div style="
              width: 24px;
              height: 24px;
              background-color: #28a745;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">S</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -18]
          })
        } else if (index === path.length - 1) {
          // 终点
          waypointIcon = window.L.divIcon({
            className: 'waypoint-marker end-marker',
            html: `<div style="
              width: 24px;
              height: 24px;
              background-color: #dc3545;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">E</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -18]
          })
        } else {
          // 中间点
          waypointIcon = window.L.divIcon({
            className: 'waypoint-marker',
            html: `<div style="
              width: 16px;
              height: 16px;
              background-color: #007bff;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -12]
          })
        }
        
        window.L.marker([point.lat, point.lon], { icon: waypointIcon })
          .addTo(viewer.value)
          .bindPopup(`路径点 ${index + 1}`)
      })
      

      
      savedMessage.value = '路径显示成功'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
    }
  } catch (error) {
    console.error('显示路径失败:', error)
    savedMessage.value = '显示路径失败: ' + (error.message || '请重试')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 创建小车图标
const createCarIcon = () => {
  return window.L.divIcon({
    className: 'car-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #FFC107;
      border-radius: 50%;
      border: 3px solid #FF9800;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">🚗</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -15]
  })
}

// 更新小车标记
const updateCarMarker = (map, carPoint, marker) => {
  // 如果标记已存在，移除旧标记
  if (marker) {
    map.removeLayer(marker)
  }
}

// 连接到websocket服务器
const connectWebSocket = (carId) => {
  // 如果已经有连接，先断开
  if (websocket.value) {
    disconnectWebSocket()
  }
  
  try {
    // 创建websocket连接 - 使用与后端一致的路径
    const wsUrl = getWebSocketUrl(carId)
    websocket.value = new WebSocket(wsUrl)
    
    // 连接成功
    websocket.value.onopen = () => {
      isWebSocketConnected.value = true
    }
    
    // 接收消息
    websocket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // 检查是否是小车实时数据（根据后端返回格式）
        if (data.battery !== undefined || (data.car_id && data.reported_at)) {
          // 直接更新小车实时数据，不再使用type字段判断
          carRealTimeData.battery = data.battery !== undefined ? data.battery : NaN
          carRealTimeData.speed = data.speed !== undefined ? data.speed : NaN
          carRealTimeData.temperature = data.temperature !== undefined ? data.temperature : NaN
          carRealTimeData.signal = data.signal !== undefined ? data.signal : NaN
          carRealTimeData.longitude = data.longitude !== undefined ? data.longitude : NaN
          carRealTimeData.latitude = data.latitude !== undefined ? data.latitude : NaN
          carRealTimeData.car_status = data.car_status !== undefined ? data.car_status : 0
          
          // 更新小车位置标记
          if (data.longitude && data.latitude) {
            const carPoint = [data.latitude, data.longitude] // Leaflet使用[纬度, 经度]格式
            
            // 更新查看任务时的小车标记
            if (viewer.value) {
              updateCarMarker(viewer.value, carPoint, carMarker.value)
              carMarker.value = window.L.marker(carPoint, { icon: createCarIcon() }).addTo(viewer.value)
            }
          }
        }
      } catch (error) {
        // 忽略WebSocket消息解析错误，避免影响页面性能
      }
    }
    
    // 连接关闭
    websocket.value.onclose = () => {
      isWebSocketConnected.value = false
    }
    
    // 连接错误
    websocket.value.onerror = () => {
      isWebSocketConnected.value = false
    }
    
  } catch (error) {
    // 忽略WebSocket连接错误，避免影响页面性能
  }
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (websocket.value) {
    websocket.value.close()
    websocket.value = null
    isWebSocketConnected.value = false
  }
}

// 打开编辑定时任务模态框
const editSchedule = (schedule) => {
  editingSchedule.value = schedule
  newScheduleForm.name = schedule.name
  newScheduleForm.carId = schedule.default_car_id
  newScheduleForm.locationId = schedule.location_id || schedule.map_id
  newScheduleForm.startTime = schedule.run_time
  newScheduleForm.isActive = schedule.is_active
}

// 关闭定时任务模态框
const closeScheduleModal = () => {
  showNewScheduleModal.value = false
  editingSchedule.value = null
  // 清空表单
  Object.assign(newScheduleForm, {
    name: '',
    carId: null,
    locationId: null,
    startTime: '',
    isActive: true
  })
}

// 保存定时任务
const saveSchedule = async () => {
  try {
    // 获取选择的地点信息
    const selectedLocation = props.locations.find(loc => loc.id === newScheduleForm.locationId)
    if (!selectedLocation) {
      alert('选择的地点不存在')
      return
    }
    
    const scheduleData = {
      name: `定时任务-${newScheduleForm.name}`,
      run_time: newScheduleForm.startTime,
      location_id: newScheduleForm.locationId,
      map_id: selectedLocation.id, // 使用地点ID作为地图ID
      default_car_id: newScheduleForm.carId,
      is_active: newScheduleForm.isActive
    }
    
    if (editingSchedule.value) {
      // 更新定时任务
      await scheduleApi.update(editingSchedule.value.id, scheduleData)
      // 更新本地数据
      const index = schedules.value.findIndex(s => s.id === editingSchedule.value.id)
      if (index !== -1) {
        schedules.value[index] = { ...schedules.value[index], ...scheduleData }
      }
      savedMessage.value = '定时任务更新成功'
    } else {
      // 创建定时任务
      await scheduleApi.post(scheduleData)
      // 重新获取定时任务列表
      await fetchSchedules()
      savedMessage.value = '定时任务创建成功'
    }
    
    // 关闭模态框
    closeScheduleModal()
    
    // 3秒后清除消息
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存定时任务失败:', error)
    savedMessage.value = '保存定时任务失败: ' + (error.message || '请重试')
    // 3秒后清除消息
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  }
}

// 删除定时任务
const deleteSchedule = async (schedule) => {
  if (!schedule) return
  
  if (confirm('确定要删除这个定时任务吗？')) {
    try {
      await scheduleApi.delete(schedule.id)
      // 从本地列表中删除
      const index = schedules.value.findIndex(s => s.id === schedule.id)
      if (index !== -1) {
        schedules.value.splice(index, 1)
      }
      // 如果删除的是当前选中的任务，取消选择
      if (selectedSchedule.value && selectedSchedule.value.id === schedule.id) {
        selectedSchedule.value = null
      }
      savedMessage.value = '定时任务删除成功'
      // 3秒后清除消息
      setTimeout(() => {
        savedMessage.value = ''
      }, 3000)
    } catch (error) {
      console.error('删除定时任务失败:', error)
      savedMessage.value = '删除定时任务失败: ' + (error.message || '请重试')
      // 3秒后清除消息
      setTimeout(() => {
        savedMessage.value = ''
      }, 3000)
    }
  }
}

// 切换定时任务状态
const toggleScheduleStatus = async () => {
  if (!selectedSchedule.value) return
  
  try {
    const updatedSchedule = {
      ...selectedSchedule.value,
      is_active: !selectedSchedule.value.is_active
    }
    await scheduleApi.update(selectedSchedule.value.id, updatedSchedule)
    // 更新本地数据
    selectedSchedule.value.is_active = !selectedSchedule.value.is_active
    savedMessage.value = `定时任务已${selectedSchedule.value.is_active ? '启用' : '禁用'}`
    // 3秒后清除消息
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('切换定时任务状态失败:', error)
    savedMessage.value = '操作失败: ' + (error.message || '请重试')
    // 3秒后清除消息
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  }
}

// 从API获取定时任务列表
const fetchSchedules = async () => {
  try {
    const response = await scheduleApi.get()
    schedules.value = response.data || []
  } catch (error) {
    console.error('获取定时任务列表失败:', error)
    schedules.value = []
  }
}

// 组件挂载时获取定时任务数据
onMounted(async () => {
  await fetchSchedules()
})

// 监听selectedSchedule变化，更新地图
watch(selectedSchedule, (newSchedule) => {
  // 只有当selectedSchedule不为null时，地图容器才会渲染，此时再初始化地图
  if (newSchedule) {
    // 使用nextTick确保DOM已经更新，地图容器已经渲染
    setTimeout(() => {
      initScheduleMap()
    }, 0)
  }
}, { deep: true })
</script>

<style scoped>
#schedule-page {
  height: 100%;
  overflow: hidden;
}

#schedule-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.saved-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 确保表格在小屏幕上可以水平滚动 */
.table-responsive {
  overflow-x: auto;
}

/* 任务状态样式 */
.task-status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-status.running {
  background-color: #d1fae5;
  color: #065f46;
}

.task-status.pending {
  background-color: #dbeafe;
  color: #1e40af;
}

.task-status.completed {
  background-color: #f3f4f6;
  color: #374151;
}

.task-status.canceled {
  background-color: #fed7aa;
  color: #9a3412;
}
</style>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapMonitor from './components/MapMonitor.vue'
import DeviceManagement from './components/DeviceManagement.vue'
import CarManagement from './components/CarManagement.vue'
import MapImport from './components/MapImport.vue'
import TaskPlanning from './components/TaskPlanning.vue'
import IssueManagement from './components/IssueManagement.vue'
import { deviceApi, carApi, mapApi } from './utils/api.js'
import { getWebSocketUrl } from './utils/config.js'

const currentPage = ref('map')

// 模态框状态
const showCameraModal = ref(false)
const showBatteryModal = ref(false)
const showSpeedModal = ref(false)
const showSignalModal = ref(false)
const showSystemConfigModal = ref(false)
const showOperationLogModal = ref(false)
const showHelpCenterModal = ref(false)

// 控制单个摄像头放大窗口的状态变量
const showSingleCameraModal = ref(false)
const selectedCamera = ref({
  src: '',
  name: '',
  alt: ''
})

// MapMonitor组件引用
const mapMonitorRef = ref(null)

// 设备状态数据
const devices = ref([])

// 小车数据
const cars = ref([])

// 共享地点数据 - 初始为空，只显示从后端获取的地点
const locations = ref([])

// 地图数据 - 初始为空
const maps = ref([])

// 更新地图列表
const updateMaps = (newMaps) => {
  maps.value = newMaps
}

// WebSocket连接
const websockets = ref({})
const isWebSocketConnected = ref(false)

// 加载状态
const isLoading = ref({
  devices: false,
  cars: false
})

// 错误信息
const errorMessage = ref('')
const errorTimeout = ref(null)

// 操作日志数据
const operationLogs = ref([])

// 当前选中的小车ID
const selectedCarId = ref('')

// 所有小车的状态，键为小车ID
const carsStatus = ref(new Map())

// 当前选中小车的状态（计算属性，从carsStatus中获取）
const carStatus = computed(() => {
  if (!selectedCarId.value) {
    return {
      battery: NaN,
      speed: NaN,
      temperature: NaN,
      signal: NaN,
      status: 'idle'
    }
  }
  return carsStatus.value.get(selectedCarId.value) || {
    battery: NaN,
    speed: NaN,
    temperature: NaN,
    signal: NaN,
    status: 'idle'
  }
})

// 当小车列表变化时，自动选择第一个小车
watch(cars, (newCars) => {
  if (newCars.length > 0 && !selectedCarId.value) {
    selectedCarId.value = newCars[0].id
  }
}, { immediate: true })

const resolveCarId = (incomingCarId, fallbackCarId = null) => {
  const candidateIds = [incomingCarId, fallbackCarId].filter(id => id !== null && id !== undefined && id !== '')
  
  for (const candidateId of candidateIds) {
    const matchedCar = cars.value.find(car => String(car.id) === String(candidateId))
    if (matchedCar) {
      return matchedCar.id
    }
  }
  
  return candidateIds[0] ?? fallbackCarId
}

const buildRealtimeStatus = (data, currentStatus = {}) => ({
  battery: data.battery !== undefined ? data.battery : (currentStatus.battery ?? NaN),
  speed: data.speed !== undefined ? data.speed : (currentStatus.speed ?? NaN),
  temperature: data.temperature !== undefined ? data.temperature : (currentStatus.temperature ?? NaN),
  signal: data.signal !== undefined ? data.signal : (currentStatus.signal ?? NaN),
  status: data.status ?? data.car_status ?? currentStatus.status ?? 'idle'
})

const updateCarStatus = (carId, data) => {
  const resolvedCarId = resolveCarId(data.car_id || data.carId, carId)
  if (resolvedCarId === null || resolvedCarId === undefined || resolvedCarId === '') {
    return
  }
  
  const currentStatus = carsStatus.value.get(resolvedCarId) || {}
  const nextStatus = buildRealtimeStatus(data, currentStatus)
  carsStatus.value.set(resolvedCarId, nextStatus)
}

// 从MapMonitor组件获取小车状态数据
const syncCarStatus = () => {
  if (mapMonitorRef.value && mapMonitorRef.value.carsStatus) {
    const sourceStatus = mapMonitorRef.value.carsStatus?.value ?? mapMonitorRef.value.carsStatus
    if (sourceStatus instanceof Map) {
      // 只更新有变化的数据，避免频繁创建新Map
      let hasChanges = false
      const newStatus = new Map(carsStatus.value)
      
      // 同步新增或更新的数据
      sourceStatus.forEach((value, key) => {
        const currentValue = newStatus.get(key)
        if (!currentValue || JSON.stringify(currentValue) !== JSON.stringify(value)) {
          newStatus.set(key, value)
          hasChanges = true
        }
      })
      
      // 移除不再存在的数据
      newStatus.forEach((value, key) => {
        if (!sourceStatus.has(key)) {
          newStatus.delete(key)
          hasChanges = true
        }
      })
      
      // 只有当数据有变化时才更新，减少重新渲染
      if (hasChanges) {
        carsStatus.value = newStatus
      }
    }
  }
}

// 定时同步小车状态数据
let syncInterval = null

// 添加新地点
const addLocation = (newLocation) => {
  // 检查地点是否已存在，避免重复添加
  const locationExists = locations.value.some(location => location.id === newLocation.id)
  if (!locationExists) {
    locations.value.push(newLocation)
  }
}

// 删除地点
const deleteLocation = (locationId) => {
  const index = locations.value.findIndex(location => location.id === locationId)
  if (index !== -1) {
    locations.value.splice(index, 1)
  }
}

// 批量更新地点数据
const updateLocations = (newLocations) => {
  // 清空现有地点数据
  locations.value = []
  
  // 添加新的地点数据
  if (Array.isArray(newLocations)) {
    newLocations.forEach(location => {
      const locationExists = locations.value.some(l => l.id === location.id)
      if (!locationExists) {
        locations.value.push(location)
      }
    })
  }
}

// 显示错误信息
const showError = (message) => {
  errorMessage.value = message
  // 清除之前的定时器
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
  // 3秒后自动清除错误信息
  errorTimeout.value = setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

// 添加操作日志
const addOperationLog = (type, content) => {
  const newLog = {
    id: Date.now(),
    type,
    content,
    timestamp: new Date().toLocaleString('zh-CN')
  }
  // 添加到日志数组开头
  operationLogs.value.unshift(newLog)
  // 限制日志数量，最多保存100条
  if (operationLogs.value.length > 100) {
    operationLogs.value.pop()
  }
}

// 从API获取设备数据
const fetchDevices = async () => {
  isLoading.value.devices = true
  try {
    const response = await deviceApi.get()
    devices.value = response.data
  } catch (error) {
    console.error('获取设备列表失败:', error)
    devices.value = []
    showError('获取设备列表失败，请稍后重试')
  } finally {
    isLoading.value.devices = false
  }
}

// 从API获取小车数据
const fetchCars = async () => {
  isLoading.value.cars = true
  try {
    // 先断开所有现有的WebSocket连接
    Object.keys(websockets.value).forEach(carId => {
      if (websockets.value[carId]) {
        websockets.value[carId].close()
        delete websockets.value[carId]
      }
    })
    isWebSocketConnected.value = false
    carsStatus.value = new Map()
    
    // 获取新的小车数据
    const response = await carApi.get()
    cars.value = response.data || []
    
    // 为每个小车建立新的WebSocket连接
    cars.value.forEach(car => {
      connectWebSocket(car.id)
    })
  } catch (error) {
    console.error('获取小车列表失败:', error)
    cars.value = []
    showError('获取小车列表失败，请稍后重试')
  } finally {
    isLoading.value.cars = false
  }
}

// 获取地点数据
const fetchLocations = async () => {
  try {
    const response = await mapApi.get()
    const backendLocations = response.data || []
    const formattedLocations = backendLocations.map(location => ({
      id: location.id,
      name: location.name,
      address: '',
      latitude: location.center_lat,
      longitude: location.center_lng,
      importTime: new Date().toLocaleString('zh-CN')
    }))
    locations.value = formattedLocations
  } catch (error) {
    console.error('获取地点数据失败:', error)
    showError('获取地点数据失败')
  }
}

// 更新设备数据
const updateDeviceData = (deviceId, data) => {
  const index = devices.value.findIndex(device => device.id === deviceId)
  if (index !== -1) {
    devices.value[index] = {
      ...devices.value[index],
      ...data
    }
  }
}

// 更新小车数据
const updateCarData = (carId, data) => {
  const resolvedCarId = resolveCarId(data.car_id || data.carId, carId)
  const index = cars.value.findIndex(car => String(car.id) === String(resolvedCarId))
  if (index !== -1) {
    cars.value[index] = {
      ...cars.value[index],
      ...data,
      status: data.status ?? data.car_status ?? cars.value[index].status
    }
    // console.log('小车数据更新:', resolvedCarId, data)
  }
}

// 建立WebSocket连接
const connectWebSocket = (carId) => {
  // 如果已经有连接，先断开
  if (websockets.value[carId]) {
    websockets.value[carId].close()
    delete websockets.value[carId]
  }
  
  try {
    const wsUrl = getWebSocketUrl(carId)
    const ws = new WebSocket(wsUrl)
    
    // 连接成功
    ws.onopen = () => {
      isWebSocketConnected.value = true
      // console.log(`WebSocket连接成功: ${wsUrl}`)
    }
    
    // 接收消息
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const messageCarId = resolveCarId(data.car_id || data.carId, carId)
        // console.log('收到WebSocket消息:', messageCarId, data)
        
        // 更新小车数据
        updateCarData(messageCarId, data)
        updateCarStatus(messageCarId, data)
      } catch (error) {
        console.error('WebSocket消息解析失败:', error)
        console.error('原始消息:', event.data)
      }
    }
    
    // 连接关闭
    ws.onclose = () => {
      delete websockets.value[carId]
      if (Object.keys(websockets.value).length === 0) {
        isWebSocketConnected.value = false
      }
      // console.log(`WebSocket连接关闭: ${wsUrl}`)
    }
    
    // 连接错误
    ws.onerror = (error) => {
      console.error('WebSocket连接错误:', error)
    }
    
    websockets.value[carId] = ws
  } catch (error) {
    console.error('WebSocket连接失败:', error)
  }
}

// 断开WebSocket连接
const disconnectWebSocket = (carId) => {
  if (websockets.value[carId]) {
    websockets.value[carId].close()
    delete websockets.value[carId]
    
    if (Object.keys(websockets.value).length === 0) {
      isWebSocketConnected.value = false
    }
  }
}

// 当组件挂载时，从API获取设备和小车数据
// 获取地图数据
const fetchMaps = async () => {
  try {
    const response = await mapApi.get()
    maps.value = response.data || []
    // console.log('地图数据加载完成')
    addOperationLog('数据加载', '地图数据加载完成')
  } catch (error) {
    console.error('获取地图数据失败:', error)
    addOperationLog('系统错误', '地图数据加载失败：' + error.message)
  }
}

onMounted(() => {
  // 记录系统启动
  addOperationLog('系统启动', '系统正常启动')
  
  // 定时同步小车状态数据
  syncInterval = setInterval(syncCarStatus, 1000)
  
  // 串行执行设备、小车、地点和地图数据的获取，减少服务器压力
  fetchDevices()
    .then(() => {
      // console.log('设备数据加载完成')
      addOperationLog('数据加载', '设备数据加载完成')
      return fetchCars()
    })
    .then(() => {
      // console.log('小车数据加载完成')
      addOperationLog('数据加载', '小车数据加载完成')
      return fetchLocations()
    })
    .then(() => {
      // console.log('地点数据加载完成')
      addOperationLog('数据加载', '地点数据加载完成')
      return fetchMaps()
    })
    .then(() => {
      // console.log('地图数据加载完成')
      addOperationLog('数据加载', '地图数据加载完成')
    })
    .catch((error) => {
      console.error('数据加载失败:', error)
      addOperationLog('系统错误', '数据加载失败：' + error.message)
    })
})

onUnmounted(() => {
  // 清除定时同步
  if (syncInterval) {
    clearInterval(syncInterval)
  }
  
  Object.keys(websockets.value).forEach(carId => {
    if (websockets.value[carId]) {
      websockets.value[carId].close()
      delete websockets.value[carId]
    }
  })
})

// 页面名称映射
const pageNames = {
  'map': '地图监控',
  'car': '小车管理',
  'device': '设备管理',
  'mapImport': '地图服务',
  'task': '任务管理',
  'issue': '警告管理'
}

// 页面切换函数
const changePage = async (page) => {
  // 记录页面切换
  addOperationLog('页面切换', `切换到${pageNames[page] || page}页面`)
  
  // 直接切换到新页面
  currentPage.value = page
  
  // 如果切换到地图监控页面，加载所有任务路径
  if (page === 'map') {
    setTimeout(async () => {
      if (mapMonitorRef.value) {
        try {
          // 先确保任务数据已加载
          await mapMonitorRef.value.fetchTasks()
          // 然后加载所有任务路径
          mapMonitorRef.value.loadAllTaskPaths()
        } catch (error) {
          // 静默处理错误
        }
      }
    }, 500)
  }
}


// 定位小车
const handleLocateTrolley = () => {
  addOperationLog('操作执行', '定位小车')
  currentPage.value = 'map'
  // 调用MapMonitor组件的定位方法
  setTimeout(() => {
    if (mapMonitorRef.value) {
      mapMonitorRef.value.locateTrolley()
    }
  }, 100)
}

// 控制是否自动打开新建任务模态框
const autoOpenNewTask = ref(false)

// 点击新建任务按钮
const handleNewTaskClick = () => {
  addOperationLog('操作执行', '新建任务')
  autoOpenNewTask.value = true
  currentPage.value = 'task'
}

// 新建任务模态框关闭
const handleNewTaskClosed = () => {
  autoOpenNewTask.value = false
}

// 刷新地图
const handleRefreshMap = () => {
  currentPage.value = 'map'
  // 调用MapMonitor组件的刷新方法
  setTimeout(() => {
    if (mapMonitorRef.value) {
      mapMonitorRef.value.refreshMap()
    }
  }, 100)
}

// 处理摄像头点击事件
const handleCameraClick = (camera) => {
  selectedCamera.value = camera
  showSingleCameraModal.value = true
}

// 处理任务详情跳转
const selectedTaskId = ref(null)

const handleTaskDetailClick = (task) => {
  selectedTaskId.value = task.id
  currentPage.value = 'task'
}
</script>

<template>
  <div class="app-container flex flex-col h-screen">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-40">
      <div class="flex items-center gap-2">
        <i class="fa fa-robot text-primary text-2xl"></i>
        <h1 class="text-xl font-bold text-primary">无人巡检小车监控平台</h1>
      </div>
      <div class="flex items-center gap-6">
        <!-- 页面导航 -->
        <nav class="hidden md:flex items-center gap-1">
          <button 
            class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
            :class="{ 'active bg-primary text-white': currentPage === 'map' }"
            @click="changePage('map')"
          >
            地图监控
          </button>
          <button 
            class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
            :class="{ 'active bg-primary text-white': currentPage === 'car' }"
            @click="changePage('car')"
          >
            小车管理
          </button>
          <button 
            class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
            :class="{ 'active bg-primary text-white': currentPage === 'device' }"
            @click="changePage('device')"
          >
            设备管理
          </button>
          <button 
              class="page-btn px-4 py-2 text-sm font-medium rounded-md"
              :class="{ 'active bg-primary text-white': currentPage === 'mapImport' }"
              @click="changePage('mapImport')"
            >
              地图服务
            </button>
            <!-- 任务管理 -->
            <button 
              class="page-btn px-4 py-2 text-sm font-medium rounded-md"
              :class="{ 'active bg-primary text-white': currentPage === 'task' }"
              @click="changePage('task')"
            >
              任务管理
            </button>
            <button 
              class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
              :class="{ 'active bg-primary text-white': currentPage === 'issue' }"
              @click="changePage('issue')"
            >
              警告管理
            </button>
        </nav>
      </div>
    </header>
    
    <!-- 全局错误提示 -->
    <div v-if="errorMessage" class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <i class="fa fa-exclamation-circle"></i>
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-red-600 hover:text-red-800">
        <i class="fa fa-times"></i>
      </button>
    </div>
    
    <!-- 全局加载提示 -->
    <div v-if="isLoading.devices || isLoading.cars" class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <i class="fa fa-spinner fa-spin"></i>
      <span>数据加载中...</span>
    </div>
    
    <!-- 主内容区 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧边栏 -->
      <aside class="w-64 bg-white shadow-sm p-4 hidden md:block overflow-y-auto z-20">
        <div class="mb-6">
          <h3 class="text-xs uppercase text-gray-500 font-semibold mb-3 px-4">地图控制</h3>
          <div class="space-y-1">
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="handleLocateTrolley">
              <i class="fa fa-map-marker w-5 text-center"></i>
              <span>定位小车</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="handleRefreshMap">
              <i class="fa fa-sync-alt w-5 text-center"></i>
              <span>刷新地图</span>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xs uppercase text-gray-500 font-semibold mb-3 px-4">小车状态</h3>
          <div class="space-y-1">
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showCameraModal = true">
              <i class="fa fa-video w-5 text-center"></i>
              <span>摄像头画面</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showBatteryModal = true">
              <i class="fa fa-battery-full w-5 text-center"></i>
              <span>电量信息</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showSpeedModal = true">
              <i class="fa fa-tachometer-alt w-5 text-center"></i>
              <span>运行速度</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showSignalModal = true">
              <i class="fa fa-signal w-5 text-center"></i>
              <span>信号强度</span>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xs uppercase text-gray-500 font-semibold mb-3 px-4">系统设置</h3>
          <div class="space-y-1">
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showSystemConfigModal = true">
              <i class="fa fa-cog w-5 text-center"></i>
              <span>系统配置</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showOperationLogModal = true">
              <i class="fa fa-history w-5 text-center"></i>
              <span>操作日志</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" @click="showHelpCenterModal = true">
              <i class="fa fa-question-circle w-5 text-center"></i>
              <span>帮助中心</span>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- 页面内容区 -->
      <div class="flex-1 relative">
        <MapMonitor v-if="currentPage === 'map'" ref="mapMonitorRef" :cars="cars" :devices="devices" :cars-status="carsStatus" :selected-car-id="selectedCarId" @update:selected-car-id="selectedCarId = $event" @camera-click="handleCameraClick" @new-task-click="handleNewTaskClick" @task-detail-click="handleTaskDetailClick" />
        <CarManagement v-if="currentPage === 'car'" :cars="cars" @update-cars="fetchCars" />
        <DeviceManagement v-if="currentPage === 'device'" :devices="devices" :cars="cars" @update-devices="fetchDevices" />
        <MapImport v-if="currentPage === 'mapImport'" @update-maps="updateMaps" />
        <TaskPlanning v-if="currentPage === 'task'" :maps="maps" :cars="cars" :locations="locations" :cars-status="carsStatus" :auto-open-new-task="autoOpenNewTask" :selected-task-id="selectedTaskId" @new-task-closed="handleNewTaskClosed" />
        <IssueManagement v-if="currentPage === 'issue'" />
      </div>
    </main>
    
    <!-- 摄像头画面弹窗 -->
    <div v-if="showCameraModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-6xl max-w-[90vw] max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-medium">摄像头画面</h3>
          <button @click="showCameraModal = false" class="text-gray-500 hover:text-gray-700 text-xl">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer hover:shadow-lg transition-all" @click="selectedCamera.src='https://picsum.photos/1920/1080?random=1'; selectedCamera.name='前视'; selectedCamera.alt='摄像头1'; showSingleCameraModal=true">
            <img src="https://picsum.photos/600/400?random=1" alt="摄像头1" class="w-full h-full object-cover">
            <span class="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">画面1</span>
            <div class="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white font-medium">点击放大</span>
            </div>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer hover:shadow-lg transition-all" @click="selectedCamera.src='https://picsum.photos/1920/1080?random=2'; selectedCamera.name='后视'; selectedCamera.alt='摄像头2'; showSingleCameraModal=true">
            <img src="https://picsum.photos/600/400?random=2" alt="摄像头2" class="w-full h-full object-cover">
            <span class="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">画面2</span>
            <div class="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white font-medium">点击放大</span>
            </div>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer hover:shadow-lg transition-all" @click="selectedCamera.src='https://picsum.photos/1920/1080?random=3'; selectedCamera.name='左视'; selectedCamera.alt='摄像头3'; showSingleCameraModal=true">
            <img src="https://picsum.photos/600/400?random=3" alt="摄像头3" class="w-full h-full object-cover">
            <span class="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">画面3</span>
            <div class="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white font-medium">点击放大</span>
            </div>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer hover:shadow-lg transition-all" @click="selectedCamera.src='https://picsum.photos/1920/1080?random=4'; selectedCamera.name='右视'; selectedCamera.alt='摄像头4'; showSingleCameraModal=true">
            <img src="https://picsum.photos/600/400?random=4" alt="摄像头4" class="w-full h-full object-cover">
            <span class="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">画面4</span>
            <div class="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white font-medium">点击放大</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 电量信息弹窗 -->
    <div v-if="showBatteryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">电量信息</h3>
          <button @click="showBatteryModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div v-if="cars.length === 0" class="text-center py-8 text-gray-500">
          <i class="fa fa-exclamation-triangle text-2xl mb-3"></i>
          <p>暂无小车数据</p>
          
        </div>
        <div v-else class="space-y-4">
          <div v-for="car in cars" :key="car.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ car.name }}</div>
              <div :class="{
                'text-green-600': car.status === '任务执行中' || car.status === 2,
                'text-yellow-600': car.status === '待机' || car.status === 0,
                'text-blue-600': car.status === '充电执行中' || car.status === 1,
                'text-purple-600': car.status === '任务完成返回中' || car.status === 3,
                'text-red-600': car.status === '异常状态' || car.status === 4
              }">
                {{ 
                  typeof car.status === 'number' 
                    ? { 0: '待机', 1: '充电执行中', 2: '任务执行中', 3: '任务完成返回中', 4: '异常状态' }[car.status] || car.status 
                    : car.status || '未知' 
                }}
              </div>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <i :class="{
                'fa fa-battery-full text-success': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 80,
                'fa fa-battery-three-quarters text-success': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 60 && carsStatus.get(car.id)?.battery < 80,
                'fa fa-battery-half text-warning': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 40 && carsStatus.get(car.id)?.battery < 60,
                'fa fa-battery-quarter text-danger': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 20 && carsStatus.get(car.id)?.battery < 40,
                'fa fa-battery-empty text-danger': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery < 20,
                'fa fa-battery-three-quarters text-gray-400': isNaN(carsStatus.get(car.id)?.battery)
              }" class="text-2xl"></i>
              <span class="text-lg font-bold">{{ !isNaN(carsStatus.get(car.id)?.battery) ? Math.floor(carsStatus.get(car.id)?.battery) + '%' : 'NaN' }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500 ease-out"
                :class="{
                  'bg-success': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 60,
                  'bg-warning': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery >= 20 && carsStatus.get(car.id)?.battery < 60,
                  'bg-danger': !isNaN(carsStatus.get(car.id)?.battery) && carsStatus.get(car.id)?.battery < 20,
                  'bg-gray-300': isNaN(carsStatus.get(car.id)?.battery)
                }"
                :style="{ width: !isNaN(carsStatus.get(car.id)?.battery) ? `${carsStatus.get(car.id)?.battery}%` : '0%' }"
              ></div>
            </div>
            <div class="text-sm text-gray-500 mt-1">
              预计续航: {{ !isNaN(carsStatus.get(car.id)?.battery) ? Math.round(carsStatus.get(car.id)?.battery * 0.055 * 10) / 10 : 0 }}小时
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 运行速度弹窗 -->
    <div v-if="showSpeedModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">运行速度</h3>
          <button @click="showSpeedModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div v-if="cars.length === 0" class="text-center py-8 text-gray-500">
          <i class="fa fa-exclamation-triangle text-2xl mb-3"></i>
          <p>暂无小车数据</p>
          
        </div>
        <div v-else class="space-y-4">
          <div v-for="car in cars" :key="car.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ car.name }}</div>
              <div :class="{
                'text-green-600': car.status === '任务执行中' || car.status === 2,
                'text-yellow-600': car.status === '待机' || car.status === 0,
                'text-blue-600': car.status === '充电执行中' || car.status === 1,
                'text-purple-600': car.status === '任务完成返回中' || car.status === 3,
                'text-red-600': car.status === '异常状态' || car.status === 4
              }">
                {{ 
                  typeof car.status === 'number' 
                    ? { 0: '待机', 1: '充电执行中', 2: '任务执行中', 3: '任务完成返回中', 4: '异常状态' }[car.status] || car.status 
                    : car.status || '未知' 
                }}
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div class="text-3xl mb-1">
                <i class="fa fa-tachometer-alt text-primary"></i>
              </div>
              <div class="text-2xl font-bold mb-1">
                {{ carsStatus.get(car.id)?.speed != null && !isNaN(carsStatus.get(car.id)?.speed) ? carsStatus.get(car.id)?.speed.toFixed(1) + ' m/s' : 'NaN' }}
              </div>
              <div class="text-sm text-gray-500 mb-2">当前速度</div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full bg-primary transition-all duration-500 ease-out"
                :style="{ width: !isNaN(carsStatus.get(car.id)?.speed) ? `${Math.min((carsStatus.get(car.id)?.speed / 5) * 100, 100)}%` : '0%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 信号强度弹窗 -->
    <div v-if="showSignalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">信号强度</h3>
          <button @click="showSignalModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div v-if="cars.length === 0" class="text-center py-8 text-gray-500">
          <i class="fa fa-exclamation-triangle text-2xl mb-3"></i>
          <p>暂无小车数据</p>
          
        </div>
        <div v-else class="space-y-4">
          <div v-for="car in cars" :key="car.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ car.name }}</div>
              <div :class="{
                'text-green-600': car.status === '任务执行中' || car.status === 2,
                'text-yellow-600': car.status === '待机' || car.status === 0,
                'text-blue-600': car.status === '充电执行中' || car.status === 1,
                'text-purple-600': car.status === '任务完成返回中' || car.status === 3,
                'text-red-600': car.status === '异常状态' || car.status === 4
              }" class="text-sm">
                {{ 
                  typeof car.status === 'number' 
                    ? { 0: '待机', 1: '充电执行中', 2: '任务执行中', 3: '任务完成返回中', 4: '异常状态' }[car.status] || car.status 
                    : car.status || '未知' 
                }}
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div class="text-3xl mb-1">
                <i 
                  :class="{
                    'fa fa-signal text-success': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 80,
                    'fa fa-signal text-primary': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 60 && carsStatus.get(car.id)?.signal < 80,
                    'fa fa-signal text-warning': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 40 && carsStatus.get(car.id)?.signal < 60,
                    'fa fa-signal text-danger': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 20 && carsStatus.get(car.id)?.signal < 40,
                    'fa fa-signal text-danger': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal < 20,
                    'fa fa-signal text-gray-400': isNaN(carsStatus.get(car.id)?.signal)
                  }"
                ></i>
              </div>
              <div class="text-2xl font-bold mb-1">{{ carsStatus.get(car.id)?.signal != null && !isNaN(carsStatus.get(car.id)?.signal) ? carsStatus.get(car.id)?.signal.toFixed(1) + '%' : 'NaN' }}</div>
              <div class="text-sm" :class="{
                'text-success': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 80,
                'text-primary': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 60 && carsStatus.get(car.id)?.signal < 80,
                'text-warning': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 40 && carsStatus.get(car.id)?.signal < 60,
                'text-danger': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal < 40,
                'text-gray-400': isNaN(carsStatus.get(car.id)?.signal)
              }">
                {{ !isNaN(carsStatus.get(car.id)?.signal) ? (carsStatus.get(car.id)?.signal >= 80 ? '信号极佳' : (carsStatus.get(car.id)?.signal >= 60 ? '信号良好' : (carsStatus.get(car.id)?.signal >= 40 ? '信号一般' : '信号较差'))) : '未知' }}
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                class="h-3 rounded-full transition-all duration-500 ease-out"
                :class="{
                  'bg-success': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 80,
                  'bg-primary': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 60 && carsStatus.get(car.id)?.signal < 80,
                  'bg-warning': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal >= 40 && carsStatus.get(car.id)?.signal < 60,
                  'bg-danger': !isNaN(carsStatus.get(car.id)?.signal) && carsStatus.get(car.id)?.signal < 40,
                  'bg-gray-300': isNaN(carsStatus.get(car.id)?.signal)
                }"
                :style="{ width: !isNaN(carsStatus.get(car.id)?.signal) ? `${carsStatus.get(car.id)?.signal}%` : '0%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 单个摄像头放大界面 -->
    <div v-if="showSingleCameraModal" class="fixed inset-0 bg-black flex flex-col z-50" @keydown.esc="showSingleCameraModal = false">
      <!-- 顶部导航栏 -->
      <div class="bg-black bg-opacity-90 p-4 flex justify-between items-center border-b border-gray-800">
        <h3 class="text-xl font-medium text-white">{{ selectedCamera.name }} - 摄像头画面</h3>
        <button @click="showSingleCameraModal = false" class="text-white hover:text-gray-300 text-2xl p-2 rounded-full hover:bg-gray-800 transition-all">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <!-- 摄像头画面区域 -->
      <div class="flex-1 flex items-center justify-center p-4">
        <div class="max-w-full max-h-full">
          <img :src="selectedCamera.src" :alt="selectedCamera.alt" class="w-full h-full object-contain">
        </div>
      </div>
    </div>
    
    <!-- 系统配置弹窗 -->
    <div v-if="showSystemConfigModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">系统配置</h3>
          <button @click="showSystemConfigModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">系统名称</label>
            <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" value="智能小车控制系统" disabled>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">系统版本</label>
            <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" value="v1.0.0" disabled>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">API地址</label>
            <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" value="http://192.168.31.56:8000" disabled>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">更新频率</label>
            <input type="number" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" value="3" disabled>
            <p class="text-xs text-gray-500 mt-1">单位：秒</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作日志弹窗 -->
    <div v-if="showOperationLogModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">操作日志</h3>
          <button @click="showOperationLogModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="log in operationLogs" :key="log.id" class="p-3 border border-gray-200 rounded-md">
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ log.type }}</span>
              <span class="text-xs text-gray-500">{{ log.timestamp }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ log.content }}</p>
          </div>
          <div v-if="operationLogs.length === 0" class="p-6 text-center text-gray-500">
            <p>暂无操作日志</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帮助中心弹窗 -->
    <div v-if="showHelpCenterModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">帮助中心</h3>
          <button @click="showHelpCenterModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-primary mb-2">系统功能</h4>
            <p class="text-sm text-gray-600">本系统提供智能小车的远程监控、任务管理、设备管理等功能，支持多小车协同作业。</p>
          </div>
          <div>
            <h4 class="font-medium text-primary mb-2">常见问题</h4>
            <div class="space-y-2">
              <div>
                <p class="text-sm font-medium">如何创建任务？</p>
                <p class="text-sm text-gray-600">在任务规划页面点击"新建任务"按钮，填写任务信息并设置路径即可。</p>
              </div>
              <div>
                <p class="text-sm font-medium">如何添加设备？</p>
                <p class="text-sm text-gray-600">在设备管理页面点击"新增设备"按钮，选择设备类型并填写相关信息。</p>
              </div>
              <div>
                <p class="text-sm font-medium">如何查看小车状态？</p>
                <p class="text-sm text-gray-600">在首页地图监控页面可以实时查看小车的位置和状态信息。</p>
              </div>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-primary mb-2">联系我们</h4>
            <p class="text-sm text-gray-600">邮箱：xxx@xxx.com</p>
            <p class="text-sm text-gray-600">电话：123-123-1234</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.page-btn {
  transition: all 0.2s;
}

.page-btn:hover {
  background-color: #f3f4f6;
}

.page-btn.active {
  background-color: #165DFF;
  color: white;
}

.sidebar-item {
  transition: all 0.2s;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
}
</style>

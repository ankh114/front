<script setup>
import { ref, onMounted } from 'vue'
import MapMonitor from './components/MapMonitor.vue'
import DeviceManagement from './components/DeviceManagement.vue'
import TaskPlanning from './components/TaskPlanning.vue'
import IssueManagement from './components/IssueManagement.vue'
import { initialDevices } from './utils/device.js'

const currentPage = ref('map')

// 控制弹窗显示的状态变量
const showCameraModal = ref(false)
const showBatteryModal = ref(false)
const showSpeedModal = ref(false)
const showSignalModal = ref(false)

// MapMonitor组件引用
const mapMonitorRef = ref(null)

// 设备状态数据
const devices = ref([])

// 模拟设备速度和信号强度数据
onMounted(() => {
  // 复制初始设备数据并添加模拟的速度和信号强度
  devices.value = initialDevices.map(device => ({
    ...device,
    speed: Math.random() * 2, // 0-2 m/s
    signal: Math.floor(Math.random() * 100) // 0-100%
  }))
})

const changePage = (page) => {
  currentPage.value = page
}

// 定位小车
const handleLocateTrolley = () => {
  currentPage.value = 'map'
  // 调用MapMonitor组件的定位方法
  setTimeout(() => {
    if (mapMonitorRef.value) {
      mapMonitorRef.value.locateTrolley()
    }
  }, 100)
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
</script>

<template>
  <div class="app-container flex flex-col h-screen">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
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
            :class="{ 'active bg-primary text-white': currentPage === 'device' }"
            @click="changePage('device')"
          >
            设备管理
          </button>
          <button 
            class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
            :class="{ 'active bg-primary text-white': currentPage === 'task' }"
            @click="changePage('task')"
          >
            任务规划
          </button>
          <button 
            class="page-btn px-4 py-2 text-sm font-medium rounded-md" 
            :class="{ 'active bg-primary text-white': currentPage === 'issue' }"
            @click="changePage('issue')"
          >
            问题管理
          </button>
        </nav>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧边栏 -->
      <aside class="w-64 bg-white shadow-sm p-4 hidden md:block overflow-y-auto">
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
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <i class="fa fa-cog w-5 text-center"></i>
              <span>系统配置</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <i class="fa fa-history w-5 text-center"></i>
              <span>操作日志</span>
            </div>
            <div class="sidebar-item flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <i class="fa fa-question-circle w-5 text-center"></i>
              <span>帮助中心</span>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- 页面内容区 -->
      <div class="flex-1 overflow-hidden relative">
        <MapMonitor v-if="currentPage === 'map'" ref="mapMonitorRef" />
        <DeviceManagement v-if="currentPage === 'device'" />
        <TaskPlanning v-if="currentPage === 'task'" />
        <IssueManagement v-if="currentPage === 'issue'" />
      </div>
    </main>
    
    <!-- 摄像头画面弹窗 -->
    <div v-if="showCameraModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-4 w-96">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">摄像头画面</h3>
          <button @click="showCameraModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times"></i>
          </button>
        </div>
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
        <div class="space-y-4">
          <div v-for="device in devices" :key="device.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ device.name }}</div>
              <div :class="{
                'text-green-600': device.status === '运行中',
                'text-yellow-600': device.status === '待机中',
                'text-red-600': device.status === '故障'
              }">
                {{ device.status }}
              </div>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <i :class="{
                'fa fa-battery-full text-success': device.battery >= 80,
                'fa fa-battery-three-quarters text-success': device.battery >= 60 && device.battery < 80,
                'fa fa-battery-half text-warning': device.battery >= 40 && device.battery < 60,
                'fa fa-battery-quarter text-danger': device.battery >= 20 && device.battery < 40,
                'fa fa-battery-empty text-danger': device.battery < 20
              }" class="text-2xl"></i>
              <span class="text-lg font-bold">{{ device.battery }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500 ease-out"
                :class="{
                  'bg-success': device.battery >= 60,
                  'bg-warning': device.battery >= 20 && device.battery < 60,
                  'bg-danger': device.battery < 20
                }"
                :style="{ width: `${device.battery}%` }"
              ></div>
            </div>
            <div class="text-sm text-gray-500 mt-1">
              预计续航: {{ Math.round(device.battery * 0.055 * 10) / 10 }}小时
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
        <div class="space-y-4">
          <div v-for="device in devices" :key="device.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ device.name }}</div>
              <div :class="{
                'text-green-600': device.status === '运行中',
                'text-yellow-600': device.status === '待机中',
                'text-red-600': device.status === '故障'
              }">
                {{ device.status }}
              </div>
            </div>
            <div class="flex flex-col items-center py-3">
              <div class="text-4xl mb-2">
                <i class="fa fa-tachometer-alt text-primary"></i>
              </div>
              <div class="text-3xl font-bold mb-1">
                {{ device.status === '运行中' ? device.speed.toFixed(1) : '0.0' }} m/s
              </div>
              <div class="text-sm text-gray-500">当前速度</div>
            </div>
            <div v-if="device.status === '运行中'" class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full bg-primary transition-all duration-500 ease-out"
                :style="{ width: `${(device.speed / 2) * 100}%` }"
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
        <div class="space-y-4">
          <div v-for="device in devices" :key="device.id" class="p-3 border rounded-md">
            <div class="flex justify-between items-center mb-2">
              <div class="font-medium">{{ device.name }}</div>
              <div class="text-sm">IP: {{ device.ip }}</div>
            </div>
            <div class="flex flex-col items-center py-3">
              <div class="text-4xl mb-2">
                <i 
                  :class="{
                    'fa fa-signal text-success': device.signal >= 80,
                    'fa fa-signal text-primary': device.signal >= 60 && device.signal < 80,
                    'fa fa-signal text-warning': device.signal >= 40 && device.signal < 60,
                    'fa fa-signal text-danger': device.signal >= 20 && device.signal < 40,
                    'fa fa-signal text-danger': device.signal < 20
                  }"
                ></i>
              </div>
              <div class="text-3xl font-bold mb-1">{{ device.signal }}%</div>
              <div class="text-sm" :class="{
                'text-success': device.signal >= 80,
                'text-primary': device.signal >= 60 && device.signal < 80,
                'text-warning': device.signal >= 40 && device.signal < 60,
                'text-danger': device.signal < 40
              }">
                {{ device.signal >= 80 ? '信号极佳' : device.signal >= 60 ? '信号良好' : device.signal >= 40 ? '信号一般' : '信号较差' }}
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500 ease-out"
                :class="{
                  'bg-success': device.signal >= 80,
                  'bg-primary': device.signal >= 60 && device.signal < 80,
                  'bg-warning': device.signal >= 40 && device.signal < 60,
                  'bg-danger': device.signal < 40
                }"
                :style="{ width: `${device.signal}%` }"
              ></div>
            </div>
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

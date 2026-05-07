<template>
  <div class="page-content flex h-screen" id="map-page">
    <!-- 左侧任务列表侧边栏 -->
    <div class="absolute left-0 top-0 h-full z-50">
      <!-- 侧边栏展开按钮 -->
      <button 
        v-if="!showTaskList"
        class="absolute left-0 top-4 bg-primary text-white px-4 py-2 rounded-r-lg shadow-lg hover:bg-primary-dark transition-all duration-300 z-20"
        @click="showTaskList = !showTaskList"
      >
        <i class="fa fa-list mr-1"></i> 任务列表
      </button>
      
      <!-- 任务列表内容 -->
      <Transition name="slide-sidebar">
        <div v-if="showTaskList" class="bg-white shadow-lg rounded-r-lg w-96 h-full flex flex-col overflow-hidden z-10">
          <!-- 侧边栏标题 -->
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-medium">任务列表</h3>
            <button 
              class="text-gray-400 hover:text-gray-600"
              @click="showTaskList = !showTaskList"
            >
              <i class="fa fa-times text-lg"></i>
            </button>
          </div>
          
          <!-- 任务状态筛选 -->
          <div class="p-4 border-b">
            <div class="relative">
              <select 
                class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white"
                @change="changeSelectFilter"
                :value="currentFilter"
              >
                <option value="all">所有任务</option>
                <option value="running">进行中</option>
                <option value="pending">待执行</option>
                <option value="completed">已完成</option>
                <option value="canceled">已取消</option>
              </select>
              <i class="fa fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <!-- 任务状态标签 -->
          <div class="p-4 border-b">
            <div class="flex space-x-2 overflow-x-auto pb-2">
              <button 
                class="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors"
                :class="currentFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-primary/10'"
                @click="changeFilter('all')"
              >
                所有任务
              </button>
              <button 
                class="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors"
                :class="currentFilter === 'running' ? 'bg-primary text-white' : statusStyles.running + ' hover:bg-green-200'"
                @click="changeFilter('running')"
              >
                进行中
              </button>
              <button 
                class="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors"
                :class="currentFilter === 'pending' ? 'bg-primary text-white' : statusStyles.pending + ' hover:bg-blue-200'"
                @click="changeFilter('pending')"
              >
                待执行
              </button>
              <button 
                class="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors"
                :class="currentFilter === 'completed' ? 'bg-primary text-white' : statusStyles.completed + ' hover:bg-gray-200'"
                @click="changeFilter('completed')"
              >
                已完成
              </button>
              <button 
                class="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors"
                :class="currentFilter === 'canceled' ? 'bg-primary text-white' : statusStyles.canceled + ' hover:bg-orange-200'"
                @click="changeFilter('canceled')"
              >
                已取消
              </button>
            </div>
          </div>
          
          <!-- 任务列表 -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-3">
              <div 
                v-for="task in filteredTasks" 
                :key="task.id"
                class="p-2 rounded-lg cursor-pointer transition-colors"
                :class="{
                  'bg-primary/10 border border-primary/20': task.status === 'running',
                  'bg-white border border-gray-200 hover:border-primary/30 hover:bg-primary/5': task.status !== 'running',
                  'bg-primary/20 border border-primary': selectedTaskId === task.id
                }"
                @click.stop="showTaskMap(task)"
              >
                <div class="flex justify-between items-center">
                  <div class="font-medium text-sm">{{ task.name }}</div>
                  <button 
                    class="text-xs text-purple-600 hover:text-purple-800 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="recallCar(task)"
                    title="一键召回"
                  >
                    <i class="fa fa-home mr-1"></i> 召回
                  </button>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <div class="text-xs text-gray-500">{{ task.device }}</div>
                  <div 
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="statusStyles[typeof task.status === 'number' ? numberToStatusMap[task.status] || 'unknown' : task.status || 'unknown']"
                  >
                    {{ statusLabels[typeof task.status === 'number' ? numberToStatusMap[task.status] || 'unknown' : task.status || 'unknown'] || task.status }}
                  </div>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ task.time }}</div>
                <div v-if="typeof task.status === 'number' ? task.status === 2 : task.status === 'running'" class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${task.progress}%` }"></div>
                </div>
                <div class="flex flex-nowrap justify-end mt-1 gap-1">
                  <button 
                    class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="showTaskPath(task)"
                    title="显示路径"
                  >
                    <i class="fa fa-map-marker mr-1"></i> 显示路径
                  </button>
                  <button 
                    class="text-xs text-red-600 hover:text-red-800 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="clearTaskPath(task.id)"
                    title="消除路径"
                  >
                    <i class="fa fa-eraser mr-1"></i> 消除路径
                  </button>
                  <button 
                    class="text-xs text-primary hover:text-primary/80 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="$emit('task-detail-click', task)"
                    title="查看任务详情"
                  >
                    <i class="fa fa-eye mr-1"></i> 查看
                  </button>
                  <button 
                    class="text-xs text-green-600 hover:text-green-800 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="startTask(task)"
                    :disabled="(typeof task.status === 'number' ? (task.status === 2 || task.status === 3 || task.status === 5) : (task.status === 'running' || task.status === 'completed' || task.status === 'cancelled'))"
                    title="开始任务"
                  >
                    开始
                  </button>
                  <button 
                    class="text-xs text-orange-600 hover:text-orange-800 focus:outline-none px-2 py-0.5 rounded"
                    @click.stop="togglePauseResume(task)"
                    :disabled="(typeof task.status === 'number' ? !(task.status === 2 || task.status === 6) : !(task.status === 'running' || task.status === 'paused' || task.status === '执行中' || task.status === '待处理' || task.status === '已定时' || task.status === '暂停中'))"
                    title="暂停/继续任务"
                  >
                    {{ (typeof task.status === 'number' ? task.status === 2 : task.status === 'running' || task.status === '执行中') ? '暂停' : '继续' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 侧边栏底部操作按钮 -->
          <div class="p-4 border-t">
            <button class="w-full btn-primary text-sm" @click="emit('new-task-click')">
              <i class="fa fa-plus mr-1"></i> 新建任务
            </button>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- 地图容器 -->
    <div id="amapContainer" class="flex-1 h-full p-4 mr-84">
      <!-- 使用iframe加载SLAM地图查看器 -->
      <iframe ref="mapIframe" src="/map_modified.html" class="w-full h-full border-none rounded-lg shadow-lg"></iframe>
    </div>
    
    <!-- 右侧信息面板 -->
    <div class="absolute right-4 top-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100%-32px)] z-50">
      <!-- 摄像头画面 -->
      <div class="p-3 border-b">
        <h3 class="font-medium mb-2">摄像头画面</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer" @click="openCameraModal('https://vjs.zencdn.net/v/oceans.mp4', '前视', '摄像头1')">
            <video src="https://vjs.zencdn.net/v/oceans.mp4" alt="摄像头1" class="w-full h-full object-cover" autoplay loop muted></video>
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">画面1</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer" @click="openCameraModal('https://picsum.photos/1920/1080?random=2', '后视', '摄像头2')">
            <img src="https://picsum.photos/300/200?random=2" alt="摄像头2" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">画面2</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer" @click="openCameraModal('https://picsum.photos/1920/1080?random=3', '左视', '摄像头3')">
            <img src="https://picsum.photos/300/200?random=3" alt="摄像头3" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">画面3</span>
          </div>
          <div class="aspect-video bg-gray-100 rounded overflow-hidden relative cursor-pointer" @click="openCameraModal('https://picsum.photos/1920/1080?random=4', '右视', '摄像头4')">
            <img src="https://picsum.photos/300/200?random=4" alt="摄像头4" class="w-full h-full object-cover">
            <span class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">画面4</span>
          </div>
        </div>
      </div>
      
      <!-- 小车状态 -->
      <div class="p-3 border-b">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-medium">小车状态</h3>
          <select 
            v-model="localSelectedCarId" 
            class="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            :disabled="cars.length === 0"
          >
            <option value="" disabled selected v-if="cars.length === 0">暂无小车</option>
            <option 
              v-for="car in cars" 
              :key="car.id" 
              :value="car.id"
            >
              {{ car.name }}
            </option>
          </select>
        </div>
        
        <div v-if="cars.length === 0" class="text-center py-6 text-gray-500">
          <i class="fa fa-exclamation-triangle mb-2"></i>
          <p>暂无小车数据</p>
        </div>
        
        <div v-else class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">电量</div>
            <div class="flex items-center gap-1 mt-1">
              <i :class="{
                'fa fa-battery-full text-success': !isNaN(carStatus.battery) && carStatus.battery >= 80,
                'fa fa-battery-three-quarters text-success': !isNaN(carStatus.battery) && carStatus.battery >= 60 && carStatus.battery < 80,
                'fa fa-battery-half text-warning': !isNaN(carStatus.battery) && carStatus.battery >= 40 && carStatus.battery < 60,
                'fa fa-battery-quarter text-danger': !isNaN(carStatus.battery) && carStatus.battery >= 20 && carStatus.battery < 40,
                'fa fa-battery-empty text-danger': !isNaN(carStatus.battery) && carStatus.battery < 20,
                'fa fa-battery-three-quarters text-gray-400': isNaN(carStatus.battery)
              }"></i>
              <span 
                class="font-medium battery-percentage cursor-pointer"
                :class="{ 'text-danger underline': isNaN(carStatus.battery) }"
                @click="isNaN(carStatus.battery) && showNaNError('电量')"
              >
                {{ !isNaN(carStatus.battery) ? Math.floor(carStatus.battery) + '%' : 'NaN' }}
              </span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">速度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-tachometer text-primary"></i>
              <span 
                class="font-medium car-speed cursor-pointer"
                :class="{ 'text-danger underline': isNaN(carStatus.speed) }"
                @click="isNaN(carStatus.speed) && showNaNError('速度')"
              >
                {{ carStatus.speed != null && !isNaN(carStatus.speed) ? carStatus.speed.toFixed(1) + ' m/s' : 'NaN' }}
              </span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">温度</div>
            <div class="flex items-center gap-1 mt-1">
              <i class="fa fa-thermometer-half text-warning"></i>
              <span 
                class="font-medium car-temperature cursor-pointer"
                :class="{ 'text-danger underline': isNaN(carStatus.temperature) }"
                @click="isNaN(carStatus.temperature) && showNaNError('温度')"
              >
                {{ carStatus.temperature != null && !isNaN(carStatus.temperature) ? carStatus.temperature.toFixed(1) + '°C' : 'NaN' }}
              </span>
            </div>
          </div>
          <div class="bg-gray-50 p-2 rounded">
            <div class="text-xs text-gray-500">信号</div>
            <div class="flex items-center gap-1 mt-1">
              <i :class="{
                'fa fa-signal text-success': !isNaN(carStatus.signal) && carStatus.signal >= 80,
                'fa fa-signal text-primary': !isNaN(carStatus.signal) && carStatus.signal >= 60 && carStatus.signal < 80,
                'fa fa-signal text-warning': !isNaN(carStatus.signal) && carStatus.signal >= 40 && carStatus.signal < 60,
                'fa fa-signal text-danger': !isNaN(carStatus.signal) && carStatus.signal < 40,
                'fa fa-signal text-gray-400': isNaN(carStatus.signal)
              }"></i>
              <span 
                class="font-medium signal-strength cursor-pointer"
                :class="{ 'text-danger underline': isNaN(carStatus.signal) }"
                @click="isNaN(carStatus.signal) && showNaNError('信号')"
              >
                {{ carStatus.signal != null && !isNaN(carStatus.signal) ? carStatus.signal.toFixed(1) + '%' : 'NaN' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 实时警报 -->
      <div class="flex-1 overflow-y-auto p-3">
        <h3 class="font-medium mb-2 flex justify-between">
          <span>实时警报</span>
          <span v-if="alerts.length > 0" class="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">{{ alerts.length }}条新消息</span>
        </h3>
        
        <div v-if="isLoadingAlerts" class="text-center py-6 text-gray-500">
          <i class="fa fa-spinner fa-spin mb-2"></i>
          <p>加载警报信息中...</p>
        </div>
        
        <div v-else-if="alerts.length === 0" class="text-center py-6 text-gray-500">
          <i class="fa fa-bell-slash mb-2"></i>
          <p>暂无警报信息</p>
        </div>
        
        <div v-else class="space-y-2 alert-container">
          <div 
            v-for="alert in alerts" 
            :key="alert.id"
            :class="[
              'p-2 rounded border-l-4',
              alert.level === 'danger' ? 'bg-danger/10 border-danger' : '',
              alert.level === 'warning' ? 'bg-warning/10 border-warning' : '',
              alert.level === 'info' ? 'bg-primary/10 border-primary' : ''
            ]"
          >
            <div class="text-sm font-medium">{{ alert.message }}</div>
            <div class="text-xs text-gray-500 mt-1 flex justify-between items-center">
              <span>{{ new Date(alert.time).toLocaleString() }}</span>
              <span v-if="alert.taskName" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {{ alert.taskName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 坐标选择模态框 -->
  <div v-if="showCoordinateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6 border-b">
        <h3 class="text-lg font-medium">地图坐标</h3>
        <button @click="showCoordinateModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">经度</label>
            <input type="text" v-model="selectedCoordinates.lon" class="w-full border border-gray-300 rounded-lg px-3 py-2" readonly>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">纬度</label>
            <input type="text" v-model="selectedCoordinates.lat" class="w-full border border-gray-300 rounded-lg px-3 py-2" readonly>
          </div>
          <div class="pt-2">
            <button class="w-full btn-primary flex items-center justify-center gap-2" @click="sendCoordinates">
              <i v-if="isSending" class="fa fa-spinner fa-spin"></i>
              <i v-else class="fa fa-paper-plane"></i>
              {{ isSending ? '发送中...' : '发送到后端' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务地图查看模态框 -->
    <div v-if="showTaskMapModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 模态框标题 -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-medium">任务地图 - {{ viewedTask?.name }}</h3>
          <button 
            class="text-gray-400 hover:text-gray-600"
            @click="showTaskMapModal = false"
          >
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>
        
        <!-- 地图容器 -->
        <div id="task-map-view-container" class="flex-1 min-h-[400px]"></div>
        
        <!-- 任务信息 -->
        <div class="p-4 border-t">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">任务ID</p>
              <p class="font-medium">{{ viewedTask?.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">状态</p>
              <p class="font-medium">{{ viewedTask?.status }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">创建时间</p>
              <p class="font-medium">{{ viewedTask?.time }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">设备</p>
              <p class="font-medium">{{ viewedTask?.device }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- NaN报错信息模态框 -->
    <div v-if="showNaNModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium text-danger">数据获取失败</h3>
          <button @click="showNaNModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>
        <div class="p-4">
          <pre class="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{{ naNModalInfo.message }}</pre>
        </div>
        <div class="p-4 border-t">
          <button @click="showNaNModal = false" class="w-full btn-primary">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
// 先导入axios
import axios from 'axios'

// 导入配置
import { getWebSocketUrl } from '../utils/config.js'

// 再导入API
import * as api from '../utils/api'
const { taskApi, deviceApi, robotApi, missionApi, carApi, issueApi, pathApi } = api

// 确保pathApi全局可用
globalThis.mapMonitorPathApi = pathApi



let viewer = null
let statusUpdateInterval = null
let carMarkers = {} // 存储多个小车标记，键为小车ID
let taskMapViewer = ref(null)
let viewCarMarker = null
let mapIframe = ref(null) // 主地图iframe引用

// 小车颜色映射
const carColors = {
  1: { bg: '#FFC107', border: '#FF9800' }, // 黄色
  2: { bg: '#4CAF50', border: '#388E3C' }, // 绿色
  3: { bg: '#2196F3', border: '#1976D2' }, // 蓝色
  4: { bg: '#9C27B0', border: '#7B1FA2' }, // 紫色
  5: { bg: '#FF5722', border: '#E64A19' }, // 橙色
  6: { bg: '#00BCD4', border: '#0097A7' }, // 青色
  7: { bg: '#F44336', border: '#D32F2F' }, // 红色
  8: { bg: '#795548', border: '#5D4037' }, // 棕色
  9: { bg: '#607D8B', border: '#455A64' }, // 蓝灰色
  10: { bg: '#CDDC39', border: '#8BC34A' } // 浅绿色
}

// 路径颜色数组，用于区分不同任务的路径
const pathColors = [
  '#FF0000', // 红色
  '#00FF00', // 绿色
  '#0000FF', // 蓝色
  '#FF00FF', // 洋红色
  '#00FFFF', // 青色
  '#FFA500', // 橙色
  '#800080', // 紫色
  '#008000', // 深绿色
  '#000080', // 深蓝色
  '#800000'  // 深红色
]

// 存储路径图层的映射
const pathLayers = ref(new Map())

// 存储路径点标记的映射
const pathMarkers = ref(new Map())

// 添加axios取消令牌
const cancelTokenSource = ref(axios.CancelToken.source())

// 任务地图模态框状态
const viewedTask = ref(null)
const showTaskMapModal = ref(false)

// 接收从父组件传递的数据
const props = defineProps({
  cars: {
    type: Array,
    default: () => []
  },
  devices: {
    type: Array,
    default: () => []
  },
  carsStatus: {
    type: Map,
    default: () => new Map()
  },
  selectedCarId: {
    type: [String, Number],
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['camera-click', 'new-task-click', 'task-detail-click', 'update:selectedCarId']) 

// 当前选中的小车ID（本地状态，用于v-model）
const localSelectedCarId = ref(props.selectedCarId)

// 当父组件的selectedCarId变化时，更新本地状态
watch(() => props.selectedCarId, (newId) => {
  localSelectedCarId.value = newId
})

// 当本地的selectedCarId变化时，通知父组件
watch(localSelectedCarId, (newId) => {
  emit('update:selectedCarId', newId)
})

// 打开摄像头模态框
const openCameraModal = (src, name, alt) => {
  emit('camera-click', { src, name, alt })
}

// 当前选中小车的状态（计算属性，从props.carsStatus中获取）
const carStatus = computed(() => {
  if (!localSelectedCarId.value) {
    return {
      battery: NaN,
      speed: NaN,
      temperature: NaN,
      signal: NaN,
      status: 'idle'
    }
  }
  
  // 尝试使用不同类型的键获取状态，确保能找到匹配的状态
  const possibleKeys = [
    localSelectedCarId.value,
    String(localSelectedCarId.value),
    Number(localSelectedCarId.value)
  ]
  
  for (const key of possibleKeys) {
    const status = props.carsStatus.get(key)
    if (status) {
      return status
    }
  }
  
  return {
    battery: NaN,
    speed: NaN,
    temperature: NaN,
    signal: NaN,
    status: 'idle'
  }
})

// 显示NaN报错信息的模态框状态
const showNaNModal = ref(false)
const naNModalInfo = ref({
  field: '',
  message: ''
})

// 显示NaN报错信息的函数（已废弃，不再使用）
const showNaNError = (field) => {
  // 不再显示调试信息
}

// 坐标模态框状态
const showCoordinateModal = ref(false)
const selectedCoordinates = ref({ lon: 0, lat: 0 })
const isSending = ref(false)

// 任务相关状态
const currentTask = ref(null) // 当前选中的任务

// 警报相关状态
const alerts = ref([]) // 警报列表
const isLoadingAlerts = ref(false) // 加载状态

// 当小车列表变化时，自动选择第一个小车
watch(() => props.cars, (newCars) => {
  if (newCars.length > 0 && !localSelectedCarId.value) {
    localSelectedCarId.value = newCars[0].id
  }
}, { immediate: true })

// 当选中小车变化时，更新车辆状态和WebSocket连接
watch(localSelectedCarId, (newCarId) => {
  if (newCarId) {
    // 先获取一次最新状态
    fetchCarStatus(newCarId)
    // 更新WebSocket连接
    connectWebSocket(newCarId)
  } else {
    // 断开WebSocket连接
    disconnectWebSocket()
  }
})

// 组件挂载时，如果有选中小车，获取状态和建立WebSocket连接
onMounted(() => {
  if (props.cars.length > 0 && !localSelectedCarId.value) {
    localSelectedCarId.value = props.cars[0].id
  }
  if (localSelectedCarId.value) {
    fetchCarStatus(localSelectedCarId.value)
    connectWebSocket(localSelectedCarId.value)
  }
})

// 将后端任务转换为前端显示格式
const convertBackendTaskToFrontend = (task) => {
  // 确保path是数组格式
  const path = task.path ? Array.isArray(task.path) ? task.path : [] : []
  
  // 将数字状态转换为字符串状态
  const status = typeof task.status === 'number' ? numberToStatusMap[task.status] || 'unknown' : task.status
  
  return {
    ...task,
    path: path,
    status: status
  }
}

// 从API获取任务列表
const fetchTasks = async () => {
  try {
    const response = await taskApi.get()
    const tasksData = response.data || []
    
    // 将后端任务转换为前端格式
    tasks.value = tasksData.map(convertBackendTaskToFrontend)
    
    // 为所有执行中的任务的小车创建WebSocket连接
    connectAllRunningCars()
  } catch (error) {
    if (axios.isCancel(error)) {
      // console.log('请求已取消:', error.message)
      return
    }
    console.error('获取任务列表失败:', error)
    
    // 出错时不显示数据
    tasks.value = []
  }
}

// 从API获取汽车状态
const fetchCarStatus = async (carId) => {
  try {
    // 尝试所有可能的键类型
    const possibleKeys = [
      carId,
      String(carId),
      Number(carId)
    ]
    
    // 先尝试从API获取状态
    try {
      const response = await carApi.getStatus(carId)
      const status = response.data || {}
      
      // 找到已存在的状态或创建新状态
      let currentStatus = null
      for (const key of possibleKeys) {
        currentStatus = props.carsStatus.get(key)
        if (currentStatus) break
      }
      
      if (!currentStatus) {
        currentStatus = {
          battery: NaN,
          speed: NaN,
          temperature: NaN,
          signal: NaN,
          status: 'idle'
        }
      }
      
      const carStatusData = {
        battery: status.battery !== undefined ? status.battery : currentStatus.battery,
        speed: status.speed !== undefined ? status.speed : currentStatus.speed,
        temperature: status.temperature !== undefined ? status.temperature : currentStatus.temperature,
        signal: status.signal !== undefined ? status.signal : currentStatus.signal,
        status: status.status || currentStatus.status
      }
      
      // 存储状态到所有可能的键，确保能被正确获取
      for (const key of possibleKeys) {
        props.carsStatus.set(key, carStatusData)
      }
    } catch (apiError) {
      // console.log('API获取状态失败，使用WebSocket数据:', apiError.message)
      // API失败时不抛出错误，继续使用WebSocket数据
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      // console.log('请求已取消:', error.message)
      return
    }
    console.error('获取汽车状态失败:', error)
  }
}

// 从API获取警报信息
const fetchAlerts = async () => {
  try {
    isLoadingAlerts.value = true
    
    // 并行获取问题和任务数据
    const [issuesResponse, tasksResponse] = await Promise.all([
      issueApi.getAll(),
      taskApi.get()
    ])
    
    const issues = issuesResponse.data || []
    const taskList = tasksResponse.data || []
    
    // 创建任务ID到任务名称的映射
    const taskMap = {}
    taskList.forEach(task => {
      taskMap[task.id] = task.name || `任务${task.id}`
    })
    
    // 为每个问题获取任务名称
    const alertsWithTaskName = await Promise.all(
      issues.map(async (issue) => {
        // 根据问题类型设置警报级别
        let level = 'info'
        if (issue.type === 'obstacle' || issue.type === 'error') {
          level = 'danger'
        } else if (issue.type === 'warning' || issue.type === 'vibration') {
          level = 'warning'
        } else if (issue.type === 'info' || issue.type === 'checkpoint') {
          level = 'info'
        }
        
        let taskName = taskMap[issue.task_id] || '未知任务'
        
        // 如果任务名称是'未知任务'且有task_id，尝试通过API获取
        if (taskName === '未知任务' && issue.task_id) {
          try {
            const taskResponse = await taskApi.getById(issue.task_id)
            const taskData = taskResponse.data
            if (taskData && taskData.name) {
              taskName = taskData.name
            }
          } catch (error) {
            console.error(`获取任务${issue.task_id}详情失败:`, error)
          }
        }
        
        return {
          id: issue.id,
          message: issue.description || issue.title || '未知警报',
          time: issue.created_at || issue.timestamp || new Date().toISOString(),
          level: level,
          taskId: issue.task_id,
          taskName: taskName
        }
      })
    )
    
    alerts.value = alertsWithTaskName
    
    // 按时间倒序排序，最新的警报在前面
    alerts.value.sort((a, b) => new Date(b.time) - new Date(a.time))
  } catch (error) {
    console.error('获取警报信息失败:', error)
    alerts.value = []
  } finally {
    isLoadingAlerts.value = false
  }
}

// 转换路径点为SLAM地图坐标
const convertPathToSlamCoordinates = (pathPoints) => {
  return pathPoints.map(point => {
    // 这里需要根据实际的坐标转换逻辑进行调整
    // 暂时使用简单的转换，实际项目中需要根据地图的原点和比例尺进行计算
    return {
      x: Math.floor((parseFloat(point.lon) + 24.25) / 0.05),
      y: Math.floor((31.25 - parseFloat(point.lat)) / 0.05)
    }
  })
}

// 更新SLAM地图上的路径
const updatePathOnSlamMap = (pathPoints) => {
  // console.log('updatePathOnSlamMap called with:', pathPoints)
  
  if (!mapIframe.value) {
    console.error('mapIframe is not available')
    return
  }
  
  if (!mapIframe.value.contentWindow) {
    console.error('mapIframe contentWindow is not available')
    return
  }
  
  if (!mapIframe.value.contentWindow.SlamMapViewer) {
    console.error('SlamMapViewer is not available')
    return
  }
  
  // 确保路径点是数组
  if (!Array.isArray(pathPoints)) {
    console.error('Path points is not an array:', pathPoints)
    return
  }
  
  // console.log('Calling SlamMapViewer.setPath with', pathPoints.length, 'points')
  // 直接使用像素坐标路径
  mapIframe.value.contentWindow.SlamMapViewer.setPath(pathPoints)
  // console.log('SlamMapViewer.setPath called successfully')
}

// 更新SLAM地图上的小车位置
const updateCarPositionOnSlamMap = (carId, position) => {
  if (!mapIframe.value || !mapIframe.value.contentWindow || !mapIframe.value.contentWindow.SlamMapViewer) {
    return
  }
  
  if (position.longitude && position.latitude) {
    const carPosition = {
      x: Math.floor((position.longitude + 24.25) / 0.05),
      y: Math.floor((31.25 - position.latitude) / 0.05),
      angle: 0 // 暂时设置为0，实际项目中需要根据小车的朝向进行设置
    }
    mapIframe.value.contentWindow.SlamMapViewer.setCarPosition(carPosition)
  }
}

onMounted(async () => {
  // 先获取任务数据
  await fetchTasks()
  
  fetchAlerts()
  
  // 为所有执行中的任务的小车创建WebSocket连接
  connectAllRunningCars()
  
  // 开始定期获取所有小车的状态
  startCarStatusUpdate()
  
  // 每30秒刷新一次警报信息
  setInterval(fetchAlerts, 30000)
  
  // 等待iframe加载完成后，设置路径和小车位置
  if (mapIframe.value) {
    mapIframe.value.onload = function() {
      // 可以在这里设置默认路径或小车位置
      // console.log('Map iframe loaded')
    }
  }
})



onUnmounted(() => {
  // 取消所有正在进行的请求
  try {
    cancelTokenSource.value.cancel('组件已卸载')
    // console.log('已取消所有请求')
  } catch (error) {
    console.error('取消请求失败:', error)
  }
  
  // 清理地图实例
  if (viewer) {
    try {
      viewer.remove()
      // console.log('Map instance removed')
    } catch (error) {
      console.error('Error removing map instance:', error)
    }
    viewer = null
  }
  
  // 清理状态更新定时器
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
    statusUpdateInterval = null
  }
  
  // 清理WebSocket连接
  disconnectWebSocket()
  
  // 清理小车标记
  if (Object.keys(carMarkers).length > 0) {
    try {
      for (const carId in carMarkers) {
        if (viewer) {
          viewer.removeLayer(carMarkers[carId])
        }
      }
      carMarkers = {}
    } catch (error) {
      console.error('Error removing car markers:', error)
    }
  }
  
  // 清理任务地图实例
  if (taskMapViewer.value) {
    try {
      taskMapViewer.value.remove()
      taskMapViewer.value = null
    } catch (error) {
      console.error('Error removing task map viewer:', error)
    }
  }
  
  // 清理任务地图小车标记
  if (viewCarMarker) {
    try {
      if (taskMapViewer.value) {
        taskMapViewer.value.removeLayer(viewCarMarker)
      }
      viewCarMarker = null
    } catch (error) {
      console.error('Error removing view car marker:', error)
    }
  }
  
  // 清理WebSocket重连状态
  websocketReconnectAttempts.value.clear()
})

const initMainMap = () => {
  const mapContainer = document.getElementById('amapContainer')
  if (!mapContainer) {
    console.error('地图容器未找到')
    return
  }
  
  // 使用预加载的Leaflet地图库初始化地图
  if (typeof window.L === 'undefined') {
    console.error('Leaflet地图库未加载')
    mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">地图库加载失败，请刷新页面重试</div>'
    return
  }
  
  try {
    // 设置坐标（国科大杭州高等研究院）
    // 用户提供的坐标：东经120°4'27.980"，北纬30°8'4.049" 转换为十进制
    const lng = 120 + 4/60 + 27.980/3600 // 120.07447°
    const lat = 30 + 8/60 + 4.049/3600 // 30.13442°
    
    // 创建地图实例，使用简单坐标系
    const map = window.L.map(mapContainer, {
      crs: L.CRS.Simple, // 使用简单坐标系
      center: [0, 0], // 中心点
      zoom: 0, // 初始缩放级别
      minZoom: -5, // 最小缩放级别
      maxZoom: 5, // 最大缩放级别
      zoomControl: false, // 关闭缩放控件
      attributionControl: false, // 关闭属性控件
      scrollWheelZoom: true, // 启用滚轮缩放
      doubleClickZoom: true, // 启用双击缩放
      dragging: true, // 启用拖动
      touchZoom: true, // 启用触摸缩放
      keyboard: false // 关闭键盘控制
    })
    
    // 加载并显示SLAM地库地图
    const loadSLAMMap = async () => {
      try {
        // 先加载YAML元数据文件
        const yamlResponse = await fetch('/maps/under_test.yaml');
        if (!yamlResponse.ok) {
          throw new Error('无法加载YAML文件');
        }
        const yamlText = await yamlResponse.text();
        
        // 简单解析YAML文件
        const parseYAML = (text) => {
          const result = {};
          const lines = text.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const parts = trimmed.split(':');
              if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                try {
                  result[key] = JSON.parse(value);
                } catch (e) {
                  result[key] = value;
                }
              }
            }
          }
          return result;
        };
        
        const yamlData = parseYAML(yamlText);
        // console.log('YAML元数据:', yamlData);
        
        // 加载PGM地图文件
        const pgmResponse = await fetch('/maps/under_test.pgm');
        if (!pgmResponse.ok) {
          throw new Error('无法加载PGM地图文件');
        }
        const arrayBuffer = await pgmResponse.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // 解析PGM文件
        let index = 0;
        
        // 读取魔数
        let magic = '';
        while (uint8Array[index] !== 10) {
          magic += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        // 跳过注释
        while (uint8Array[index] === 35) {
          while (uint8Array[index] !== 10) {
            index++;
          }
          index++;
        }
        
        // 读取宽度和高度
        let widthStr = '';
        while (uint8Array[index] !== 32) {
          widthStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        let heightStr = '';
        while (uint8Array[index] !== 10) {
          heightStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        const width = parseInt(widthStr);
        const height = parseInt(heightStr);
        
        // 读取最大灰度值
        let maxGrayStr = '';
        while (uint8Array[index] !== 10) {
          maxGrayStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        // console.log('地图尺寸:', width, 'x', height);
        
        // 创建Canvas并绘制地图
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        // 使用ROS风格的地图颜色映射
        for (let i = 0; i < width * height; i++) {
          const gray = uint8Array[index + i];
          let r, g, b;
          
          // ROS标准颜色映射：
          // - 0: 自由空间（白色）
          // - 100: 完全占据（黑色）
          // - -1: 未知（灰色）
          
          if (gray > 230) {
            // 自由区域 - 白色（类似ROS中的0）
            r = 255;
            g = 255;
            b = 255;
          } else if (gray < 50) {
            // 障碍物 - 深灰色（类似ROS中的100）
            r = 30;
            g = 30;
            b = 30;
          } else {
            // 未知区域 - 中灰色（类似ROS中的-1）
            r = 160;
            g = 160;
            b = 160;
          }
          
          imageData.data[i * 4] = r;
          imageData.data[i * 4 + 1] = g;
          imageData.data[i * 4 + 2] = b;
          imageData.data[i * 4 + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // 将Canvas转换为Data URL
        const dataUrl = canvas.toDataURL();
        
        // 计算地图边界
        const resolution = yamlData.resolution || 0.05;
        const origin = yamlData.origin || [0, 0, 0];
        const mapWidth = width * resolution;
        const mapHeight = height * resolution;
        
        const mapBounds = [
          [origin[1], origin[0]],
          [origin[1] + mapHeight, origin[0] + mapWidth]
        ];
        
        // 创建图像覆盖层
        const imageLayer = L.imageOverlay(dataUrl, mapBounds, {
          opacity: 1,
          interactive: false
        });
        imageLayer.addTo(map);
        
        // 添加地图图例
        const legend = L.control({position: 'bottomright'});
        
        legend.onAdd = function (map) {
          const div = L.DomUtil.create('div', 'info legend');
          div.style.backgroundColor = 'white';
          div.style.padding = '10px';
          div.style.borderRadius = '5px';
          div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
          
          div.innerHTML = `
            <h4 style="margin: 0 0 5px 0; font-size: 14px;">地图图例</h4>
            <div style="margin: 5px 0;">
              <div style="display: flex; align-items: center; margin: 3px 0;">
                <div style="width: 20px; height: 20px; background: #ffffff; border: 1px solid #ccc; margin-right: 8px;"></div>
                <span style="font-size: 12px;">自由区域</span>
              </div>
              <div style="display: flex; align-items: center; margin: 3px 0;">
                <div style="width: 20px; height: 20px; background: #1e1e1e; border: 1px solid #ccc; margin-right: 8px;"></div>
                <span style="font-size: 12px;">障碍物</span>
              </div>
              <div style="display: flex; align-items: center; margin: 3px 0;">
                <div style="width: 20px; height: 20px; background: #a0a0a0; border: 1px solid #ccc; margin-right: 8px;"></div>
                <span style="font-size: 12px;">未知区域</span>
              </div>
            </div>
          `;
          
          return div;
        };
        
        legend.addTo(map);
        
        // 添加地图信息控件
        const mapInfo = L.control({position: 'topright'});
        
        mapInfo.onAdd = function (map) {
          const div = L.DomUtil.create('div', 'info map-info');
          div.style.backgroundColor = 'white';
          div.style.padding = '10px';
          div.style.borderRadius = '5px';
          div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
          
          div.innerHTML = `
            <h4 style="margin: 0 0 5px 0; font-size: 14px;">SLAM地库地图</h4>
            <div style="font-size: 11px; color: #666;">
              <p style="margin: 2px 0;">分辨率: ${resolution}m/像素</p>
              <p style="margin: 2px 0;">尺寸: ${width}x${height}像素</p>
              <p style="margin: 2px 0;">实际尺寸: ${mapWidth != null ? mapWidth.toFixed(1) : '0.0'}x${mapHeight != null ? mapHeight.toFixed(1) : '0.0'}m</p>
            </div>
          `;
          
          return div;
        };
        
        mapInfo.addTo(map);
        
        // 调整地图视图以显示整个地图
        map.fitBounds(mapBounds);
        
        // console.log('地图加载成功');
        
      } catch (error) {
        console.error('加载SLAM地图失败:', error);
        // 如果加载失败，使用备用地图
        loadBackupMap();
      }
    };
    
    // 加载备用地图
    const loadBackupMap = async () => {
      try {
        const response = await fetch('/maps/under_test.pgm');
        if (!response.ok) {
          throw new Error('无法加载备用地图');
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let index = 0;
        let magic = '';
        while (uint8Array[index] !== 10) {
          magic += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        while (uint8Array[index] === 35) {
          while (uint8Array[index] !== 10) {
            index++;
          }
          index++;
        }
        
        let widthStr = '';
        while (uint8Array[index] !== 32) {
          widthStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        let heightStr = '';
        while (uint8Array[index] !== 10) {
          heightStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        let maxGrayStr = '';
        while (uint8Array[index] !== 10) {
          maxGrayStr += String.fromCharCode(uint8Array[index]);
          index++;
        }
        index++;
        
        const width = parseInt(widthStr);
        const height = parseInt(heightStr);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        for (let i = 0; i < width * height; i++) {
          const gray = uint8Array[index + i];
          imageData.data[i * 4] = gray;
          imageData.data[i * 4 + 1] = gray;
          imageData.data[i * 4 + 2] = gray;
          imageData.data[i * 4 + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const dataUrl = canvas.toDataURL();
        const mapBounds = [[-height/2, -width/2], [height/2, width/2]];
        const imageLayer = L.imageOverlay(dataUrl, mapBounds);
        imageLayer.addTo(map);
        map.fitBounds(mapBounds);
      } catch (error) {
        console.error('加载备用地图失败:', error);
        const slamMapUrl = '/maps/underground_parking.svg';
        const mapBounds = [[-400, -300], [400, 300]];
        const imageLayer = L.imageOverlay(slamMapUrl, mapBounds);
        imageLayer.addTo(map);
        map.fitBounds(mapBounds);
      }
    };
    
    // 加载SLAM地图
    loadSLAMMap();
    
    // 存储地图实例
    viewer = map
    
    // 添加地图中心标记
    const marker = window.L.marker([0, 0]).addTo(map)
    
    // 添加标记点标题
    marker.bindPopup('地图中心').openPopup()
    
  } catch (error) {
    console.error('创建地图失败:', error)
    mapContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">地图加载失败: ${error.message}</div>`
  }
}

// 显示任务路径
const showTaskPath = async (task) => {
  try {
    // console.log('showTaskPath called for task:', task.id)
    
    // 先清除之前的路径
    if (mapIframe.value && mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
      mapIframe.value.contentWindow.SlamMapViewer.clearPath()
      // console.log('Cleared previous path')
    }
    
    // 1. 直接从任务中获取path_id
    let pathId = task.path_id
    
    // 2. 如果没有path_id，尝试从path_info中获取
    if (!pathId && task.path_info) {
      pathId = task.path_info.id
    }
    
    // 3. 如果没有path_id，尝试从任务详情中获取
    if (!pathId) {
      // console.log('Fetching task details for path_id')
      const taskResponse = await axios.get(`/api/tasks/${task.id}`)
      const fullTask = taskResponse.data
      pathId = fullTask.path_id || fullTask.path_info?.id
    }
    
    let pathPoints = []
    
    if (pathId) {
      // console.log('Using pathId:', pathId)
      
      // 4. 直接使用axios获取路径数据
      // console.log('Fetching path data with axios')
      const pathResponse = await axios.get(`/api/paths/${pathId}`)
      const pathData = pathResponse.data
      
      // console.log('Path data received:', pathData)
      
      if (pathData && Array.isArray(pathData.waypoints)) {
        // 5. 转换后端返回的路径点格式为SLAM地图查看器期望的格式
        pathPoints = pathData.waypoints.map(point => {
          // 检查路径点格式，支持两种格式：
          // 1. List[double, double] 格式 [x, y]
          // 2. Object 格式 {x, y} 或 {lat, lon} 或 {worldX, worldY}
          if (Array.isArray(point) && point.length >= 2) {
            // List[double, double] 格式
            return {
              x: parseFloat(point[0] || 0),
              y: parseFloat(point[1] || 0),
              isPixelCoord: false // 使用世界坐标
            }
          } else if (typeof point === 'object' && point !== null) {
            // Object 格式
            if (point.worldX !== undefined && point.worldY !== undefined) {
              // {worldX, worldY} 格式
              return {
                x: parseFloat(point.worldX || 0),
                y: parseFloat(point.worldY || 0),
                isPixelCoord: false // 使用世界坐标
              }
            } else if (point.x !== undefined && point.y !== undefined) {
              // {x, y} 格式
              return {
                x: parseFloat(point.x || 0),
                y: parseFloat(point.y || 0),
                isPixelCoord: false // 使用世界坐标
              }
            } else if (point.lat !== undefined && (point.lon !== undefined || point.lng !== undefined)) {
              // {lat, lon} 或 {lat, lng} 格式
              return {
                x: parseFloat(point.lon || point.lng || 0),
                y: parseFloat(point.lat || 0),
                isPixelCoord: false // 使用世界坐标
              }
            }
          }
          // 无效格式，返回默认值
          return {
            x: 0,
            y: 0,
            isPixelCoord: false // 使用世界坐标
          }
        })
      } else {
        console.error('未获取到路径数据:', pathId)
      }
    } else if (task.path && task.path.length > 0) {
      // 如果没有path_id但任务本身有path数据，使用任务自带的路径
      // console.log('Using path from task object')
      pathPoints = task.path.map(point => ({
        x: parseFloat(point.worldX || point.lon || point.x || 0),
        y: parseFloat(point.worldY || point.lat || point.y || 0),
        isPixelCoord: false // 使用世界坐标
      }))
    } else {
      console.error('任务未绑定路径:', task)
      return
    }
    
    // console.log('Path points to display:', pathPoints)
    
    // 6. 更新任务数据
    const taskWithPath = {
      ...task,
      path: pathPoints
    }
    
    // 7. 调用updatePathOnSlamMap显示路径
    updatePathOnSlamMap(taskWithPath.path)
  } catch (error) {
    console.error('加载路径失败:', error)
    console.error('Error details:', error.response || error.message || error)
    
    // 如果获取详情失败，至少尝试使用现有信息显示
    if (task.path && task.path.length > 0) {
      // 转换路径点格式为SLAM地图查看器期望的格式
      const formattedPath = task.path.map(point => {
        // 检查路径点格式，支持两种格式：
        // 1. List[double, double] 格式 [x, y]
        // 2. Object 格式 {x, y} 或 {lat, lon}
        if (Array.isArray(point) && point.length >= 2) {
          // List[double, double] 格式
          return {
            x: parseFloat(point[0] || 0),
            y: parseFloat(point[1] || 0),
            isPixelCoord: true
          }
        } else if (typeof point === 'object' && point !== null) {
          // Object 格式
          if (point.x !== undefined && point.y !== undefined) {
            // {x, y} 格式
            return {
              x: parseFloat(point.x || 0),
              y: parseFloat(point.y || 0),
              isPixelCoord: true
            }
          } else if (point.lat !== undefined && (point.lon !== undefined || point.lng !== undefined)) {
            // {lat, lon} 或 {lat, lng} 格式
            return {
              x: parseFloat(point.lon || point.lng || 0),
              y: parseFloat(point.lat || 0),
              isPixelCoord: true
            }
          }
        }
        // 无效格式，返回默认值
        return {
          x: 0,
          y: 0,
          isPixelCoord: true
        }
      })
      updatePathOnSlamMap(formattedPath)
    }
  }
}

// 根据任务显示地图
// 显示小车位置
const showCarPosition = (carId) => {
  try {
    // 获取小车状态
    const carStatus = props.carsStatus.get(carId) || props.carsStatus.get(String(carId)) || props.carsStatus.get(Number(carId))
    
    // 检查是否有位置信息
    if (carStatus && carStatus.longitude && carStatus.latitude) {
      // 对于SLAM地图
      if (mapIframe.value && mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
        const carPosition = {
          x: carStatus.longitude,
          y: carStatus.latitude,
          angle: carStatus.angle || 0
        }
        mapIframe.value.contentWindow.SlamMapViewer.setCarPosition(carPosition)
      }
      
      // 对于Leaflet地图
      if (viewer) {
        const carPoint = [carStatus.latitude, carStatus.longitude]
        const carColor = carColors[carId] || { bg: '#FFC107', border: '#FF9800' }
        
        // 移除旧的标记
        if (carMarkers[carId]) {
          viewer.removeLayer(carMarkers[carId])
        }
        
        // 创建新的标记，带朝向指示
        const angle = carStatus.angle || 0
        carMarkers[carId] = L.marker(carPoint, {
          icon: L.divIcon({
            className: 'car-marker',
            html: `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${carColor.border}; border: 4px solid ${carColor.bg}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 0 15px rgba(0,0,0,0.4); position: relative;">
                    ${carId}
                    <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(${angle}deg); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 16px solid ${carColor.bg};"></div>
                  </div>`,
            iconSize: [40, 40]
          }),
          rotationAngle: angle
        }).addTo(viewer)
        
        // 绑定 popup
        carMarkers[carId].bindPopup(`小车 ${carId}<br>经度: ${carStatus.longitude}<br>纬度: ${carStatus.latitude}`)
      }
    } else {
      // 尝试从WebSocket获取最新位置
      connectWebSocket(carId)
    }
  } catch (error) {
    console.error('显示小车位置失败:', error)
  }
}

const showTaskMap = async (task) => {
  if (!mapIframe.value || !task) return
  
  try {
    // console.log('Showing task map for task:', task)
    
    // 清除之前的路径
    if (mapIframe.value && mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
      mapIframe.value.contentWindow.SlamMapViewer.clearPath()
      // console.log('Cleared previous path')
    }
    
    // 获取任务绑定的小车ID
    const carId = task.carId || task.car_id
    
    // 如果任务有地图ID，加载对应的地图
    if (task.map_id) {
      // console.log('Loading map:', task.map_id)
      // 重新设置iframe的src，加载对应的地图
      mapIframe.value.src = `/map_modified.html?map=${task.map_id}`
      
      // 等待iframe加载完成后，获取并显示路径和小车位置
      mapIframe.value.onload = async function() {
        // console.log('Iframe loaded, checking SlamMapViewer')
        
        // 确保SlamMapViewer对象存在
        if (mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
          // console.log('SlamMapViewer found, fetching and setting path')
          // 调用showTaskPath获取路径数据
          await showTaskPath(task)
          // console.log('Path fetched and set successfully')
          
          // 显示小车位置
          if (carId) {
            showCarPosition(carId)
          }
        } else {
          // console.log('SlamMapViewer not found, waiting for initialization')
          // 等待一段时间后再次尝试
          setTimeout(async () => {
            if (mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
              // console.log('SlamMapViewer found after delay, fetching and setting path')
              await showTaskPath(task)
              // console.log('Path fetched and set successfully after delay')
              
              // 显示小车位置
              if (carId) {
                showCarPosition(carId)
              }
            } else {
              // console.log('SlamMapViewer still not found')
            }
          }, 1000)
        }
      }
    } else {
      // 如果任务没有地图ID，直接获取并显示路径
      // console.log('No map_id, fetching and setting path directly')
      await showTaskPath(task)
      // console.log('Path fetched and set successfully')
      
      // 显示小车位置
      if (carId) {
        showCarPosition(carId)
      }
    }
  } catch (error) {
    console.error('Error in showTaskMap:', error)
  }
}

const updateCarStatusDisplay = () => {
  const batteryIcon = document.querySelector('.fa-battery-three-quarters')
  if (!isNaN(carStatus.value.battery)) {
    if (carStatus.value.battery < 20) {
      batteryIcon.className = 'fa fa-battery-empty text-danger'
    } else if (carStatus.value.battery < 50) {
      batteryIcon.className = 'fa fa-battery-half text-warning'
    } else {
      batteryIcon.className = 'fa fa-battery-three-quarters text-success'
    }
  }
  
  const tempIcon = document.querySelector('.fa-thermometer-half')
  if (!isNaN(carStatus.value.temperature)) {
    if (carStatus.value.temperature > 40) {
      tempIcon.className = 'fa fa-thermometer-full text-danger'
    } else if (carStatus.value.temperature > 35) {
      tempIcon.className = 'fa fa-thermometer-three-quarters text-warning'
    } else {
      tempIcon.className = 'fa fa-thermometer-half text-warning'
    }
  }
  
  const signalIcon = document.querySelector('.fa-signal')
  if (!isNaN(carStatus.value.signal)) {
    if (carStatus.value.signal < 30) {
      signalIcon.className = 'fa fa-signal text-danger'
    } else if (carStatus.value.signal < 60) {
      signalIcon.className = 'fa fa-signal text-warning'
    } else {
      signalIcon.className = 'fa fa-signal text-success'
    }
  }
}

// 发送坐标到后端（保留原有功能）
const sendCoordinates = async () => {
  try {
    isSending.value = true
    
    // 打印坐标信息
    // console.log('发送坐标到后端:', selectedCoordinates.value)
    
    // 方案1：使用现有任务API创建包含坐标的任务
    const response = await taskApi.create({
      name: '地图点击坐标',
      mapCenter: selectedCoordinates.value,
      status: 'pending'
    })
    
    // console.log('坐标发送成功:', response.data)
    alert('坐标发送成功！')
    
    // 关闭模态框
    showCoordinateModal.value = false
  } catch (error) {
    console.error('发送坐标失败:', error)
    alert('发送坐标失败: ' + error.message)
  } finally {
    isSending.value = false
  }
}

const startCarStatusUpdate = () => {
  // 获取所有小车的状态
  fetchAllCarsStatus()
  
  statusUpdateInterval = setInterval(() => {
    fetchAllCarsStatus()
  }, 5000) // 从2秒改为5秒，减少不必要的请求
}

// 获取所有小车的状态
const fetchAllCarsStatus = () => {
  // 收集所有小车ID
  const allCarIds = new Set();
  
  // 从props.cars中获取所有小车ID
  props.cars.forEach(car => {
    if (car.id) {
      allCarIds.add(car.id);
    }
  });
  
  // 从任务中获取小车ID（确保不遗漏）
  tasks.value.forEach(task => {
    if (task.carId) {
      allCarIds.add(task.carId);
    }
  });
  
  // console.log(`开始获取 ${allCarIds.size} 个小车的状态`);
  
  // 为每个小车获取状态，添加延迟以避免并发请求过多
  let delay = 0;
  allCarIds.forEach(carId => {
    setTimeout(() => {
      fetchCarStatus(carId);
    }, delay);
    delay += 100; // 每个请求延迟100毫秒
  });
  
  // console.log('已调度所有小车状态获取请求');
}

// 任务列表侧边栏显示状态
const showTaskList = ref(false)

// 任务数据
const tasks = ref([])

// 当前筛选状态
const currentFilter = ref('all')

// 当前选中的任务
const selectedTaskId = ref(null)

// WebSocket相关状态
const websockets = ref(new Map()) // 存储多个WebSocket连接，键为小车ID
const isWebSocketConnected = ref(false) // 只要有一个连接成功，就视为连接状态
const websocketReconnectAttempts = ref(new Map()) // 存储每个小车的重连尝试次数
const maxReconnectAttempts = 5 // 最大重连尝试次数
const reconnectDelay = 3000 // 重连延迟（毫秒）

// 数字状态到字符串状态的映射
const numberToStatusMap = {
  0: 'pending',    // 待处理/普通任务初始
  1: 'scheduled',  // 已定时（等待时间到达）
  2: 'running',    // 执行中
  3: 'completed',  // 已完成
  4: 'failed',     // 失败
  5: 'cancelled',  // 已取消
  6: 'paused'      // 暂停中
}

// 状态标签映射
const statusLabels = {
  all: '所有任务',
  running: '执行中',
  pending: '待处理',
  scheduled: '已定时',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
  paused: '暂停中',
  unknown: '待处理'  // 将未知状态显示为待处理
}

// 状态样式映射
const statusStyles = {
  running: 'bg-green-100 text-green-700',
  pending: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
  failed: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-orange-100 text-orange-700',
  paused: 'bg-yellow-100 text-yellow-700',
  unknown: 'bg-gray-100 text-gray-700'
}

// 筛选任务 - 根据状态筛选
const filteredTasks = computed(() => {
  // 如果不是显示全部，根据状态筛选
  if (currentFilter.value !== 'all') {
    return tasks.value.filter(task => {
      // 处理数字状态和字符串状态
      const taskStatus = typeof task.status === 'number' ? numberToStatusMap[task.status] || 'unknown' : task.status
      return taskStatus === currentFilter.value
    })
  }
  
  return tasks.value
})

// 切换筛选条件
const changeFilter = (filter) => {
  currentFilter.value = filter
}

// 切换下拉筛选
const changeSelectFilter = (event) => {
  currentFilter.value = event.target.value
}

// WebSocket连接函数
const connectWebSocket = (carId) => {
  // 如果已经有该小车的连接，不再重复创建
  if (websockets.value.has(carId)) {
    return;
  }
  
  try {
    const wsUrl = getWebSocketUrl(carId)
    const websocket = new WebSocket(wsUrl)
    
    // 连接成功
    websocket.onopen = () => {
      isWebSocketConnected.value = true
      // 重置重连尝试次数
      websocketReconnectAttempts.value.set(carId, 0)
    }
    
    // 接收消息
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // 获取小车ID，使用与App.vue一致的方式解析
        const messageCarId = data.car_id || data.carId || carId
        
        // 更新小车状态信息（使用与App.vue统一的逻辑）
        if (data.battery !== undefined || data.speed !== undefined || data.temperature !== undefined || data.signal !== undefined || data.longitude !== undefined || data.latitude !== undefined) {
          // 获取当前已存在的状态
          const currentStatus = props.carsStatus.get(messageCarId) || {
            battery: NaN,
            speed: NaN,
            temperature: NaN,
            signal: NaN,
            status: 'idle',
            longitude: null,
            latitude: null,
            angle: 0
          }
          
          // 使用与App.vue相同的逻辑构建状态对象
          const updatedStatus = {
            battery: data.battery !== undefined ? data.battery : (currentStatus.battery ?? NaN),
            speed: data.speed !== undefined ? data.speed : (currentStatus.speed ?? NaN),
            temperature: data.temperature !== undefined ? data.temperature : (currentStatus.temperature ?? NaN),
            signal: data.signal !== undefined ? data.signal : (currentStatus.signal ?? NaN),
            status: data.status ?? data.car_status ?? currentStatus.status ?? 'idle',
            longitude: data.longitude !== undefined ? data.longitude : currentStatus.longitude,
            latitude: data.latitude !== undefined ? data.latitude : currentStatus.latitude,
            angle: data.angle !== undefined ? data.angle : currentStatus.angle
          }
          
          // 只存储单一键类型，与App.vue保持一致
          props.carsStatus.set(messageCarId, updatedStatus)
        }
        
        // 处理路径更新消息
        if (data.type === 'path_update') {
          updateTaskPath(data.task_id, data.path)
        }
        
        // 更新小车位置（无论消息类型是什么，只要包含坐标信息）
        if (data.longitude && data.latitude) {
          // 找到对应的小车
          const targetCar = props.cars.find(car => car.id === messageCarId)
          const carName = targetCar ? targetCar.name : `小车${messageCarId}`
          
          // 对于SLAM地图，我们直接使用小车的坐标作为地图坐标
          const carPosition = {
            x: data.longitude,
            y: data.latitude,
            angle: data.angle || 0 // 如果消息中包含方向信息，使用它，否则默认为0
          }
          
          // 更新SLAM地图查看器上的小车位置
          if (mapIframe.value && mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
            mapIframe.value.contentWindow.SlamMapViewer.setCarPosition(carPosition)
          }
          
          // 对于Leaflet地图，保持原有逻辑
          if (viewer) {
            // 假设data.longitude和data.latitude是SLAM地图的坐标
            const carPoint = [data.latitude, data.longitude] // Leaflet使用[纬度, 经度]格式，但这里我们使用SLAM坐标
            
            // 获取小车颜色
            const carColor = carColors[messageCarId] || { bg: '#FFC107', border: '#FF9800' } // 默认黄色
            
            // 如果小车标记不存在，则创建新标记
            if (!carMarkers[messageCarId]) {
              // 创建小车标记
              const carIcon = window.L.divIcon({
                className: 'car-marker',
                html: `<div style="
                  width: 24px;
                  height: 24px;
                  background-color: ${carColor.bg};
                  border-radius: 50%;
                  border: 3px solid ${carColor.border};
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
              
              carMarkers[messageCarId] = window.L.marker(carPoint, { icon: carIcon }).addTo(viewer)
              carMarkers[messageCarId].bindPopup(`${carName} (实时位置)<br>坐标: ${data.latitude != null ? data.latitude.toFixed(2) : '0.00'}, ${data.longitude != null ? data.longitude.toFixed(2) : '0.00'}`)
              // 将小车图标置于顶层
              try {
                if (carMarkers[messageCarId] && typeof carMarkers[messageCarId].bringToFront === 'function') {
                  carMarkers[messageCarId].bringToFront()
                }
              } catch (error) {
                // 静默处理错误
              }
              // 再次将小车图标置于顶层，确保优先级最高
              setTimeout(() => {
                try {
                  if (carMarkers[messageCarId] && typeof carMarkers[messageCarId] === 'object' && typeof carMarkers[messageCarId].bringToFront === 'function') {
                    carMarkers[messageCarId].bringToFront()
                  }
                } catch (error) {
                  // 静默处理错误
                }
              }, 100)
            } else {
              // 如果标记已存在，更新位置
              try {
                if (carMarkers[messageCarId] && typeof carMarkers[messageCarId].setLatLng === 'function') {
                  carMarkers[messageCarId].setLatLng(carPoint)
                  // 将小车图标置于顶层
                  if (typeof carMarkers[messageCarId].bringToFront === 'function') {
                    carMarkers[messageCarId].bringToFront()
                  }
                }
              } catch (error) {
                // 静默处理错误
              }
              // 再次将小车图标置于顶层，确保优先级最高
              setTimeout(() => {
                try {
                  if (carMarkers[messageCarId] && typeof carMarkers[messageCarId] === 'object' && typeof carMarkers[messageCarId].bringToFront === 'function') {
                    carMarkers[messageCarId].bringToFront()
                  }
                } catch (error) {
                  // 静默处理错误
                }
              }, 100)
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      }
    }
    
    // 连接关闭
    websocket.onclose = () => {
      // 移除该小车的连接
      websockets.value.delete(carId)
      // 如果没有任何连接了，设置连接状态为false
      if (websockets.value.size === 0) {
        isWebSocketConnected.value = false
      }
      
      // 尝试重连
      reconnectWebSocket(carId)
    }
    
    // 连接错误
    websocket.onerror = (error) => {
      // 静默处理错误
    }
    
    // 存储WebSocket连接
    websockets.value.set(carId, websocket)
    
  } catch (error) {
    // 静默处理错误
    // 尝试重连
    reconnectWebSocket(carId)
  }
}

// WebSocket重连函数
const reconnectWebSocket = (carId) => {
  const currentAttempts = websocketReconnectAttempts.value.get(carId) || 0
  
  if (currentAttempts < maxReconnectAttempts) {
    const nextAttempts = currentAttempts + 1
    websocketReconnectAttempts.value.set(carId, nextAttempts)
    
    // 延迟重连
    setTimeout(() => {
      connectWebSocket(carId)
    }, reconnectDelay)
  } else {
    // 重置重连尝试次数，以便后续可以重新尝试
    setTimeout(() => {
      websocketReconnectAttempts.value.set(carId, 0)
    }, 30000) // 30秒后重置
  }
}

// 断开WebSocket连接
const disconnectWebSocket = (carId = null) => {
  if (carId) {
    // 断开指定小车的连接
    if (websockets.value.has(carId)) {
      const websocket = websockets.value.get(carId)
      websocket.close()
      websockets.value.delete(carId)
    }
  } else {
    // 断开所有连接
    websockets.value.forEach((websocket) => {
      websocket.close()
    })
    websockets.value.clear()
  }
  
  // 如果没有任何连接了，设置连接状态为false
  if (websockets.value.size === 0) {
    isWebSocketConnected.value = false
  }
}

// 为所有小车创建WebSocket连接
const connectAllRunningCars = () => {
  // 收集所有小车ID
  const allCarIds = new Set();
  
  // 从props.cars中获取所有小车ID
  props.cars.forEach(car => {
    if (car.id) {
      allCarIds.add(car.id);
    }
  });
  
  // 从任务中获取小车ID（确保不遗漏）
  tasks.value.forEach(task => {
    if (task.carId) {
      allCarIds.add(task.carId);
    }
  });
  
  // 为每个小车创建WebSocket连接
  allCarIds.forEach(carId => {
    connectWebSocket(carId);
  });
}

// 更新任务路径
const updateTaskPath = (taskId, path) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.path = path
    // 如果是当前选中的任务，刷新地图显示
    if (taskId === selectedTaskId.value) {
      showTaskMap(task)
    }
  }
}

// 选中任务
const selectTask = (taskId) => {
  selectedTaskId.value = taskId
  const selectedTask = tasks.value.find(task => task.id === taskId)
  if (selectedTask && viewer) {
    showTaskMap(selectedTask)
  }
}

// 定位小车
const locateTrolley = () => {
  if (!viewer) return
  
  // 将地图视图定位到国科大杭州高等研究院
  // 用户提供的坐标：东经120°4'27.980"，北纬30°8'4.049" 转换为十进制
  const lng = 120 + 4/60 + 27.980/3600 // 120.07447°
  const lat = 30 + 8/60 + 4.049/3600 // 30.13442°
  
  // Leaflet使用[纬度, 经度]格式，设置缩放级别为18
  viewer.setView([lat, lng], 18)
}

// 查看任务地图
const viewTaskMap = async (task) => {
  try {
    // 先获取完整的任务详情，确保包含路径点信息
    const response = await taskApi.getById(task.id)
    let fullTask = response.data
    
    // 应用convertBackendTaskToFrontend函数进行转换
    fullTask = convertBackendTaskToFrontend(fullTask)
    
    // 保存到viewedTask
    viewedTask.value = fullTask
    
    // 先显示模态框
    showTaskMapModal.value = true
    
    // 使用nextTick确保DOM更新完成后再初始化地图
    await nextTick()
    
    // 检查地图容器是否存在且可见
    const mapContainer = document.getElementById('task-map-view-container')
    if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
      initTaskMapForView()
    } else {
      // 如果容器不可见，再等待一段时间后重试
      setTimeout(() => {
        initTaskMapForView()
      }, 200)
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    
    // 至少显示基本信息
    viewedTask.value = task
    showTaskMapModal.value = true
    
    // 使用nextTick确保DOM更新完成后再初始化地图
    await nextTick()
    
    // 检查地图容器是否存在且可见
    const mapContainer = document.getElementById('task-map-view-container')
    if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
      initTaskMapForView()
    } else {
      // 如果容器不可见，再等待一段时间后重试
      setTimeout(() => {
        initTaskMapForView()
      }, 200)
    }
  }
}

// 初始化任务地图（用于查看）
const initTaskMapForView = () => {
  if (!viewedTask.value) return
  
  const mapContainer = document.getElementById('task-map-view-container')
  if (!mapContainer) {
    console.error('任务地图容器未找到')
    return
  }
  
  // 强制清理地图容器内容，确保没有残留的地图实例
  mapContainer.innerHTML = ''
  
  // 如果已经有地图实例，先销毁
  if (taskMapViewer.value) {
    try {
      taskMapViewer.value.remove() // 使用remove代替destroy，更彻底地清理地图
      taskMapViewer.value = null
    } catch (error) {
      console.error('销毁查看任务地图实例失败:', error)
      // 即使销毁失败，也要将taskMapViewer设置为null
      taskMapViewer.value = null
    }
  }
  
  // 使用预加载的Leaflet地图库初始化地图
  if (typeof window.L === 'undefined') {
    console.error('Leaflet地图库未加载')
    mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">地图库加载失败，请刷新页面重试</div>'
    return
  }
  
  try {
    let lng, lat
    
    // 获取任务的路径点
    let path = viewedTask.value.path || []
    
    // 打印路径点数据，便于调试
    // console.log('任务路径点数据:', path)
    
    if (path.length > 0) {
      // 使用第一个路径点作为地图中心
      const firstPoint = path[0]
      lat = firstPoint.lat
      lng = firstPoint.lng || firstPoint.lon
    } else {
      // 使用默认坐标（国科大杭州高等研究院）
      lng = 120.07447
      lat = 30.13442
    }
    
    // 创建地图实例
    const map = window.L.map(mapContainer, {
      center: [lat, lng],
      zoom: 18,
      zoomControl: true,
      attributionControl: true
    })
    
    // 添加高德地图瓦片图层
    window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      maxZoom: 20
    }).addTo(map)
    
    // 存储地图实例
    taskMapViewer.value = map
    
    // 绘制路径点
    if (path.length > 0) {
      // console.log('绘制路径点:', path)
      
      path.forEach((point, index) => {
        // 确保路径点格式正确，同时支持lng/lat和lon/lat格式
        const longitude = point.lng || point.lon
        const latitude = point.lat
        
        if (longitude && latitude) {
          let markerIcon;
          
          // 为起点和终点使用不同的图标
          if (index === 0) {
            // 起点 - 使用绿色标记
            markerIcon = window.L.divIcon({
              className: 'waypoint-marker',
              html: `<div style="
                width: 16px;
                height: 16px;
                background-color: #4CAF50;
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">起</div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              popupAnchor: [0, -10]
            })
          } else if (index === path.length - 1) {
            // 终点 - 使用红色标记
            markerIcon = window.L.divIcon({
              className: 'waypoint-marker',
              html: `<div style="
                width: 16px;
                height: 16px;
                background-color: #F44336;
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">终</div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              popupAnchor: [0, -10]
            })
          } else {
            // 中间点 - 使用蓝色标记
            markerIcon = window.L.divIcon({
              className: 'waypoint-marker',
              html: `<div style="
                width: 12px;
                height: 12px;
                background-color: #2196F3;
                border: 2px solid white;
                border-radius: 50%;
              "></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
              popupAnchor: [0, -8]
            })
          }
          
          // 创建标记并添加到地图
          const marker = window.L.marker([latitude, longitude], { icon: markerIcon }).addTo(map)
          
          // 为标记添加点击事件，显示坐标信息
          marker.bindPopup(`<b>路径点 ${index + 1}</b><br>经度: ${longitude}<br>纬度: ${latitude}`)
        }
      })
      
      // 绘制路径
      const latLngs = path.map(point => {
        return [point.lat, point.lng || point.lon]
      })
      
      if (latLngs.length > 1) {
        window.L.polyline(latLngs, {
          color: 'blue',
          weight: 4,
          opacity: 0.7
        }).addTo(map)
        
        // 调整地图视图以显示整个路径
        map.fitBounds(window.L.latLngBounds(latLngs), { padding: [50, 50] })
      }
    }
    
    // 如果有小车实时位置数据，添加小车标记
    if (carStatus.value.longitude && carStatus.value.latitude) {
      const carPoint = [carStatus.value.latitude, carStatus.value.longitude] // Leaflet使用[纬度, 经度]格式
      viewCarMarker = window.L.marker(carPoint, { icon: createCarIcon() }).addTo(map)
    }
    
  } catch (error) {
    console.error('创建地图失败:', error)
    mapContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">地图加载失败: ${error.message}</div>`
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

// 开始任务
const startTask = async (task) => {
  try {
    if (task.status === '进行中') {
      alert('任务已经在进行中')
      return
    }
    
    if (task.status === '已完成') {
      alert('已完成的任务无法开始')
      return
    }
    
    if (task.status === '已取消') {
      alert('已取消的任务无法开始')
      return
    }
    
    // 调用API开始任务
    await taskApi.start(task.id)
    
    // 更新本地任务状态
    task.status = '进行中'
    alert('任务已开始')
    
    // 重新获取任务列表，确保数据同步
    fetchTasks()
  } catch (error) {
    console.error('开始任务失败:', error)
    alert('开始任务失败，请重试')
  }
}

// 一键召回小车
const recallCar = async (task) => {
  try {
    // console.log('召回小车:', task)
    
    // 尝试通过API获取任务详情，包括绑定的小车信息
    const taskDetailResponse = await fetch(`/api/tasks/${task.id}`)
    if (!taskDetailResponse.ok) {
      throw new Error('获取任务详情失败')
    }
    
    const taskDetail = await taskDetailResponse.json()
    // console.log('任务详情:', taskDetail)
    
    // 从任务详情中获取小车ID（检查所有可能的字段）
    let carId = taskDetail.carId || taskDetail.deviceId || taskDetail.car_id || taskDetail.device_id
    
    // 检查executor字段
    if (!carId && taskDetail.executor) {
      carId = taskDetail.executor.id || taskDetail.executor.carId || taskDetail.executor.deviceId
    }
    
    // 检查car字段
    if (!carId && taskDetail.car) {
      carId = taskDetail.car.id
    }
    
    // console.log('获取到的小车ID:', carId)
    
    if (!carId) {
      throw new Error('任务未绑定小车')
    }
    
    // 发送返回基站指令
    const response = await fetch('/api/commands/return_base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ car_id: parseInt(carId) })
    })
    
    if (!response.ok) {
      throw new Error('返回基站指令发送失败')
    }
    
    // 连接WebSocket实时监控小车位置
    connectWebSocket(parseInt(carId))
    
    // 显示成功提示
    alert('召回指令发送成功，小车正在返回基站')
    
    // console.log('召回指令发送成功')
  } catch (error) {
    console.error('召回小车失败:', error)
    alert('召回小车失败: ' + (error.message || '未知错误'))
  }
}

// 暂停任务
// 暂停任务
const pauseTask = async (task) => {
  try {
    // console.log('暂停任务:', task);
    
    // 调用API暂停任务
    await taskApi.pause(task.id)
    
    // 更新本地任务状态（与TaskPlanning.vue保持一致）
    task.status = '暂停中'
    alert('任务已暂停')
    
    // 重新获取任务列表，确保数据同步
    fetchTasks()
  } catch (error) {
    console.error('暂停任务失败:', error)
    alert('暂停任务失败，请重试')
  }
}

// 继续任务
const resumeTask = async (task) => {
  try {
    // console.log('继续任务:', task);
    
    // 调用API继续任务（与TaskPlanning.vue保持一致，使用start方法）
    await taskApi.start(task.id)
    
    // 更新本地任务状态（与TaskPlanning.vue保持一致）
    task.status = '执行中'
    alert('任务已继续')
    
    // 重新获取任务列表，确保数据同步
    fetchTasks()
  } catch (error) {
    console.error('继续任务失败:', error)
    alert('继续任务失败，请重试')
  }
}

// 切换暂停/继续任务
const togglePauseResume = async (task) => {
  // 打印任务详细信息，以便排查问题
  // console.log('任务详情:', task);
  // console.log('任务状态:', task.status);
  // console.log('任务状态类型:', typeof task.status);
  
  // 标准化任务状态
  let normalizedStatus = task.status;
  
  // 如果状态是数字，转换为对应的字符串状态
  if (typeof task.status === 'number') {
    const statusMap = {
      0: '待处理',
      1: '已定时',
      2: '执行中',
      3: '已完成',
      4: '失败',
      5: '已取消',
      6: '暂停中'
    };
    normalizedStatus = statusMap[task.status] || task.status;
    // console.log('数字状态转换为:', normalizedStatus);
  }
  
  // 检查标准化后的状态
  if (normalizedStatus === '执行中' || normalizedStatus === '进行中' || normalizedStatus === 'running') {
    // console.log('执行暂停操作');
    await pauseTask({ ...task, status: '执行中' });
  } else if (['待处理', '已定时', '暂停中', '待执行', 'paused', 'scheduled', 'pending'].includes(normalizedStatus)) {
    // console.log('执行继续操作');
    await resumeTask({ ...task, status: normalizedStatus });
  } else {
    // 打印不支持的状态值，以便排查问题
    // console.log('不支持的任务状态:', task.status);
    // console.log('标准化后的状态:', normalizedStatus);
    alert('该任务状态不支持此操作')
  }
}

// 加载所有任务路径
// 地图加载重试计数器
const mapLoadRetryCount = ref(0);
const maxMapLoadRetries = 10;

const loadAllTaskPaths = async () => {
  // 等待地图初始化完成
  if (!mapIframe.value || !mapIframe.value.contentWindow || !mapIframe.value.contentWindow.SlamMapViewer) {
    if (mapLoadRetryCount.value < maxMapLoadRetries) {
      mapLoadRetryCount.value++;
      setTimeout(loadAllTaskPaths, 500);
    }
    return;
  }
  // 重置重试计数器
  mapLoadRetryCount.value = 0;
  
  try {
    // 先清除现有的路径和标记
    clearAllTaskPaths();
    
    // 定义未完成任务的状态值
    const incompleteStatuses = [0, 1, 2, 4, 6]; // PENDING, SCHEDULED, RUNNING, FAILED, PAUSED
    const incompleteStatusStrings = ['pending', 'scheduled', 'running', 'failed', 'paused', '待处理', '已定时', '执行中', '失败', '暂停中'];
    
    // 获取所有未完成任务
    const incompleteTasks = tasks.value.filter(task => {
      // 检查任务状态是否为未完成
      const isIncomplete = typeof task.status === 'number' 
        ? incompleteStatuses.includes(task.status)
        : incompleteStatusStrings.includes(task.status);
      return isIncomplete;
    });
    
    // 限制并发处理任务数量
    const concurrencyLimit = 3;
    const processTask = async (task, index) => {
      try {
        let pathData = null;
        
        // 1. 首先尝试使用任务中的path数据
        if (task.path && task.path.length >= 2) {
          pathData = task.path;
        } 
        // 2. 如果没有path数据，尝试通过API获取
        else {
          // 尝试获取path_id
          let pathId = task.path_id;
          
          // 如果没有path_id，尝试从path_info中获取
          if (!pathId && task.path_info) {
            pathId = task.path_info.id;
          }
          
          // 如果没有path_id，尝试从任务详情中获取
          if (!pathId) {
            try {
              const taskResponse = await axios.get(`/api/tasks/${task.id}`);
              const fullTask = taskResponse.data;
              pathId = fullTask.path_id || fullTask.path_info?.id;
            } catch (error) {
              return;
            }
          }
          
          if (pathId) {
            try {
              // 直接使用axios获取路径数据
              const pathResponse = await axios.get(`/api/paths/${pathId}`);
              const pathInfo = pathResponse.data;
              
              if (pathInfo && Array.isArray(pathInfo.waypoints)) {
                // 转换坐标格式
                pathData = pathInfo.waypoints.map(point => {
                  if (point.x !== undefined && point.y !== undefined) {
                    return { lat: point.y, lon: point.x };
                  }
                  return { lat: point.lat, lon: point.lon || point.lng };
                });
                
                // 更新任务数据，添加path字段
                const taskIndex = tasks.value.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                  tasks.value[taskIndex] = {
                    ...tasks.value[taskIndex],
                    path: pathData
                  };
                }
              } else {
                return;
              }
            } catch (error) {
              return;
            }
          } else {
            return;
          }
        }
        
        if (!pathData || pathData.length < 2) {
          return;
        }
        
        // 为每个任务分配不同的颜色
        const colorIndex = index % pathColors.length;
        const color = pathColors[colorIndex];
        
        // 创建路径坐标
        const pathCoords = pathData.map(point => [point.lat, point.lon || point.lng]);
        
        // 创建路径图层
        const polyline = window.L.polyline(pathCoords, {
          color: color,
          weight: 4,
          opacity: 0.8
        }).addTo(viewer);
        
        // 存储路径图层，以便后续可以清除
        pathLayers.value.set(task.id, polyline);
        
        // 存储路径点标记
        const markers = [];
        
        // 添加路径点标记
        pathData.forEach((point, pointIndex) => {
          let waypointIcon;
          
          // 检查是起点、终点还是中间点
          if (pointIndex === 0) {
            // 起点 - 绿色背景，显示"S"
            waypointIcon = window.L.divIcon({
              className: 'waypoint-marker start-marker',
              html: `<div style="
                width: 14px;
                height: 14px;
                background-color: #28a745;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 6px;
                font-weight: bold;
              ">S</div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
              popupAnchor: [0, -12]
            });
          } else if (pointIndex === pathData.length - 1) {
            // 终点 - 蓝色背景，显示"E"
            waypointIcon = window.L.divIcon({
              className: 'waypoint-marker end-marker',
              html: `<div style="
                width: 14px;
                height: 14px;
                background-color: #007bff;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 6px;
                font-weight: bold;
              ">E</div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
              popupAnchor: [0, -12]
            });
          } else {
            // 中间点 - 橙色背景，显示序号
            waypointIcon = window.L.divIcon({
              className: 'waypoint-marker',
              html: `<div style="
                width: 20px;
                height: 20px;
                background-color: #ffc107;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">${pointIndex}</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -15]
            });
          }
          
          // 创建标记并添加到地图
          const marker = window.L.marker([point.lat, point.lon || point.lng], {
            icon: waypointIcon
          }).addTo(viewer);
          
          // 添加点击事件，显示坐标信息
          marker.bindPopup(`<b>路径点 ${pointIndex + 1}</b><br>经度: ${point.lon || point.lng}<br>纬度: ${point.lat}`);
          
          // 存储标记
          markers.push(marker);
        });
        
        // 存储路径点标记，以便后续可以清除
        pathMarkers.value.set(task.id, markers);
        
      } catch (error) {
        return;
      }
    };
    
    // 分批处理任务，控制并发数
    for (let i = 0; i < incompleteTasks.length; i += concurrencyLimit) {
      const batch = incompleteTasks.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map((task, index) => processTask(task, i + index)));
    }
    
    // 将小车图标置于顶层
    try {
      Object.values(carMarkers).forEach(marker => {
        // 确保marker是有效的Leaflet marker对象
        if (marker && typeof marker === 'object' && typeof marker.bringToFront === 'function') {
          marker.bringToFront();
        }
      });
    } catch (error) {
      // 静默处理错误
    }
    
    // 再次尝试将小车图标置于顶层，确保优先级最高
    setTimeout(() => {
      try {
        Object.values(carMarkers).forEach(marker => {
          // 确保marker是有效的Leaflet marker对象
          if (marker && typeof marker === 'object' && typeof marker.bringToFront === 'function') {
            marker.bringToFront();
          }
        });
      } catch (error) {
        // 静默处理错误
      }
    }, 500);
    
  } catch (error) {
    // 静默处理错误
  }
}

// 清除指定任务的路径
const clearTaskPath = (taskId) => {
  try {
    // 清除SLAM地图查看器上的路径
    if (mapIframe.value && mapIframe.value.contentWindow && mapIframe.value.contentWindow.SlamMapViewer) {
      mapIframe.value.contentWindow.SlamMapViewer.clearPath()
      // console.log('已清除SLAM地图查看器上的路径')
    }
    
    // 清除Leaflet地图上的路径
    if (viewer) {
      // 检查是否存在该任务的路径图层
      if (pathLayers.value.has(taskId)) {
        const polyline = pathLayers.value.get(taskId)
        viewer.removeLayer(polyline)
        pathLayers.value.delete(taskId)
        // console.log(`已清除任务 ${taskId} 的路径线`)
      }
    }
    
    // 检查是否存在该任务的路径点标记
    if (pathMarkers.value.has(taskId)) {
      const markers = pathMarkers.value.get(taskId)
      markers.forEach(marker => {
        viewer.removeLayer(marker)
      })
      pathMarkers.value.delete(taskId)
      // console.log(`已清除任务 ${taskId} 的路径点标记`)
    }
  } catch (error) {
    console.error('清除任务路径失败:', error)
  }
}

// 清除所有任务路径
const clearAllTaskPaths = () => {
  if (!viewer) return
  
  try {
    // 遍历所有路径图层并移除
    pathLayers.value.forEach((polyline, taskId) => {
      viewer.removeLayer(polyline)
    })
    
    // 遍历所有路径点标记并移除
    pathMarkers.value.forEach((markers, taskId) => {
      markers.forEach(marker => {
        viewer.removeLayer(marker)
      })
    })
    
    // 清空路径图层和标记映射
    pathLayers.value.clear()
    pathMarkers.value.clear()
    // console.log('已清除所有任务路径和标记')
  } catch (error) {
    console.error('清除所有任务路径失败:', error)
  }
}

// 刷新地图并恢复初始大小
const refreshMap = async () => {
  if (!viewer) return
  
  // 重新获取任务列表
  await fetchTasks()
  
  // 如果有选中任务，刷新到任务地图中心；否则使用默认
  if (selectedTaskId.value) {
    const selectedTask = tasks.value.find(task => task.id === selectedTaskId.value)
    if (selectedTask) {
      showTaskMap(selectedTask)
      return
    }
  }
  
  // 加载所有任务路径
  loadAllTaskPaths()
  
  // 默认视图 - 恢复到学校中心
  // 坐标：东经120°4'27.980"，北纬30°8'4.049" 转换为十进制
  const lng = 120 + 4/60 + 27.980/3600 // 120.07447°
  const lat = 30 + 8/60 + 4.049/3600 // 30.13442°
  
  // Leaflet使用[纬度, 经度]格式，设置缩放级别为18
  viewer.setView([lat, lng], 18)
}

// 暴露方法和状态给父组件
defineExpose({
  locateTrolley,
  refreshMap,
  loadAllTaskPaths,
  clearAllTaskPaths,
  fetchTasks
})
</script>

<style scoped>
#map-page {
  height: 100%;
  width: 100%;
  position: relative;
  min-height: 600px;
  background-color: #e6e6e6;
}

#amapContainer {
  width: 100%;
  height: 100%;
  min-height: 800px;
  background-color: #f0f0f0;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* 侧边栏过渡动画 */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: all 0.3s ease;
}

.slide-sidebar-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
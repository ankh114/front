<template>
  <div class="page-content" id="car-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">小车管理</h2>
        <div class="flex flex-wrap gap-3">
          <div class="relative">
            <input type="text" placeholder="搜索小车..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="searchQuery" @input="currentPage = 1">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <div class="relative">
            <select class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="filterStatus" @change="currentPage = 1">
              <option value="">全部状态</option>
              <option value="待机">待机</option>
              <option value="充电执行中">充电执行中</option>
              <option value="任务执行中">任务执行中</option>
              <option value="任务完成返回中">任务完成返回中</option>
              <option value="异常状态">异常状态</option>
            </select>
            <i class="fa fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <button class="btn-secondary" @click="refreshCars" :disabled="isRefreshing">
            <i v-if="isRefreshing" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-refresh"></i>
            刷新
          </button>
          <button class="btn-primary" @click="openAddModal">
            <i class="fa fa-plus mr-1"></i> 添加小车
          </button>
        </div>
      </div>
      
      <!-- 小车列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- 添加横向滚动容器以避免表格在移动端溢出 -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小车ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小车名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已绑定设备数</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="filteredCars.length > 0">
                <tr v-for="car in paginatedCars" :key="car.id" :class="{ 'bg-blue-50': selectedCar?.id === car.id }" class="cursor-pointer hover:bg-gray-50 transition-colors" @click="viewCar(car)">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ car.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ car.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(car.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ car.status === 0 ? '待机' : car.status === 1 ? '充电执行中' : car.status === 2 ? '任务执行中' : car.status === 3 ? '任务完成返回中' : car.status === 4 ? '异常状态' : '未知' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ car.created_at ? new Date(car.created_at).toLocaleString() : '未知' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ car.devices ? car.devices.length : 0 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary/80 mr-3" @click.stop="viewCar(car)">查看</button>
                    <button class="text-warning hover:text-warning/80 mr-3" @click.stop="openEditModal(car)">编辑</button>
                    <button class="text-danger hover:text-danger/80 mr-3" @click.stop="openDeleteModal(car.id)">删除</button>
                    <button class="text-info hover:text-info/80 mr-3" @click.stop="openBindModal(car)">绑定</button>
                    <button class="text-secondary hover:text-secondary/80" @click.stop="openUnbindModal(car)">解绑</button>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fa fa-car text-gray-400 text-4xl mb-3"></i>
                    <p class="text-gray-500">暂无小车数据</p>
                    <p class="text-gray-400 text-sm mt-1">点击"添加小车"按钮开始管理您的小车</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          </div>
          
          <!-- 分页控件 -->
          <div v-if="filteredCars.length > 0" class="px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <p class="text-sm text-gray-700 mr-4">
                共 <span class="font-medium">{{ filteredCars.length }}</span> 条记录
              </p>
              <div class="flex items-center">
                <span class="text-sm text-gray-700 mr-2">每页显示：</span>
                <select v-model="pageSize" class="border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                @click="currentPage = 1" 
                :disabled="currentPage === 1" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-angle-double-left"></i>
              </button>
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-angle-left"></i>
              </button>
              <span class="px-3 py-1 text-sm text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-angle-right"></i>
              </button>
              <button 
                @click="currentPage = totalPages" 
                :disabled="currentPage === totalPages" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 三栏布局：左边详情，中间已绑定设备，右边指令下发 -->
        <!-- 在移动端使用单列布局，确保内容不会溢出 -->
        <div class="mt-6 flex flex-col lg:flex-row gap-6">
          <!-- 左边和中间：详情和已绑定设备 -->
          <div class="flex-1">
            <!-- 详情和已绑定设备 -->
            <div v-if="selectedCar" class="flex flex-col md:flex-row gap-6">
              <!-- 左边：小车详情 -->
              <div class="flex-1">
                <div class="bg-white rounded-lg shadow-sm p-5">
                  <!-- 标题和关闭按钮 -->
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">{{ selectedCar?.id || '小车' }} 详情</h3>
                    <!-- 关闭按钮：在详情区域的右上角，字体是蓝色的 -->
                    <button class="text-blue-600 hover:text-blue-800 font-medium focus:outline-none" @click="closeCarDetail">
                      <i class="fa fa-times"></i>
                      <span class="ml-1">关闭</span>
                    </button>
                  </div>
                  <!-- 基本信息 -->
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">小车ID</span>
                      <span class="text-sm font-medium">{{ selectedCar?.id || '未知' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">小车名称</span>
                      <span class="text-sm font-medium">{{ selectedCar?.name || '未知' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">状态</span>
                      <span :class="getStatusClass(selectedCar?.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ selectedCar?.status === 0 ? '待机' : selectedCar?.status === 1 ? '充电执行中' : selectedCar?.status === 2 ? '任务执行中' : selectedCar?.status === 3 ? '任务完成返回中' : selectedCar?.status === 4 ? '异常状态' : '未知' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-600">创建时间</span>
                      <span class="text-sm">{{ selectedCar?.created_at ? new Date(selectedCar.created_at).toLocaleString() : '未知' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 中间：已绑定设备 -->
              <div class="flex-1">
                <div class="bg-white rounded-lg shadow-sm p-5">
                  <h3 class="text-lg font-medium mb-4">已绑定设备</h3>
                  <div v-if="selectedCar?.devices && selectedCar.devices.length > 0" class="space-y-2">
                    <div v-for="device in selectedCar.devices" :key="device.id" class="flex justify-between items-center p-2 rounded-md bg-gray-50">
                      <div>
                        <span class="text-sm font-medium">{{ device.name }}</span>
                        <span class="text-xs text-gray-500 ml-2">({{ device.id }})</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs">
                          {{ device.device_type || '未知类型' }}
                        </span>
                        <span :class="getStatusClass(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {{ device.status === 1 ? '正常' : '故障' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500 py-4">
                    暂无绑定设备
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右边：指令下发 -->
          <div class="w-full lg:w-1/3">
            <div class="bg-white rounded-lg shadow-sm p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 class="text-lg font-medium mb-4">指令下发</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">选择小车</label>
                  <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="selectedCommandCar">
                    <option v-for="car in cars" :key="car.id" :value="car.id">
                      {{ car.id }} - {{ car.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">预设指令</label>
                  <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="presetCommand">
                    <option>返回基站</option>
                  </select>
                </div>
                <div class="pt-2">
                  <button class="w-full btn-primary flex items-center justify-center gap-2" @click="sendCommand" :disabled="isSendingCommand">
                    <i v-if="isSendingCommand" class="fa fa-spinner fa-spin"></i>
                    <i v-else class="fa fa-paper-plane"></i>
                    {{ isSendingCommand ? '发送中...' : '发送指令' }}
                  </button>
                </div>
                <div class="pt-2 border-t">
                  <h4 class="text-sm font-medium text-gray-500 mb-2">指令历史</h4>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div v-for="(history, index) in commandHistory" :key="index" class="text-xs bg-gray-50 p-2 rounded">
                      <div class="font-medium">{{ history.command }}</div>
                      <div class="text-gray-500 mt-0.5">{{ history.timestamp }}</div>
                    </div>
                    <div v-if="commandHistory.length === 0" class="text-xs text-gray-500 text-center py-4">
                      暂无指令历史
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑小车模态框 -->
    <div v-if="showCarModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-5 flex justify-between items-center border-b">
          <h3 class="text-lg font-medium">{{ editingCar ? '编辑小车' : '添加小车' }}</h3>
          <button @click="closeCarModal" class="text-gray-400 hover:text-gray-500">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="p-5">
          <form @submit.prevent="saveCar">
            <div class="space-y-4">
              <div class="mb-4">
                <label for="carName" class="block text-sm font-medium text-gray-700 mb-1">小车名称</label>
                <input 
                  type="text" 
                  id="carName" 
                  v-model="carForm.name" 
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="请输入小车名称"
                  required
                >
              </div>
              <div class="mb-4">
                <label for="carIp" class="block text-sm font-medium text-gray-700 mb-1">IP地址</label>
                <input 
                  type="text" 
                  id="carIp" 
                  v-model="carForm.ip_address" 
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="请输入小车IP地址"
                  required
                >
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="closeCarModal" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-24">
                取消
              </button>
              <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2 w-24 justify-center" :disabled="isSaving">
                <i v-if="isSaving" class="fa fa-spinner fa-spin"></i>
                {{ editingCar ? '保存修改' : '添加小车' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 删除小车模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-5 flex justify-between items-center border-b">
          <h3 class="text-lg font-medium">删除小车</h3>
          <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-500">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="p-5">
          <p class="text-gray-700">确定要删除该小车吗？此操作不可恢复。</p>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeDeleteModal" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button type="button" @click="deleteCar" class="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 flex items-center gap-2" :disabled="isDeleting">
              <i v-if="isDeleting" class="fa fa-spinner fa-spin"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 绑定设备模态框 -->
    <div v-if="showBindModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-5 flex justify-between items-center border-b">
          <h3 class="text-lg font-medium">绑定设备</h3>
          <button @click="closeBindModal" class="text-gray-400 hover:text-gray-500">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="p-5">
          <p class="text-gray-700 mb-4">为小车 "{{ selectedCarForBind?.name }}" 绑定设备：</p>
          <div class="mb-4">
            <label for="deviceSelect" class="block text-sm font-medium text-gray-700 mb-1">选择设备</label>
            <select 
              id="deviceSelect" 
              v-model="selectedDeviceId" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">请选择设备</option>
              <option v-for="device in availableDevices" :key="device.id" :value="device.id">
                {{ device.name }} ({{ device.id }})
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeBindModal" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button type="button" @click="bindDevice" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2" :disabled="isBinding || !selectedDeviceId">
              <i v-if="isBinding" class="fa fa-spinner fa-spin"></i>
              绑定
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 解绑设备模态框 -->
    <div v-if="showUnbindModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-5 flex justify-between items-center border-b">
          <h3 class="text-lg font-medium">解绑设备</h3>
          <button @click="closeUnbindModal" class="text-gray-400 hover:text-gray-500">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="p-5">
          <p class="text-gray-700 mb-4">为小车 "{{ selectedCarForUnbind?.name }}" 解绑设备：</p>
          <div class="mb-4">
            <label for="unbindDeviceSelect" class="block text-sm font-medium text-gray-700 mb-1">选择要解绑的设备</label>
            <select 
              id="unbindDeviceSelect" 
              v-model="selectedDeviceIdForUnbind" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              :disabled="!(selectedCarForUnbind?.devices && selectedCarForUnbind.devices.length > 0)"
            >
              <option value="">请选择设备</option>
              <option v-for="device in selectedCarForUnbind?.devices" :key="device.id" :value="device.id">
                {{ device.name }} ({{ device.id }})
              </option>
            </select>
          </div>
          <div v-if="!(selectedCarForUnbind?.devices && selectedCarForUnbind.devices.length > 0)" class="mt-2 text-sm text-gray-500">
            该小车未绑定任何设备
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeUnbindModal" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button type="button" @click="unbindDevice" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2" :disabled="!selectedDeviceIdForUnbind">
              解绑
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { carApi, deviceApi } from '../utils/api'
import { getWebSocketUrl } from '../utils/config.js'

// 接收小车数据作为props
const props = defineProps({
  cars: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-cars'])

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showCarModal = ref(false)
const showDeleteModal = ref(false)
const showBindModal = ref(false)
const showUnbindModal = ref(false)
const editingCar = ref(false)
const carToDelete = ref(null)
const selectedCarForBind = ref(null)
const selectedCarForUnbind = ref(null)
const selectedDeviceIdForUnbind = ref('')

// 表单数据和验证
const carForm = ref({
  id: '',
  name: '',
  ip_address: '',
  status: 1, // 0-故障, 1-待机, 2-运行中
})

const errors = ref({})

// 加载状态
const isSaving = ref(false)
const isDeleting = ref(false)
const isRefreshing = ref(false)
const isBinding = ref(false)
const isSendingCommand = ref(false)

// 选中的小车
const selectedCar = ref(null)

// 指令下发相关变量
const selectedCommandCar = ref('')
const presetCommand = ref('返回基站')
const commandHistory = ref([])

// WebSocket相关变量
const websocket = ref(null)
const isWebSocketConnected = ref(false)
const carRealTimeData = ref({
  battery: NaN,
  speed: NaN,
  temperature: NaN,
  signal: NaN,
  longitude: NaN,
  latitude: NaN,
  car_status: 0
})

// 可用设备列表（用于绑定）
const availableDevices = ref([])
const selectedDeviceId = ref('')

// 筛选和分页
const filteredCars = computed(() => {
  let filtered = props.cars || []
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(car => 
      car.name.toLowerCase().includes(query) || 
      car.id.toString().toLowerCase().includes(query)
    )
  }
  
  // 状态筛选 - 确保与后端返回的状态值保持一致
  if (filterStatus.value) {
    // 后端返回的状态值：0-待机，1-充电执行中，2-任务执行中，3-任务完成返回中，4-异常状态
    const statusMap = {
      '待机': 0,
      '充电执行中': 1,
      '任务执行中': 2,
      '任务完成返回中': 3,
      '异常状态': 4
    }
    filtered = filtered.filter(car => car.status === statusMap[filterStatus.value])
  }
  
  return filtered
})

const paginatedCars = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCars.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCars.value.length / pageSize.value)
})

// 状态样式
const getStatusClass = (status) => {
  if (status === 0) return 'bg-green-100 text-green-800' // 待机
  if (status === 1) return 'bg-blue-100 text-blue-800' // 充电执行中
  if (status === 2) return 'bg-orange-100 text-orange-800' // 任务执行中
  if (status === 3) return 'bg-purple-100 text-purple-800' // 任务完成返回中
  if (status === 4) return 'bg-red-100 text-red-800' // 异常状态
  return 'bg-gray-100 text-gray-800' // 未知
}

// 表单验证
const validateForm = () => {
  errors.value = {}
  if (!carForm.value.name) {
    errors.value.name = '小车名称不能为空'
  }
  if (!carForm.value.ip_address) {
    errors.value.ip_address = 'IP地址不能为空'
  }
  return Object.keys(errors.value).length === 0
}

// 打开添加模态框
const openAddModal = () => {
  editingCar.value = false
  carForm.value = {
    id: '',
    name: '',
    ip_address: '',
    status: 0, // 0-待机, 1-充电执行中, 2-任务执行中, 3-任务完成返回中, 4-异常状态
  }
  errors.value = {}
  showCarModal.value = true
}

// 打开编辑模态框
const openEditModal = (car) => {
  editingCar.value = true
  carForm.value = {
    id: car.id,
    name: car.name,
    ip_address: car.ip_address || '',
    status: car.status
  }
  errors.value = {}
  showCarModal.value = true
}

// 关闭模态框
const closeCarModal = () => {
  showCarModal.value = false
}

// 保存小车
const saveCar = async () => {
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
      let response
      if (editingCar.value) {
        // 编辑现有小车
        response = await carApi.update(carForm.value.id, carForm.value)
      } else {
        // 添加新小车
        response = await carApi.post(carForm.value)
      }
      
      // 通知父组件更新小车列表
      loadCars()
      closeCarModal()
  } catch (error) {
    console.error('保存小车失败:', error)
    alert('保存小车失败：' + (error.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

// 打开删除模态框
const openDeleteModal = (carId) => {
  carToDelete.value = carId
  showDeleteModal.value = true
}

// 关闭删除模态框
const closeDeleteModal = () => {
  showDeleteModal.value = false
  carToDelete.value = null
}

// 删除小车
const deleteCar = async () => {
  if (!carToDelete.value) return
  
  isDeleting.value = true
  
  try {
      // 调用API删除小车
      await carApi.delete(carToDelete.value)
      
      // 通知父组件更新小车列表
      loadCars()
      closeDeleteModal()
  } catch (error) {
    console.error('删除小车失败:', error)
  } finally {
    isDeleting.value = false
  }
}

// 查看小车详情
    const viewCar = (car) => {
      selectedCar.value = car
    }
    
    // 关闭小车详情
    const closeCarDetail = () => {
      selectedCar.value = null
    }

// 打开绑定设备模态框
const openBindModal = (car) => {
  selectedCarForBind.value = car
  selectedDeviceId.value = ''
  loadAvailableDevices()
  showBindModal.value = true
}

// 关闭绑定设备模态框
const closeBindModal = () => {
  showBindModal.value = false
  selectedCarForBind.value = null
  selectedDeviceId.value = ''
}

// 加载可用设备
const loadAvailableDevices = async () => {
  try {
    // 获取所有设备
    const response = await deviceApi.get()
    const allDevices = response.data || []
    
    // 收集所有已经绑定到任何小车上的设备ID
    const allBoundDeviceIds = new Set()
    props.cars.forEach(car => {
      if (car.devices && car.devices.length > 0) {
        car.devices.forEach(device => {
          allBoundDeviceIds.add(device.id)
        })
      }
    })
    
    // 过滤掉已经绑定到任何小车上的设备
    availableDevices.value = allDevices.filter(device => !allBoundDeviceIds.has(device.id))
  } catch (error) {
    console.error('加载可用设备失败:', error)
  }
}

// 绑定设备
const bindDevice = async () => {
  if (!selectedCarForBind.value || !selectedDeviceId.value) return
  
  isBinding.value = true
  
  try {
      // 调用API绑定设备
      await carApi.bindDevice(selectedCarForBind.value.id, selectedDeviceId.value)
      
      // 通知父组件更新小车列表
      loadCars()
      closeBindModal()
      alert('设备绑定成功')
  } catch (error) {
    console.error('绑定设备失败:', error)
    alert('绑定设备失败：' + (error.message || '未知错误'))
  } finally {
    isBinding.value = false
  }
}

// 打开解绑设备弹窗
const openUnbindModal = (car) => {
  selectedCarForUnbind.value = car
  selectedDeviceIdForUnbind.value = ''
  showUnbindModal.value = true
}

// 关闭解绑设备弹窗
const closeUnbindModal = () => {
  showUnbindModal.value = false
  selectedCarForUnbind.value = null
  selectedDeviceIdForUnbind.value = ''
}

// 解绑设备
const unbindDevice = async () => {
  if (!selectedCarForUnbind.value || !selectedDeviceIdForUnbind.value) return
  
  try {
      // 调用API解绑设备
      await carApi.unbindDevice(selectedCarForUnbind.value.id, selectedDeviceIdForUnbind.value)
      
      // 通知父组件更新小车列表
      loadCars()
      closeUnbindModal()
      alert('设备解绑成功')
  } catch (error) {
    console.error('解绑设备失败:', error)
    alert('解绑设备失败：' + (error.message || '未知错误'))
  }
}

// 发送指令
const sendCommand = async () => {
  if (!selectedCommandCar.value) {
    alert('请先选择小车')
    return
  }
  
  isSendingCommand.value = true
  
  try {
    let response
    
    // 根据指令类型调用不同的API接口
    if (presetCommand.value === '返回基站') {
      // 调用返回基站接口
      response = await fetch('/api/commands/return_base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ car_id: parseInt(selectedCommandCar.value) })
      })
      
      if (!response.ok) {
        throw new Error('返回基站指令发送失败')
      }
      
      // 连接WebSocket实时监控小车位置
      connectWebSocket(parseInt(selectedCommandCar.value))
    } else if (presetCommand.value === '紧急停止') {
      // 这里可以添加紧急停止指令的API调用
      // 暂时使用模拟成功
      // console.log('发送紧急停止指令到小车:', selectedCommandCar.value)
    } else if (presetCommand.value === '重启设备') {
      // 这里可以添加重启设备指令的API调用
      // 暂时使用模拟成功
      // console.log('发送重启设备指令到小车:', selectedCommandCar.value)
    }
    
    // 添加到指令历史
    commandHistory.value.unshift({
      command: presetCommand.value,
      timestamp: new Date().toLocaleString(),
      carId: selectedCommandCar.value
    })
    
    // 限制历史记录数量
    if (commandHistory.value.length > 20) {
      commandHistory.value.pop()
    }
    
    isSendingCommand.value = false
    alert('指令发送成功')
  } catch (error) {
    console.error('发送指令失败:', error)
    alert('发送指令失败：' + (error.message || '未知错误'))
    isSendingCommand.value = false
  }
}

// 刷新小车列表
const refreshCars = async () => {
  isRefreshing.value = true
  try {
    await loadCars()
  } catch (error) {
    console.error('刷新小车列表失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 加载小车列表（通过父组件刷新）
const loadCars = () => {
  // 触发父组件更新小车列表
  emit('update-cars')
}

// 生命周期钩子
onMounted(() => {
  // 小车数据已通过props传入，无需从API获取
})

// 当props.cars变化时，更新选中的小车
watch(() => props.cars, (newCars) => {
  if (newCars.length > 0) {
    // 如果当前选中小车不存在于新的小车列表中，则设置为null
    if (selectedCar.value) {
      const currentSelectedCar = newCars.find(d => d.id === selectedCar.value.id)
      if (!currentSelectedCar) {
        selectedCar.value = null
      }
    }
    // 不默认选中任何小车，保持selectedCar为null
  } else {
    // 如果没有小车数据，设置为null
    selectedCar.value = null
  }
}, { immediate: true })

// 连接到WebSocket服务器
const connectWebSocket = (carId) => {
  // 如果已经有连接，先断开
  if (websocket.value) {
    disconnectWebSocket()
  }
  
  try {
    // 创建WebSocket连接 - 使用与后端一致的路径
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
        
        // 检查是否是小车实时数据
        if (data.battery !== undefined || (data.car_id && data.reported_at)) {
          // 直接更新小车实时数据
          carRealTimeData.value = {
            battery: data.battery !== undefined ? data.battery : NaN,
            speed: data.speed !== undefined ? data.speed : NaN,
            temperature: data.temperature !== undefined ? data.temperature : NaN,
            signal: data.signal !== undefined ? data.signal : NaN,
            longitude: data.longitude !== undefined ? data.longitude : NaN,
            latitude: data.latitude !== undefined ? data.latitude : NaN,
            car_status: data.car_status !== undefined ? data.car_status : 0
          }
        }
      } catch (error) {
        // 忽略WebSocket消息解析错误
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
    // 忽略WebSocket连接错误
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

// 生命周期钩子 - 组件销毁时断开WebSocket连接
onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<style scoped>
/* 可以根据需要添加自定义样式 */
</style>
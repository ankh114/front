<template>
  <div class="page-content" id="device-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">设备管理</h2>
        <div class="flex flex-wrap gap-3">
          <div class="relative">
            <input type="text" placeholder="搜索设备..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="searchQuery" @input="currentPage = 1">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <div class="relative">
            <select class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="filterStatus" @change="currentPage = 1">
              <option value="">全部状态</option>
              <option value="运行中">运行中</option>
              <option value="待机中">待机中</option>
              <option value="故障">故障</option>
            </select>
            <i class="fa fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <button class="btn-secondary" @click="refreshDevices" :disabled="isRefreshing">
            <i v-if="isRefreshing" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-refresh"></i>
            刷新
          </button>
          <button class="btn-primary" @click="openAddModal">
            <i class="fa fa-plus mr-1"></i> 添加设备
          </button>
        </div>
      </div>
      
      <!-- 设备列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- 添加横向滚动容器以避免表格在移动端溢出 -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备编号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后在线</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电池电量</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前任务</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="filteredDevices.length > 0">
                <tr v-for="device in paginatedDevices" :key="device.id" :class="{ 'bg-blue-50': selectedDevice.id === device.id }" class="cursor-pointer hover:bg-gray-50 transition-colors" @click="viewDevice(device)">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ device.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ device.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.lastOnline }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.battery }}%</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.currentTask || '无' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary/80 mr-3" @click.stop="viewDevice(device)">查看</button>
                    <button class="text-warning hover:text-warning/80 mr-3" @click.stop="openEditModal(device)">编辑</button>
                    <button class="text-danger hover:text-danger/80" @click.stop="openDeleteModal(device.id)">删除</button>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <i class="fa fa-box-open text-gray-400 text-4xl mb-3"></i>
                    <p class="text-gray-500">暂无设备数据</p>
                    <p class="text-gray-400 text-sm mt-1">点击"添加设备"按钮开始管理您的设备</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          </div>
          
          <!-- 分页控件 -->
          <div v-if="filteredDevices.length > 0" class="px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <p class="text-sm text-gray-700 mr-4">
                共 <span class="font-medium">{{ filteredDevices.length }}</span> 条记录
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
        
        <!-- 设备详情和指令下发 -->
        <!-- 在移动端使用单列布局，确保内容不会溢出 -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 在平板设备上使用两列布局，移动端单列 -->
          <div class="md:col-span-2 bg-white rounded-lg shadow-sm p-5">
            <h3 class="text-lg font-medium mb-4">{{ selectedDevice.id }} 详情</h3>
            <!-- 基本信息和传感器状态在小屏幕上堆叠显示 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">设备型号</span>
                    <span class="text-sm font-medium">{{ selectedDevice.model || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">安装位置</span>
                    <span class="text-sm font-medium">{{ selectedDevice.location || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">IP地址</span>
                    <span class="text-sm font-medium">{{ selectedDevice.ip || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">ROS版本</span>
                    <span class="text-sm font-medium">{{ selectedDevice.rosVersion || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">固件版本</span>
                    <span class="text-sm font-medium">{{ selectedDevice.firmwareVersion || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">安装日期</span>
                    <span class="text-sm font-medium">{{ selectedDevice.installationDate || 'N/A' }}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-3">传感器状态</h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">前视摄像头</span>
                    <span class="flex items-center text-success text-sm">
                      <i class="fa fa-check-circle mr-1"></i> 正常
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">后视摄像头</span>
                    <span class="flex items-center text-success text-sm">
                      <i class="fa fa-check-circle mr-1"></i> 正常
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">左视摄像头</span>
                    <span class="flex items-center text-warning text-sm">
                      <i class="fa fa-exclamation-circle mr-1"></i> 信号弱
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">右视摄像头</span>
                    <span class="flex items-center text-success text-sm">
                      <i class="fa fa-check-circle mr-1"></i> 正常
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">激光雷达</span>
                    <span class="flex items-center text-success text-sm">
                      <i class="fa fa-check-circle mr-1"></i> 正常
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-5">
            <h3 class="text-lg font-medium mb-4">指令下发</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">选择设备</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="selectedCommandDevice">
                  <option v-for="device in devices" :key="device.id" :value="device.id">
                    {{ device.id }} - {{ device.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">预设指令</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="presetCommand">
                  <option>返回基站</option>
                  <option>区域A巡检</option>
                  <option>区域B巡检</option>
                  <option>区域C巡检</option>
                  <option>暂停当前任务</option>
                  <option>继续当前任务</option>
                  <option>紧急停止</option>
                  <option>重启设备</option>
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

  <!-- 添加/编辑设备模态框 -->
  <div v-if="showDeviceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b">
        <h3 class="text-lg font-medium">{{ editingDevice ? '编辑设备' : '添加设备' }}</h3>
        <button @click="closeDeviceModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="p-6">
        <form @submit.prevent="saveDevice">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">设备编号</label>
              <input type="text" v-model="deviceForm.id" :disabled="editingDevice" @blur="validateField('id')" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" :class="errors.id ? 'border-red-300' : ''">
              <span v-if="errors.id" class="text-xs text-red-500 mt-1 block">{{ errors.id }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
              <input type="text" v-model="deviceForm.name" @blur="validateField('name')" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" :class="errors.name ? 'border-red-300' : ''">
              <span v-if="errors.name" class="text-xs text-red-500 mt-1 block">{{ errors.name }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">设备状态</label>
              <select v-model="deviceForm.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>运行中</option>
                <option>待机中</option>
                <option>故障</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">电池电量</label>
              <input type="number" v-model="deviceForm.battery" min="0" max="100" @blur="validateField('battery')" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" :class="errors.battery ? 'border-red-300' : ''">
              <span v-if="errors.battery" class="text-xs text-red-500 mt-1 block">{{ errors.battery }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">当前任务</label>
              <input type="text" v-model="deviceForm.currentTask" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" @click="closeDeviceModal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2" :disabled="isSaving">
              <i v-if="isSaving" class="fa fa-spinner fa-spin"></i>
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- 删除确认模态框 -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full">
      <div class="p-6 border-b">
        <h3 class="text-lg font-medium">确认删除</h3>
        <button @click="closeDeleteModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="p-6">
        <p class="text-gray-600">确定要删除该设备吗？此操作不可撤销。</p>
      </div>
      <div class="p-6 border-t flex justify-end gap-3">
        <button @click="closeDeleteModal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          取消
        </button>
        <button @click="deleteDevice" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2" :disabled="isDeleting">
          <i v-if="isDeleting" class="fa fa-spinner fa-spin"></i>
          {{ isDeleting ? '删除中...' : '删除' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  fetchDevices, 
  addDevice, 
  updateDevice, 
  deleteDevice as deleteDeviceApi, 
  refreshDevicesStatus, 
  sendCommandToDevice,
  validateDeviceForm,
  getStatusClass 
} from '../utils/device.js'

// 设备列表数据
const devices = ref([
  {
    id: 'ROBOT-001',
    name: '一号巡检小车',
    status: '运行中',
    lastOnline: '刚刚',
    battery: 78,
    currentTask: '区域A巡检',
    model: 'XJ-2023A',
    location: '厂房A区',
    ip: '192.168.1.101',
    rosVersion: 'Noetic',
    firmwareVersion: 'v2.3.1',
    installationDate: '2023-03-15'
  },
  {
    id: 'ROBOT-002',
    name: '二号巡检小车',
    status: '待机中',
    lastOnline: '5分钟前',
    battery: 92,
    currentTask: '',
    model: 'XJ-2023B',
    location: '厂房B区',
    ip: '192.168.1.102',
    rosVersion: 'Noetic',
    firmwareVersion: 'v2.3.1',
    installationDate: '2023-03-16'
  },
  {
    id: 'ROBOT-003',
    name: '三号巡检小车',
    status: '故障',
    lastOnline: '1小时前',
    battery: 45,
    currentTask: '区域C巡检',
    model: 'XJ-2023A',
    location: '厂房C区',
    ip: '192.168.1.103',
    rosVersion: 'Noetic',
    firmwareVersion: 'v2.3.0',
    installationDate: '2023-03-17'
  }
])

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 模态框状态
const showDeviceModal = ref(false)
const showDeleteModal = ref(false)
const editingDevice = ref(false)
const deviceToDelete = ref(null)

// 表单数据和验证
const deviceForm = ref({
  id: '',
  name: '',
  status: '运行中',
  battery: 100,
  currentTask: ''
})

const errors = ref({})

// 加载状态
const isSaving = ref(false)
const isDeleting = ref(false)
const isSendingCommand = ref(false)
const isRefreshing = ref(false)

// 选中的设备
const selectedDevice = ref(devices.value[0])

// 指令相关
const presetCommand = ref('返回基站')
const selectedCommandDevice = ref(devices.value[0]?.id || '')

// 指令历史
const commandHistory = ref([])

// 计算属性
const filteredDevices = computed(() => {
  return devices.value.filter(device => {
    const matchesSearch = device.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         device.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value ? device.status === filterStatus.value : true
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredDevices.value.length / pageSize.value)
})

const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDevices.value.slice(start, end)
})

// 方法

const validateForm = () => {
  const { errors: formErrors, isValid } = validateDeviceForm(deviceForm.value)
  errors.value = formErrors
  return isValid
}

const validateField = (field) => {
  const { errors: formErrors } = validateDeviceForm(deviceForm.value)
  errors.value = { ...errors.value, [field]: formErrors[field] }
}

const openAddModal = () => {
  editingDevice.value = false
  deviceForm.value = {
    id: '',
    name: '',
    status: '运行中',
    battery: 100,
    currentTask: ''
  }
  errors.value = {}
  showDeviceModal.value = true
}

const openEditModal = (device) => {
  editingDevice.value = true
  deviceForm.value = { ...device }
  errors.value = {}
  showDeviceModal.value = true
}

const closeDeviceModal = () => {
  showDeviceModal.value = false
}

const saveDevice = async () => {
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
    let response
    if (editingDevice.value) {
      // 编辑现有设备
      response = await updateDevice(deviceForm.value.id, deviceForm.value)
      const index = devices.value.findIndex(d => d.id === deviceForm.value.id)
      if (index !== -1) {
        devices.value[index] = { ...response.data }
      }
    } else {
      // 添加新设备
      response = await addDevice(deviceForm.value)
      devices.value.push({ ...response.data })
      
      // 如果是添加新设备，并且当前没有选择命令设备，则自动选择新添加的设备
      if (!selectedCommandDevice.value) {
        selectedCommandDevice.value = response.data.id
      }
    }
    
    closeDeviceModal()
  } catch (error) {
    console.error('保存设备失败:', error)
  } finally {
    isSaving.value = false
  }
}

const openDeleteModal = (deviceId) => {
  deviceToDelete.value = deviceId
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deviceToDelete.value = null
}

const deleteDevice = async () => {
  if (!deviceToDelete.value) return
  
  isDeleting.value = true
  
  try {
    // 调用API删除设备
    await deleteDeviceApi(deviceToDelete.value)
    
    // 更新本地设备列表
    devices.value = devices.value.filter(d => d.id !== deviceToDelete.value)
    
    // 如果删除的是当前选中的设备，选择第一个设备作为新的选中设备
    if (selectedDevice.value.id === deviceToDelete.value) {
      selectedDevice.value = devices.value[0] || { id: '', name: '', model: '', location: '', ip: '', rosVersion: '', firmwareVersion: '', installationDate: '' }
    }
    
    // 如果删除的是当前指令下发模块中选中的设备，更新选择
    if (selectedCommandDevice.value === deviceToDelete.value) {
      selectedCommandDevice.value = devices.value[0]?.id || ''
    }
    
    closeDeleteModal()
  } catch (error) {
    console.error('删除设备失败:', error)
  } finally {
    isDeleting.value = false
  }
}

const viewDevice = (device) => {
  selectedDevice.value = device
}

const sendCommand = async () => {
  isSendingCommand.value = true
  
  try {
    // 调用API发送指令
    const targetDeviceId = selectedCommandDevice.value
    if (!targetDeviceId) {
      console.error('请选择一个设备')
      return
    }
    
    const response = await sendCommandToDevice(targetDeviceId, presetCommand.value)
    
    // 显示指令发送结果
    console.log('指令发送结果:', response.data)
    
    // 如果指令发送成功，添加到历史记录并更新设备当前任务
    if (response.data.success) {
      // 获取目标设备
      const targetDevice = devices.value.find(d => d.id === targetDeviceId)
      if (targetDevice) {
        const deviceName = targetDevice.name
        
        // 根据指令类型更新当前任务
        const command = presetCommand.value
        switch (command) {
          case '返回基站':
          case '区域A巡检':
          case '区域B巡检':
          case '区域C巡检':
            targetDevice.currentTask = command
            break
          case '暂停当前任务':
            // 可以在暂停时添加标记，例如：targetDevice.currentTask = `${targetDevice.currentTask} (已暂停)`
            // 或者保持不变，通过其他状态字段表示暂停
            break
          case '继续当前任务':
            // 可以移除暂停标记
            // targetDevice.currentTask = targetDevice.currentTask.replace(' (已暂停)', '')
            break
          case '紧急停止':
            targetDevice.currentTask = '紧急停止'
            break
          case '重启设备':
            targetDevice.currentTask = ''
            break
          default:
            targetDevice.currentTask = command
        }
        
        // 生成当前时间戳
        const now = new Date()
        const timestamp = now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        // 添加到指令历史
        commandHistory.value.unshift({
          command: `${command} (${deviceName})`,
          timestamp: timestamp
        })
        
        // 只保留最近10条历史记录
        if (commandHistory.value.length > 10) {
          commandHistory.value = commandHistory.value.slice(0, 10)
        }
      }
    }
  } catch (error) {
    console.error('发送指令失败:', error)
  } finally {
    isSendingCommand.value = false
  }
}

// 轮询定时器
let statusUpdateTimer = null

// 生命周期钩子
onMounted(() => {
  // 从API获取设备列表
  loadDevices()
  
  // 启动状态轮询，每5秒更新一次
  startStatusPolling()
})

onUnmounted(() => {
  // 停止轮询
  stopStatusPolling()
})

// 启动状态轮询
const startStatusPolling = () => {
  // 清除之前的定时器
  stopStatusPolling()
  
  // 设置新的定时器，每5秒更新一次设备状态
  statusUpdateTimer = setInterval(async () => {
    try {
      await refreshDeviceStatuses()
    } catch (error) {
      console.error('轮询设备状态失败:', error)
    }
  }, 5000) // 5秒轮询一次
}

// 停止状态轮询
const stopStatusPolling = () => {
  if (statusUpdateTimer) {
    clearInterval(statusUpdateTimer)
    statusUpdateTimer = null
  }
}

// 加载设备列表
const loadDevices = async () => {
  try {
    const response = await fetchDevices()
    devices.value = response.data
    if (response.data.length > 0) {
      // 如果当前没有选中设备或者选中设备不存在于新的设备列表中，则选择第一个设备
      const currentSelectedDevice = response.data.find(d => d.id === selectedDevice.value.id)
      selectedDevice.value = currentSelectedDevice || response.data[0]
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

// 刷新设备状态（用于手动刷新按钮）
const refreshDevices = async () => {
  isRefreshing.value = true
  
  try {
    await refreshDeviceStatuses()
  } catch (error) {
    console.error('刷新设备状态失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 刷新设备状态（用于轮询）
const refreshDeviceStatuses = async () => {
  try {
    // 获取最新的设备状态
    const response = await refreshDevicesStatus()
    const updatedDevices = response.data
    
    // 更新设备列表中的状态，保持原有顺序和其他属性
    devices.value = devices.value.map(device => {
      // 找到对应的更新设备
      const updatedDevice = updatedDevices.find(d => d.id === device.id)
      if (updatedDevice) {
        // 更新状态相关字段
        return {
          ...device,
          status: updatedDevice.status,
          battery: updatedDevice.battery,
          lastOnline: updatedDevice.lastOnline
        }
      }
      return device
    })
    
    // 更新选中设备的状态
    const updatedSelectedDevice = devices.value.find(d => d.id === selectedDevice.value.id)
    if (updatedSelectedDevice) {
      selectedDevice.value = updatedSelectedDevice
    }
  } catch (error) {
    console.error('刷新设备状态失败:', error)
    throw error
  }
}
</script>

<style scoped>
#device-page {
  height: 100%;
  width: 100%;
}
</style>
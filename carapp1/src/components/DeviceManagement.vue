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
              <option value="正常">正常</option>
              <option value="故障">故障</option>
            </select>
            <i class="fa fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <!-- 新增：绑定状态筛选 -->
          <div class="relative">
            <select class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" v-model="filterBindingStatus" @change="currentPage = 1">
              <option value="">全部绑定状态</option>
              <option value="已绑定">已绑定</option>
              <option value="未绑定">未绑定</option>
            </select>
            <i class="fa fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="filteredDevices.length > 0">
                <tr v-for="(device, index) in paginatedDevices" :key="device.id" :class="{ 'bg-blue-50': selectedDevice?.id === device.id }" class="cursor-pointer hover:bg-gray-50 transition-colors" @click="viewDevice(device)">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ index + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(device.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ device.status === 1 ? '正常' : '故障' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.created_at ? new Date(device.created_at).toLocaleString() : '未知' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.device_type || '未知' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ device.ip_address || '未知' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary/80 mr-3" @click.stop="viewDevice(device)">查看</button>
                    <button class="text-warning hover:text-warning/80 mr-3" @click.stop="openEditModal(device)">编辑</button>
                    <button class="text-danger hover:text-danger/80" @click.stop="openDeleteModal(device)">删除</button>
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
        
        <!-- 设备详情 -->
        <!-- 在移动端使用单列布局，确保内容不会溢出 -->
        <div v-if="selectedDevice" class="mt-6 bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ selectedDevice?.id || '设备' }} 详情</h3>
            <button class="text-blue-600 hover:text-blue-800 font-medium focus:outline-none" @click="closeDeviceDetail">
              <i class="fa fa-times mr-1"></i> 关闭
            </button>
          </div>
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">设备ID</span>
                  <span class="text-sm font-medium">{{ selectedDevice?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">设备类型</span>
                  <span class="text-sm font-medium">{{ selectedDevice?.device_type || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">IP地址</span>
                  <span class="text-sm font-medium">{{ selectedDevice?.ip_address || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">视频流地址</span>
                  <span class="text-sm font-medium truncate max-w-[150px]">{{ selectedDevice?.url || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">创建时间</span>
                  <span class="text-sm font-medium">{{ selectedDevice?.created_at ? new Date(selectedDevice.created_at).toLocaleString() : 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">更新时间</span>
                  <span class="text-sm font-medium">{{ selectedDevice?.updated_at ? new Date(selectedDevice.updated_at).toLocaleString() : 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">绑定小车</span>
                  <span class="text-sm font-medium">
                    {{ boundCar ? boundCar.name : '未绑定' }}
                  </span>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
              <input type="text" v-model="deviceForm.name" @blur="validateField('name')" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" :class="errors.name ? 'border-red-300' : ''">
              <span v-if="errors.name" class="text-xs text-red-500 mt-1 block">{{ errors.name }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">设备类型</label>
              <select v-model="deviceForm.device_type" @blur="validateField('device_type')" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" :class="errors.device_type ? 'border-red-300' : ''">
                <option value="">请选择设备类型</option>
                <option v-for="type in deviceTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <span v-if="errors.device_type" class="text-xs text-red-500 mt-1 block">{{ errors.device_type }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">IP地址</label>
              <input type="text" v-model="deviceForm.ip_address" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
            </div>
            <div v-if="deviceForm.device_type === 'camera'">
              <label class="block text-sm font-medium text-gray-700 mb-1">视频流地址</label>
              <input type="text" v-model="deviceForm.url" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { deviceApi, carApi } from '../utils/api.js'

// 接收设备数据和小车数据作为props
const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  },
  cars: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update-devices'])

// 设备类型选项
const deviceTypes = [
  { value: 'laser', label: '激光雷达' },
  { value: 'camera', label: '摄像头' }
]

// 简化实现，移除对device.js的依赖
const validateDeviceForm = (form) => {
  const errors = {}
  if (!form.name) {
    errors.name = '设备名称不能为空'
  }
  if (!form.device_type) {
    errors.device_type = '设备类型不能为空'
  }
  return { errors, isValid: Object.keys(errors).length === 0 }
}

const getStatusClass = (status) => {
  return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')
const filterBindingStatus = ref('') // 新增：绑定状态筛选

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
  device_type: '',
  ip_address: '',
  url: ''
})

const errors = ref({})

// 监听设备类型变化，当选择激光雷达时清空视频流地址
watch(() => deviceForm.value.device_type, (newType) => {
  if (newType === 'laser') {
    deviceForm.value.url = ''
  }
})

// 加载状态
const isSaving = ref(false)
const isDeleting = ref(false)
const isSendingCommand = ref(false)
const isRefreshing = ref(false)

// 选中的设备
const selectedDevice = ref(null)

// 计算属性：查找绑定了当前设备的小车
const boundCar = computed(() => {
  if (!selectedDevice.value) return null
  // 遍历所有小车，查找哪个小车的devices数组中包含当前设备的id
  return props.cars.find(car => {
    return car.devices && car.devices.some(device => device.id === selectedDevice.value.id)
  })
})

// 指令相关
const presetCommand = ref('返回基站')
const selectedCommandDevice = ref('')

// 指令历史
const commandHistory = ref([])

// 计算属性
const filteredDevices = computed(() => {
  return props.devices.filter(device => {
    // 搜索筛选
    const matchesSearch = device.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         device.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 状态筛选 - 确保与后端返回的状态值保持一致
    let matchesStatus = true
    if (filterStatus.value) {
      // 后端返回的状态值：1-在线(正常)，0-离线(故障)
      const statusMap = {
        '正常': 1,
        '故障': 0
      }
      matchesStatus = device.status === statusMap[filterStatus.value]
    }
    
    // 绑定状态筛选
    let matchesBindingStatus = true
    if (filterBindingStatus.value) {
      const isBound = isDeviceBound(device)
      matchesBindingStatus = (filterBindingStatus.value === '已绑定' && isBound) || 
                             (filterBindingStatus.value === '未绑定' && !isBound)
    }
    
    return matchesSearch && matchesStatus && matchesBindingStatus
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
    device_type: '',
    ip_address: '',
    url: ''
  }
  errors.value = {}
  showDeviceModal.value = true
}

const openEditModal = (device) => {
  editingDevice.value = true
  deviceForm.value = {
    id: device.id,
    name: device.name,
    device_type: device.device_type || '',
    ip_address: device.ip_address || '',
    url: device.url || ''
  }
  errors.value = {}
  showDeviceModal.value = true
}

const closeDeviceModal = () => {
  showDeviceModal.value = false
}

const saveDevice = async () => {
  // console.log('saveDevice函数被调用');
  // console.log('表单验证结果:', validateForm());
  // console.log('表单数据:', deviceForm.value);
  
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
      let response
      if (editingDevice.value) {
        // 编辑现有设备
        response = await deviceApi.update(selectedDevice.value.id, deviceForm.value)
      } else {
        // 添加新设备
        response = await deviceApi.post(deviceForm.value)
        
        // 如果是添加新设备，并且当前没有选择命令设备，则自动选择新添加的设备
        if (!selectedCommandDevice.value) {
          selectedCommandDevice.value = response.data.id
        }
      }
      
      // 通知父组件更新设备列表
      loadDevices()
      closeDeviceModal()
  } catch (error) {
    console.error('保存设备失败:', error)
    alert('保存设备失败：' + (error.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

// 检查设备是否绑定到了小车
const isDeviceBound = (device) => {
  if (!device) return false
  // 遍历所有小车，查找哪个小车的devices数组中包含当前设备的id
  return props.cars.some(car => {
    return car.devices && car.devices.some(dev => dev.id === device.id)
  })
}

const openDeleteModal = (device) => {
  // 检查设备是否绑定到了小车
  if (isDeviceBound(device)) {
    alert('该设备已绑定到小车，请先解除绑定再删除！')
    return
  }
  
  deviceToDelete.value = device.id
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
      await deviceApi.delete(deviceToDelete.value)
      
      // 通知父组件更新设备列表
      emit('update-devices')
      
      closeDeleteModal()
  } catch (error) {
    console.error('删除设备失败:', error)
  } finally {
    isDeleting.value = false
  }
}

// 查看设备详情
const viewDevice = (device) => {
  selectedDevice.value = device
}

// 关闭设备详情
const closeDeviceDetail = () => {
  selectedDevice.value = null
}



// 发送指令功能暂时移除，因为后端没有对应的接口
const sendCommand = async () => {
  alert('该功能暂时不可用')
  isSendingCommand.value = false
}

// 轮询定时器
let statusUpdateTimer = null

// 生命周期钩子
onMounted(() => {
  // 设备数据已通过props传入，无需从API获取
  // 启动设备状态轮询
  startStatusPolling()
})

onUnmounted(() => {
  // 组件卸载时停止状态轮询
  stopStatusPolling()
})

// 启动状态轮询
const startStatusPolling = () => {
  // 清除之前的定时器
  stopStatusPolling()
  
  // 设置新的定时器，每5秒更新一次设备状态
  statusUpdateTimer = setInterval(async () => {
    try {
      await loadDevices()
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

// 当props.devices变化时，更新选中的设备
watch(() => props.devices, (newDevices) => {
  if (newDevices.length > 0) {
    // 如果当前选中设备不存在于新的设备列表中，则设置为null
    if (selectedDevice.value) {
      const currentSelectedDevice = newDevices.find(d => d.id === selectedDevice.value.id)
      if (!currentSelectedDevice) {
        selectedDevice.value = null
      }
    }
    // 不默认选中任何设备，保持selectedDevice为null
  } else {
    // 如果没有设备数据，设置为null
    selectedDevice.value = null
  }
}, { immediate: true })

// 加载设备列表（通过父组件刷新）
const loadDevices = () => {
  // 触发父组件更新设备列表
  emit('update-devices')
}

// 刷新设备列表
const refreshDevices = async () => {
  isRefreshing.value = true
  try {
    await loadDevices()
  } catch (error) {
    console.error('刷新设备列表失败:', error)
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style scoped>
#device-page {
  height: 100%;
  width: 100%;
}
</style>
/**
 * 设备管理工具函数
 */

import axios from 'axios';

// 后端API基础URL（与api.js保持一致）
const API_BASE_URL = '/api';

// 创建axios实例（与api.js保持一致）
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 设置10秒超时
  timeoutErrorMessage: '请求超时，请检查网络连接或服务器状态'
});

// 模拟设备列表数据（仅用于参考）
export const initialDevices = [
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
    installationDate: '2025-12-15'
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
    installationDate: '2025-12-16'
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
    installationDate: '2025-12-17'
  }
]

/**
 * 实际API调用 - 获取设备列表
 */
export const fetchDevices = async () => {
  try {
    console.log('调用API获取设备列表:', `${API_BASE_URL}/devices/`)
    const response = await apiClient.get('/devices/')
    console.log('获取设备列表成功:', response.data)
    return response
  } catch (error) {
    console.error('获取设备列表失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 获取设备详情
 */
export const fetchDeviceDetail = async (deviceId) => {
  try {
    console.log('调用API获取设备详情:', `${API_BASE_URL}/devices/${deviceId}`)
    const response = await apiClient.get(`/devices/${deviceId}`)
    console.log('获取设备详情成功:', response.data)
    return response
  } catch (error) {
    console.error('获取设备详情失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 添加设备
 */
export const addDevice = async (deviceData) => {
  try {
    console.log('调用API添加设备:', `${API_BASE_URL}/devices/`, deviceData)
    const response = await apiClient.post('/devices/', deviceData)
    console.log('添加设备成功:', response.data)
    return response
  } catch (error) {
    console.error('添加设备失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 更新设备
 */
export const updateDevice = async (deviceId, deviceData) => {
  try {
    console.log('调用API更新设备:', `${API_BASE_URL}/devices/${deviceId}`, deviceData)
    const response = await apiClient.patch(`/devices/${deviceId}`, deviceData)
    console.log('更新设备成功:', response.data)
    return response
  } catch (error) {
    console.error('更新设备失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 删除设备
 */
export const deleteDevice = async (deviceId) => {
  try {
    console.log('调用API删除设备:', `${API_BASE_URL}/devices/${deviceId}`)
    const response = await apiClient.delete(`/devices/${deviceId}`)
    console.log('删除设备成功:', response.data)
    return response
  } catch (error) {
    console.error('删除设备失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 刷新设备状态
 */
export const refreshDevicesStatus = async () => {
  try {
    console.log('调用API刷新设备状态:', `${API_BASE_URL}/devices/`)
    const response = await apiClient.get('/devices/')
    
    // 返回设备数据，添加lastOnline字段
    const devices = response.data.map(device => {
      // 状态映射：英文 -> 中文
      const statusMapping = {
        'running': '运行中',
        'idle': '待机中',
        'error': '故障'
      }
      
      // 更新最后在线时间为'刚刚'
      const lastOnline = '刚刚'
      
      return {
        ...device,
        status: statusMapping[device.status] || '待机中', // 转换为中文状态
        battery: device.battery, // 保持后端返回的电量
        lastOnline: lastOnline
      }
    })
    
    console.log('刷新设备状态成功:', devices)
    return { data: devices }
  } catch (error) {
    console.error('刷新设备状态失败:', error)
    throw error
  }
}

/**
 * 实际API调用 - 发送指令到设备
 */
export const sendCommandToDevice = async (deviceId, command) => {
  try {
    console.log('调用API发送指令到设备:', `${API_BASE_URL}/devices/${deviceId}/commands`, command)
    const response = await apiClient.post(`/devices/${deviceId}/commands`, command)
    console.log('发送指令成功:', response.data)
    return response
  } catch (error) {
    console.error('发送指令失败:', error)
    throw error
  }
}

/**
 * 验证设备表单数据
 */
export const validateDeviceForm = (formData) => {
  const errors = {}
  
  if (!formData.id?.trim()) {
    errors.id = '设备编号不能为空'
  }
  
  if (!formData.name?.trim()) {
    errors.name = '设备名称不能为空'
  }
  
  if (formData.battery < 0 || formData.battery > 100) {
    errors.battery = '电池电量必须在0-100之间'
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  }
}

/**
 * 获取状态对应的CSS类
 */
export const getStatusClass = (status) => {
  const statusMap = {
    '运行中': 'bg-green-100 text-green-800',
    '待机中': 'bg-yellow-100 text-yellow-800',
    '故障': 'bg-red-100 text-red-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}
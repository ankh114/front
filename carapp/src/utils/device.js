/**
 * 设备管理工具函数
 */

// 模拟设备列表数据
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
 * 模拟API调用 - 获取设备列表
 */
export const fetchDevices = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.get('/api/devices')
    
    // 返回模拟数据
    return { data: initialDevices }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 获取设备详情
 */
export const fetchDeviceDetail = async (deviceId) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.get(`/api/devices/${deviceId}`)
    
    // 返回模拟数据
    const device = initialDevices.find(d => d.id === deviceId)
    if (!device) {
      throw new Error('设备不存在')
    }
    return { data: device }
  } catch (error) {
    console.error('获取设备详情失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 添加设备
 */
export const addDevice = async (deviceData) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.post('/api/devices', deviceData)
    
    // 返回模拟数据
    return { data: { ...deviceData } }
  } catch (error) {
    console.error('添加设备失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 更新设备
 */
export const updateDevice = async (deviceId, deviceData) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.put(`/api/devices/${deviceId}`, deviceData)
    
    // 返回模拟数据
    return { data: { ...deviceData } }
  } catch (error) {
    console.error('更新设备失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 删除设备
 */
export const deleteDevice = async (deviceId) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.delete(`/api/devices/${deviceId}`)
    
    // 返回模拟数据
    return { data: { success: true } }
  } catch (error) {
    console.error('删除设备失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 刷新设备状态
 */
export const refreshDevicesStatus = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.get('/api/devices/status')
    
    // 返回模拟数据，随机更新设备状态
    return {
      data: initialDevices.map(device => {
        // 随机更新状态
        const statuses = ['运行中', '待机中', '故障']
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        
        // 随机更新电量（±5%）
        let newBattery = device.battery + (Math.random() * 10 - 5)
        newBattery = Math.max(0, Math.min(100, Math.round(newBattery)))
        
        // 随机更新最后在线时间
        const onlineTimes = ['刚刚', '1分钟前', '5分钟前', '10分钟前', '30分钟前', '1小时前']
        const randomOnlineTime = onlineTimes[Math.floor(Math.random() * onlineTimes.length)]
        
        return {
          ...device,
          status: randomStatus,
          battery: newBattery,
          lastOnline: randomOnlineTime
        }
      })
    }
  } catch (error) {
    console.error('刷新设备状态失败:', error)
    throw error
  }
}

/**
 * 模拟API调用 - 发送指令到设备
 */
export const sendCommandToDevice = async (deviceId, command) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中，这里应该使用fetch或axios调用后端接口
    // return await axios.post(`/api/vehicle/control`, { deviceId, command })
    
    // 返回模拟数据
    const success = Math.random() > 0.1 // 90%成功率
    return {
      data: {
        success,
        message: success ? '指令发送成功' : '指令发送失败',
        result: `设备 ${deviceId} 已接收指令: ${command}`
      }
    }
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
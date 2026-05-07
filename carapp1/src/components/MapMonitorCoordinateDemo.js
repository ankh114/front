// 1. 地图点击事件监听实现 (在MapMonitor.vue的initMainMap函数中添加)
const initMainMap = () => {
  // ... 现有代码 ...
  
  try {
    // ... 现有地图初始化代码 ...
    
    // 存储地图实例
    viewer = map
    
    // 添加地图点击事件监听
    map.on('click', (e) => {
      // Leaflet返回的坐标格式是[纬度, 经度]
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      
      // 转换为通常后端使用的[经度, 纬度]格式
      const coordinates = {
        lon: lng,
        lat: lat
      }
      
      // 显示坐标信息，可以通过模态框或弹窗展示
      showCoordinateModal(coordinates)
    })
    
    // ... 现有代码 ...
  } catch (error) {
    // ... 现有错误处理 ...
  }
}

// 2. 坐标展示和发送模态框 (在MapMonitor.vue的template中添加)
/*
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
            <i class="fa fa-paper-plane"></i>
            发送到后端
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
*/

// 3. 状态管理和发送函数 (在MapMonitor.vue的script中添加)
/*
// 坐标模态框状态
const showCoordinateModal = ref(false)
const selectedCoordinates = ref({ lon: 0, lat: 0 })

// 显示坐标模态框
const showCoordinateModal = (coordinates) => {
  selectedCoordinates.value = coordinates
  showCoordinateModal.value = true
}

// 发送坐标到后端
const sendCoordinates = async () => {
  try {
    // 检查后端是否支持直接发送坐标
    // 方案1: 如果后端有专门的坐标接收端点
    // await request('/coordinates', 'POST', selectedCoordinates.value)
    
    // 方案2: 复用现有API，例如任务API
    await taskApi.create({
      name: '地图点击任务',
      mapCenter: selectedCoordinates.value,
      status: 'pending'
    })
    
    alert('坐标发送成功！')
    showCoordinateModal.value = false
  } catch (error) {
    console.error('发送坐标失败:', error)
    alert('发送坐标失败: ' + error.message)
  }
}
*/

// 4. 后端API修改建议 (如果需要)
/*
// 在api.js中添加坐标相关API
export const coordinateApi = {
  // 发送坐标到后端
  post: (coordinates) => request('/coordinates', 'POST', coordinates),
  
  // 获取历史坐标
  getHistory: () => request('/coordinates/history', 'GET')
}
*/

// 总结：
// - 该功能可以实现，需要在MapMonitor.vue中添加点击事件监听
// - 需要创建坐标展示和发送的UI组件
// - 可以复用现有API或添加新的API端点
// - Leaflet返回[纬度, 经度]，后端通常使用[经度, 纬度]，需要注意转换
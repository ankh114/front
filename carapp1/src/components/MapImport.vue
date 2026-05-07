<template>
  <div class="page-content" id="map-import-page">
    <!-- 保存成功消息 -->
    <div v-if="savedMessage" class="saved-message">
      {{ savedMessage }}
    </div>
    
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-bold">地图上传</h2>
        <div class="flex gap-2">
          <button class="btn-primary text-sm px-4 py-2" @click="showUploadModal = true">
            <i class="fa fa-upload mr-1"></i> 上传地图
          </button>
          <button class="btn-outline text-sm px-4 py-2" @click="deleteSelectedMap" :disabled="!selectedMap">
            <i class="fa fa-trash mr-1"></i> 删除地图
          </button>
        </div>
      </div>
      
      <!-- 地图列表区 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧地图列表 -->
        <div class="w-full p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="map in maps" 
              :key="map.id"
              :class="{
                'ring-2 ring-primary': selectedMap && selectedMap.id === map.id,
                'ring-2 ring-transparent': !selectedMap || selectedMap.id !== map.id
              }"
              class="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 bg-white"
              @click="selectMap(map)"
            >
              <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                  <h3 class="font-medium text-gray-800">{{ map.name }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">地图</span>
                </div>
                
                <div class="text-xs text-gray-500 mb-2">
                  <i class="fa fa-file-image-o mr-1"></i> PGM文件: {{ map.pgm_file?.split('/').pop() || '未知' }}
                </div>
                
                <div class="text-xs text-gray-500 mb-2">
                  <i class="fa fa-file-text-o mr-1"></i> YAML文件: {{ map.yaml_file?.split('/').pop() || '未知' }}
                </div>

                <div class="text-xs text-gray-500">
                  <i class="fa fa-calendar-o mr-1"></i> 上传时间: {{ map.created_at || new Date().toLocaleString('zh-CN') }}
                </div>
              </div>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="isLoading" class="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div class="text-6xl text-gray-300 mb-4">
                <i class="fa fa-spinner fa-spin"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-600 mb-1">正在加载地图数据...</h3>
              <p class="text-sm text-gray-500">请稍候</p>
            </div>
            
            <!-- 空状态 -->
            <div v-else-if="maps.length === 0" class="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div class="text-6xl text-gray-300 mb-4">
                <i class="fa fa-map"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-600 mb-1">暂无地图数据</h3>
              <p class="text-sm text-gray-500 mb-4">点击上方"上传地图"按钮添加新地图</p>
              <button class="btn-primary text-sm px-4 py-2" @click="showUploadModal = true">
                <i class="fa fa-upload mr-1"></i> 上传地图
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 上传地图弹窗 -->
    <Transition name="modal">
      <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-medium">上传地图</h3>
            <button @click="showUploadModal = false" class="text-gray-500 hover:text-gray-700 text-xl">
              <i class="fa fa-times"></i>
            </button>
          </div>
          
          <form @submit.prevent="uploadMap" enctype="multipart/form-data">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">地图名称</label>
                <input 
                  v-model="uploadForm.name" 
                  type="text" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="输入地图名称"
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">PGM地图文件</label>
                <input 
                  type="file" 
                  accept=".pgm"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  required
                  @change="uploadForm.pgmFile = $event.target.files[0]"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">YAML配置文件</label>
                <input 
                  type="file" 
                  accept=".yaml,.yml"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  required
                  @change="uploadForm.yamlFile = $event.target.files[0]"
                >
              </div>
            </div>
            
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" @click="showUploadModal = false">
                取消
              </button>
              <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" :disabled="isUploading">
                <i v-if="isUploading" class="fa fa-spinner fa-spin mr-1"></i>
                {{ isUploading ? '上传中...' : '上传地图' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
    
    <!-- 地图预览弹窗 -->
    <Transition name="modal">
      <div v-if="showPreviewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-medium">{{ previewMap?.name }} - 地图预览</h3>
            <button @click="showPreviewModal = false" class="text-gray-500 hover:text-gray-700 text-xl">
              <i class="fa fa-times"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <div v-if="previewMap?.preview_url" class="flex justify-center">
              <img 
                :src="previewMap.preview_url" 
                :alt="previewMap.name" 
                class="max-w-full max-h-[60vh] object-contain border rounded-lg"
              >
            </div>
            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <div class="text-6xl text-gray-300 mb-4">
                <i class="fa fa-map"></i>
              </div>
              <p class="text-gray-500">暂无地图预览图像</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium mb-3">地图信息</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">地图名称:</span>
                  <span class="font-medium">{{ previewMap?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">PGM文件:</span>
                  <span class="font-medium">{{ previewMap?.pgm_file?.split('/').pop() || '未知' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">YAML文件:</span>
                  <span class="font-medium">{{ previewMap?.yaml_file?.split('/').pop() || '未知' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">上传时间:</span>
                  <span class="font-medium">{{ previewMap?.created_at || '未知' }}</span>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium mb-3">地图属性</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">分辨率:</span>
                  <span class="font-medium">{{ previewMap?.resolution || '未知' }} m/pixel</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">宽度:</span>
                  <span class="font-medium">{{ previewMap?.width || '未知' }} px</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">高度:</span>
                  <span class="font-medium">{{ previewMap?.height || '未知' }} px</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">原点X:</span>
                  <span class="font-medium">{{ previewMap?.origin_x || '未知' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">原点Y:</span>
                  <span class="font-medium">{{ previewMap?.origin_y || '未知' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">原点Yaw:</span>
                  <span class="font-medium">{{ previewMap?.origin_yaw || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" @click="showPreviewModal = false">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { mapApi } from '@/utils/api'

// 状态管理
const selectedMap = ref(null)
const savedMessage = ref('')
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const previewMap = ref(null)
const isLoading = ref(false)
const isUploading = ref(false)

// 地图列表
const maps = ref([])

// 上传表单数据
const uploadForm = reactive({
  name: '',
  pgmFile: null,
  yamlFile: null
})

// 定义事件
const emit = defineEmits(['update-maps'])

// 选择地图
const selectMap = (map) => {
  selectedMap.value = map
  previewMap.value = map
  showPreviewModal.value = true
}

// 上传地图
const uploadMap = async () => {
  if (!uploadForm.name || !uploadForm.pgmFile || !uploadForm.yamlFile) {
    savedMessage.value = '请填写所有必填字段'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  isUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('name', uploadForm.name)
    formData.append('pgm_file', uploadForm.pgmFile)
    formData.append('yaml_file', uploadForm.yamlFile)
    
    const response = await mapApi.upload(formData)
    const newMap = response.data
    
    // 添加到地图列表
    maps.value.push(newMap)
    
    // 通知父组件更新地图列表
    emit('update-maps', maps.value)
    
    // 清空表单并关闭弹窗
    uploadForm.name = ''
    uploadForm.pgmFile = null
    uploadForm.yamlFile = null
    showUploadModal.value = false
    
    // 显示成功消息
    savedMessage.value = '地图上传成功'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('上传地图失败:', error)
    savedMessage.value = '上传地图失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } finally {
    isUploading.value = false
  }
}

// 删除地图
const deleteSelectedMap = async () => {
  if (!selectedMap.value) return
  
  if (!confirm('确定要删除选中的地图吗？')) return
  
  try {
    await mapApi.delete(selectedMap.value.id)
    
    // 从地图列表中移除
    const index = maps.value.findIndex(map => map.id === selectedMap.value.id)
    if (index !== -1) {
      maps.value.splice(index, 1)
    }
    
    // 通知父组件更新地图列表
    emit('update-maps', maps.value)
    
    // 清空选中状态
    selectedMap.value = null
    
    // 显示成功消息
    savedMessage.value = '地图删除成功'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('删除地图失败:', error)
    savedMessage.value = '删除地图失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 获取地图列表
const fetchMaps = async () => {
  isLoading.value = true
  try {
    const response = await mapApi.get()
    maps.value = response.data || []
    // 通知父组件更新地图列表
    emit('update-maps', maps.value)
  } catch (error) {
    console.error('获取地图列表失败:', error)
    maps.value = []
  } finally {
    isLoading.value = false
  }
}

// 当组件挂载时，获取地图列表
onMounted(() => {
  fetchMaps()
})
</script>

<style scoped>
.page-content {
  height: 100%;
  overflow: hidden;
}

.saved-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideInRight 0.3s ease-in-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>
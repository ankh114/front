<template>
  <div class="page-content" id="task-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">任务规划</h2>
        <div class="flex gap-3">
          <button class="btn-primary">
            <i class="fa fa-plus mr-1"></i> 新建任务
          </button>
          <button class="btn-outline">
            <i class="fa fa-calendar mr-1"></i> 任务调度
          </button>
        </div>
      </div>
      
      <!-- 任务规划内容区 -->
      <div class="flex-1 overflow-hidden flex">
        <!-- 左侧任务列表 -->
        <div class="w-80 border-r overflow-y-auto">
          <div class="p-4">
            <div class="relative">
              <input type="text" placeholder="搜索任务..." class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <div class="mt-4 space-y-1">
              <button class="w-full text-left sidebar-item active">
                <i class="fa fa-list w-5 text-center"></i>
                <span>所有任务</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-play-circle w-5 text-center"></i>
                <span>进行中</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-clock-o w-5 text-center"></i>
                <span>待执行</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-check-circle w-5 text-center"></i>
                <span>已完成</span>
              </button>
              <button class="w-full text-left sidebar-item">
                <i class="fa fa-times-circle w-5 text-center"></i>
                <span>已取消</span>
              </button>
            </div>
          </div>
          
          <div class="border-t p-4">
            <h3 class="text-sm font-medium mb-3">任务列表</h3>
            <div class="space-y-2">
              <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg cursor-pointer">
                <div class="font-medium text-sm">区域A日常巡检</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-001 · 进行中</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 14:00-16:00</div>
              </div>
              
              <div class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <div class="font-medium text-sm">区域B设备检查</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-002 · 待执行</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 16:30-17:30</div>
              </div>
              
              <div class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <div class="font-medium text-sm">区域C夜间巡逻</div>
                <div class="text-xs text-gray-500 mt-1">ROBOT-003 · 已取消</div>
                <div class="text-xs text-gray-500 mt-1">2023-06-15 20:00-22:00</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧地图和路径规划 -->
        <div class="flex-1 flex flex-col">
          <!-- 路径规划工具栏 -->
          <div class="bg-white border-b p-3 flex items-center gap-3">
            <button class="btn-outline text-sm">
              <i class="fa fa-mouse-pointer mr-1"></i> 点选模式
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-arrows mr-1"></i> 多边形模式
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-repeat mr-1"></i> 自动规划
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-trash mr-1"></i> 清除路径
            </button>
            <div class="ml-auto">
              <button class="btn-primary text-sm">
                <i class="fa fa-save mr-1"></i> 保存路径
              </button>
            </div>
          </div>
          
          <!-- 路径规划地图 -->
          <div class="flex-1 bg-gray-100" id="task-map-container">
            <!-- 这里可以后续初始化Cesium地图 -->
            <div class="w-full h-full flex items-center justify-center text-gray-500">
              <span>路径规划地图容器</span>
            </div>
          </div>
          
          <!-- 任务参数设置 -->
          <div class="bg-white border-t p-4">
            <h3 class="font-medium mb-3">任务参数设置</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">任务名称</label>
                <input type="text" value="区域A日常巡检" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">执行设备</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>ROBOT-001</option>
                  <option>ROBOT-002</option>
                  <option>ROBOT-003</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">开始时间</label>
                <input type="datetime-local" value="2023-06-15T14:00" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">结束时间</label>
                <input type="datetime-local" value="2023-06-15T16:00" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              </div>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">巡检模式</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>快速巡检</option>
                  <option>精细巡检</option>
                  <option>重点区域巡检</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">移动速度</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>低速 (0.5m/s)</option>
                  <option>中速 (1.0m/s)</option>
                  <option>高速 (1.5m/s)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">传感器配置</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>全传感器开启</option>
                  <option>仅雷达</option>
                  <option>仅摄像头</option>
                </select>
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-xs text-gray-500 mb-1">任务描述</label>
              <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-16" placeholder="输入任务描述...">对区域A进行日常巡检，重点检查设备运行状态和安全隐患，每30分钟上报一次数据。</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskPlanning',
  mounted() {
    // 可选：初始化任务规划的地图
    // const viewer = new this.Cesium.Viewer('task-map-container')
  }
}
</script>

<style scoped>
/* 页面专属样式 */
.page-content {
  height: 100%;
  width: 100%;
}

#task-map-container {
  height: 100%;
  width: 100%;
}
</style>
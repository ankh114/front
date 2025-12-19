<template>
  <div class="page-content" id="issue-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold">问题管理</h2>
        <div class="flex gap-3">
          <div class="relative">
            <input type="text" placeholder="搜索问题..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button class="btn-primary">
            <i class="fa fa-filter mr-1"></i> 筛选
          </button>
        </div>
      </div>
      
      <!-- 问题统计和列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-5 card-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">总问题数</div>
                <div class="text-3xl font-bold mt-1">24</div>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <i class="fa fa-exclamation-triangle text-xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-success">
              <i class="fa fa-arrow-up"></i> 较昨日 +2
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-5 card-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">待处理</div>
                <div class="text-3xl font-bold mt-1">8</div>
              </div>
              <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <i class="fa fa-clock-o text-xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-danger">
              <i class="fa fa-arrow-up"></i> 较昨日 +3
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-5 card-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">处理中</div>
                <div class="text-3xl font-bold mt-1">5</div>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <i class="fa fa-spinner text-xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500">
              <i class="fa fa-minus"></i> 与昨日持平
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-5 card-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">已解决</div>
                <div class="text-3xl font-bold mt-1">11</div>
              </div>
              <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <i class="fa fa-check-circle text-xl"></i>
              </div>
            </div>
            <div class="mt-3 text-xs text-success">
              <i class="fa fa-arrow-up"></i> 较昨日 +5
            </div>
          </div>
        </div>
        
        <!-- 问题列表 -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题编号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发现位置</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发现时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发现设备</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- 可自行补充问题列表行 -->
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">ISSUE-001</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">设备故障</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">厂房A区</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">2023-06-15 14:32</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning/10 text-warning">待处理</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ROBOT-001</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary/80 mr-3">查看</button>
                  <button class="text-warning hover:text-warning/80 mr-3">处理</button>
                  <button class="text-danger hover:text-danger/80">关闭</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssueManagement'
}
</script>

<style scoped>
/* 页面专属样式 */
.page-content {
  height: 100%;
  width: 100%;
}
</style>
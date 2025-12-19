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
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">ISSUE-001</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">设备异常</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">区域A-设备区</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">2023-06-15 14:32</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">待处理</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ROBOT-001</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary/80">查看详情</button>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">ISSUE-002</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">零件损坏</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">区域B-通道</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">2023-06-15 13:45</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">处理中</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ROBOT-002</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary/80">查看详情</button>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">ISSUE-003</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">障碍物</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">区域A-通道</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">2023-06-15 12:10</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">已解决</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ROBOT-001</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary/80">查看详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 问题详情 -->
        <div class="mt-6 bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-medium">ISSUE-001 详情</h3>
              <div class="text-sm text-gray-500 mt-1">设备异常 · 发现于 2023-06-15 14:32</div>
            </div>
            <div class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              待处理
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-500 mb-2">问题描述</h4>
                <div class="text-sm bg-gray-50 p-3 rounded-lg">
                  检测到区域A设备区的3号配电柜存在异常温度升高现象，当前温度为65°C，超过正常阈值(40°C)。红外摄像头显示柜门处有明显热源点，可能存在线路老化或接触不良问题。
                </div>
              </div>
              
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-500 mb-2">现场图片</h4>
                <div class="grid grid-cols-2 gap-3">
                  <img src="https://picsum.photos/400/300?random=10" alt="现场图片1" class="rounded-lg w-full h-40 object-cover">
                  <img src="https://picsum.photos/400/300?random=11" alt="现场图片2" class="rounded-lg w-full h-40 object-cover">
                </div>
              </div>
              
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-500 mb-2">处理记录</h4>
                <div class="space-y-3">
                  <div class="border-l-2 border-gray-200 pl-3 py-1">
                    <div class="text-sm font-medium">系统自动创建问题单</div>
                    <div class="text-xs text-gray-500 mt-0.5">2023-06-15 14:32:15</div>
                  </div>
                  <div class="border-l-2 border-gray-200 pl-3 py-1">
                    <div class="text-sm font-medium">系统已通知维修人员张三</div>
                    <div class="text-xs text-gray-500 mt-0.5">2023-06-15 14:33:02</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-2">处理备注</h4>
                <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" placeholder="输入处理备注..."></textarea>
                <div class="mt-3 flex gap-3">
                  <button class="btn-primary">
                    <i class="fa fa-save mr-1"></i> 保存备注
                  </button>
                  <button class="btn-outline">
                    <i class="fa fa-check mr-1"></i> 标记为已解决
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-3">问题信息</h4>
              <div class="space-y-3">
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">问题类型</span>
                  <span class="text-sm font-medium">设备异常</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">发现位置</span>
                  <span class="text-sm font-medium">区域A-设备区</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">GPS坐标</span>
                  <span class="text-sm font-medium">N30.1234° E120.5678°</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">相对坐标</span>
                  <span class="text-sm font-medium">(125.3, 45.8, 0.5)</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">发现设备</span>
                  <span class="text-sm font-medium">ROBOT-001</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">发现时间</span>
                  <span class="text-sm font-medium">2023-06-15 14:32</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">优先级</span>
                  <span class="text-sm font-medium text-warning">中</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                  <span class="text-sm text-gray-600">负责人</span>
                  <span class="text-sm font-medium">张三 (维修组)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">预计解决时间</span>
                  <span class="text-sm font-medium">2025-12-15 16:00</span>
                </div>
              </div>
            </div>
          </div>
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
#issue-page {
  height: 100%;
  width: 100%;
}
</style>
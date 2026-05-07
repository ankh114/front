<template>
  <div class="page-content" id="issue-page">
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-6 border-b flex justify-between items-center relative">
        <h2 class="text-xl font-bold">问题管理</h2>
        <div class="flex gap-3">
          <div class="relative">
            <input type="text" placeholder="搜索问题..." v-model="searchQuery" class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button class="btn-primary" @click="toggleFilterPanel">
            <i class="fa fa-filter mr-1"></i> 筛选
          </button>
        </div>
        
        <!-- 筛选面板 -->
        <div v-if="showFilterPanel" class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-80 z-10">
          <h3 class="text-sm font-medium mb-3">筛选条件</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-gray-500 mb-2">任务ID</label>
              <input type="number" v-model="filters.taskId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="输入任务ID">
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-2">任务名称</label>
              <input type="text" v-model="filters.taskName" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="输入任务名称">
            </div>
            <div class="flex gap-2">
              <button class="btn-primary flex-1 text-sm" @click="applyFilters">应用筛选</button>
              <button class="btn-outline flex-1 text-sm" @click="resetFilters">重置</button>
            </div>
          </div>
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
                <div class="text-3xl font-bold mt-1">{{ issues.length }}</div>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <i class="fa fa-exclamation-triangle text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 保存提示 -->
        <div v-if="savedMessage" class="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm flex items-center justify-between">
          <span>{{ savedMessage }}</span>
          <button @click="savedMessage = ''" class="text-green-600 hover:text-green-800">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- 问题列表 -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题编号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现时间</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="issue in filteredIssues" 
                :key="issue.id"
                @click="selectIssue(issue)"
                class="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ issue.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ issue.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ issue.task_name || '-' }}
                  <span v-if="issue.task_car_name" class="text-xs text-gray-500 ml-2">({{ issue.task_car_name }})</span>
                  <span v-else-if="issue.task_car_id" class="text-xs text-gray-500 ml-2">(小车{{ issue.task_car_id }})</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(issue.created_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-primary/80">查看详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 问题详情弹出窗口 -->
        <div v-if="selectedIssue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="p-6 border-b flex justify-between items-center">
              <div>
                <h3 class="text-lg font-medium">{{ selectedIssue.id }} 详情</h3>
                <div class="text-sm text-gray-500 mt-1">{{ selectedIssue.name }} · 创建于 {{ formatDate(selectedIssue.created_at) }}</div>
              </div>
              <div class="flex gap-3">
                <button class="btn-outline text-red-600 border-red-300 hover:bg-red-50" @click="deleteIssue">
                  <i class="fa fa-trash mr-1"></i> 删除问题
                </button>
                <button class="text-blue-600 hover:text-blue-800 font-medium focus:outline-none" @click="closeIssueDetail">
                  <i class="fa fa-times mr-1"></i> 关闭
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2">
                  <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-500 mb-2">问题描述</h4>
                    <div class="text-sm bg-gray-50 p-3 rounded-lg">
                      {{ selectedIssue.description || '无' }}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 class="text-sm font-medium text-gray-500 mb-3">问题信息</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">问题编号</span>
                      <span class="text-sm font-medium">{{ selectedIssue.id }}</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">问题名称</span>
                      <span class="text-sm font-medium">{{ selectedIssue.name }}</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">任务名称</span>
                      <span class="text-sm font-medium">{{ selectedIssue.task_name || '未关联任务' }}</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">绑定小车</span>
                      <span class="text-sm font-medium">{{ selectedIssue.task_car_name || selectedIssue.task_car_id || '未绑定小车' }}</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">出现时间</span>
                      <span class="text-sm font-medium">{{ formatDate(selectedIssue.created_at) }}</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                      <span class="text-sm text-gray-600">更新时间</span>
                      <span class="text-sm font-medium">{{ formatDate(selectedIssue.updated_at) }}</span>
                    </div>
                  </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { issueApi, taskApi } from '@/utils/api'

export default {
  name: 'IssueManagement',
  setup() {
    // 问题数据
    const issues = ref([])
    // 选中的问题
    const selectedIssue = ref(null)
    // 保存提示消息
    const savedMessage = ref('')
    // 任务列表
    const tasks = ref([])
    // 任务映射，用于存储任务信息和绑定的小车信息
    const taskMap = ref({})
    
    // 搜索和筛选状态
    const searchQuery = ref('')
    const showFilterPanel = ref(false)
    const filters = reactive({
      taskId: '',
      taskName: ''
    })
    
    // 显示/隐藏筛选面板
    const toggleFilterPanel = () => {
      showFilterPanel.value = !showFilterPanel.value
    }
    
    // 应用筛选
    const applyFilters = () => {
      fetchIssues(filters.taskId)
      showFilterPanel.value = false
    }
    
    // 重置筛选条件
    const resetFilters = () => {
      filters.taskId = ''
      filters.taskName = ''
      fetchIssues()
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    // 任务缓存，用于存储通过API获取的任务信息
    const taskCache = ref({})
    
    // 根据任务ID获取任务名称
    const getTaskNameById = async (taskId) => {
      if (!taskId) return '-'
      
      // 先从本地tasks数组中查找
      const task = tasks.value.find(task => task.id === taskId)
      if (task) {
        return task.name
      }
      
      // 再从缓存中查找
      if (taskCache.value[taskId]) {
        return taskCache.value[taskId]
      }
      
      // 最后通过API获取
      try {
        const response = await taskApi.getById(taskId)
        const taskData = response.data
        if (taskData && taskData.name) {
          // 缓存任务名称
          taskCache.value[taskId] = taskData.name
          return taskData.name
        }
      } catch (error) {
        console.error(`获取任务${taskId}详情失败:`, error)
      }
      
      return '未知任务'
    }
    
    // 从API获取任务列表
    const fetchTasks = async () => {
      try {
        const response = await taskApi.get()
        const tasksData = response.data || []
        tasks.value = tasksData
        
        // 更新任务缓存
        tasksData.forEach(task => {
          if (task.id && task.name) {
            taskCache.value[task.id] = task.name
          }
        })
      } catch (error) {
        console.error('获取任务列表失败:', error)
      }
    }
    
    // 从API获取问题列表
    const fetchIssues = async (taskId = null) => {
      try {
        // 并行获取问题和任务数据
        const [issuesResponse, tasksResponse] = await Promise.all([
          issueApi.getAll(taskId),
          taskApi.get()
        ])
        
        const issuesData = issuesResponse.data || []
        const taskList = tasksResponse.data || []
        
        // 创建任务ID到任务信息的映射
        const newTaskMap = {}
        taskList.forEach(task => {
          // 获取绑定的小车信息，优先使用executor（参考TaskPlanning.vue的实现），然后是car_id和car_name
          let carId = null
          let carName = null
          
          if (task.executor) {
            // 如果有executor字段（参考TaskPlanning.vue的实现）
            if (typeof task.executor === 'object') {
              // 如果executor是对象，获取id和name
              carId = task.executor.id || null
              carName = task.executor.name || null
            } else {
              // 如果executor是字符串或数字，作为carId
              carId = task.executor
            }
          } else if (task.car_id) {
            // 否则使用car_id
            carId = task.car_id
            carName = task.car_name || null
          }
          
          newTaskMap[task.id] = {
            name: task.name || `任务${task.id}`,
            car_id: carId,
            car_name: carName
          }
        })
        
        // 更新响应式的任务映射
        taskMap.value = newTaskMap
        
        // 更新任务缓存
        taskList.forEach(task => {
          if (task.id && task.name) {
            taskCache.value[task.id] = task.name
          }
        })
        
        // 更新本地任务列表
        tasks.value = taskList
        
        // 为每个问题添加任务名称和小车信息
        const issuesWithTaskInfo = issuesData.map(issue => {
          const taskInfo = issue.task_id ? taskMap.value[issue.task_id] : null
          return {
            ...issue,
            task_name: taskInfo ? taskInfo.name : '-',
            task_car_id: taskInfo ? taskInfo.car_id : null,
            task_car_name: taskInfo ? taskInfo.car_name : null
          }
        })
        
        issues.value = issuesWithTaskInfo
      } catch (error) {
        console.error('获取问题列表失败:', error)
        savedMessage.value = '获取问题列表失败，请重试'
        setTimeout(() => savedMessage.value = '', 2000)
      }
    }

    // 组件挂载时获取问题数据
    onMounted(async () => {
      await fetchIssues()
    })
    
    // 过滤后的问题列表
    const filteredIssues = computed(() => {
      return issues.value.filter(issue => {
        // 首先过滤掉null和undefined的issue
        if (!issue) return false
        
        // 搜索过滤
        const matchesSearch = searchQuery.value === '' || 
          String(issue.id).includes(searchQuery.value) ||
          (issue.name && issue.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (issue.description && issue.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (issue.task_id && String(issue.task_id).includes(searchQuery.value)) ||
          (issue.task_name && issue.task_name.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        // 任务名称筛选
        const matchesTaskName = filters.taskName === '' || 
          (issue.task_name && issue.task_name.toLowerCase().includes(filters.taskName.toLowerCase()))
        
        return matchesSearch && matchesTaskName
      })
    })

    // 选择问题
    const selectIssue = (issue) => {
      // 确保问题有任务信息，特别是绑定的小车信息
      if (issue.task_id) {
        const taskInfo = taskMap.value[issue.task_id]
        if (taskInfo) {
          issue.task_name = taskInfo.name
          issue.task_car_id = taskInfo.car_id
          issue.task_car_name = taskInfo.car_name
        }
      }
      selectedIssue.value = issue
    }

    // 关闭问题详情
    const closeIssueDetail = () => {
      selectedIssue.value = null
    }

    // 删除问题
    const deleteIssue = async () => {
      if (!selectedIssue.value) {
        savedMessage.value = '请先选择一个问题'
        setTimeout(() => savedMessage.value = '', 2000)
        return
      }
      
      if (confirm('确定要删除这个问题吗？')) {
        try {
          // 调用API删除问题
          await issueApi.delete(selectedIssue.value.id)
          // 更新本地数据
          const issueIndex = issues.value.findIndex(i => i.id === selectedIssue.value.id)
          if (issueIndex !== -1) {
            issues.value.splice(issueIndex, 1)
            // 关闭详情窗口
            selectedIssue.value = null
          }
          savedMessage.value = '问题已删除'
          setTimeout(() => savedMessage.value = '', 2000)
        } catch (error) {
          console.error('删除问题失败:', error)
          savedMessage.value = '删除失败，请重试'
          setTimeout(() => savedMessage.value = '', 2000)
        }
      }
    }

    return {
      issues,
      selectedIssue,
      savedMessage,
      searchQuery,
      showFilterPanel,
      filters,
      filteredIssues,
      toggleFilterPanel,
      applyFilters,
      resetFilters,
      selectIssue,
      deleteIssue,
      closeIssueDetail,
      formatDate,
      getTaskNameById,
      tasks,
      taskMap
    }
  }
}
</script>

<style scoped>
#issue-page {
  height: 100%;
  width: 100%;
}
</style>

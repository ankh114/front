﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="page-content" id="task-page">

    <!-- 保存成功消息 -->
    <div v-if="savedMessage" class="saved-message">
      {{ savedMessage }}
    </div>
    <div class="h-full flex flex-col">
      <!-- 页面标题和操作区 -->
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-bold">任务规划与调度</h2>
        <div class="flex gap-2">
          <button class="btn-primary text-sm px-4 py-2" @click="showNewTaskModal = true">
            <i class="fa fa-plus mr-1"></i> 新建任务
          </button>
        </div>
      </div>
      
      <!-- 统计卡片 -->
      <div class="p-4 bg-white border-b">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-600 font-medium">总任务数</p>
                <p class="text-2xl font-bold text-blue-800 mt-1">{{ tasks.length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fa fa-tasks text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 border border-green-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-green-600 font-medium">执行中</p>
                <p class="text-2xl font-bold text-green-800 mt-1">{{ tasks.filter(t => t.status === '执行中').length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <i class="fa fa-play-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-yellow-600 font-medium">待处理</p>
                <p class="text-2xl font-bold text-yellow-800 mt-1">{{ tasks.filter(t => t.status === '待处理' || t.status === '已定时').length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <i class="fa fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-purple-600 font-medium">已完成</p>
                <p class="text-2xl font-bold text-purple-800 mt-1">{{ tasks.filter(t => t.status === '已完成').length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <i class="fa fa-check-circle text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--管理内容区 -->
      <div class="flex-1 overflow-hidden">
        <!-- 任务列表视图 -->
        <div v-if="!selectedTask" class="h-full flex flex-col">
          <div class="p-4 bg-gray-50 border-b">
            <div class="relative">
              <select v-model="filterStatus" class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white shadow-sm">
                <option value="">所有任务</option>
                <option value="进行中">进行中</option>
                <option value="待执行">待执行</option>
                <option value="已完成">已完成</option>
                <option value="已取消">已取消</option>
              </select>
              <i class="fa fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div class="flex-1 overflow-x-auto overflow-y-auto">
            <!-- 确保表格有足够的宽度来显示所有列 -->
            <table class="w-full border-collapse min-w-[520px]">
              <thead>
                <tr class="bg-primary text-white">
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[120px]">任务名称</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[90px]">执行小车</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[80px]">任务类型</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[60px]">状态</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[280px]">时间</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider min-w-[80px]">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 whitespace-nowrap">
                <tr 
                  v-for="task in filteredTasks" 
                  :key="task.id"
                  :class="[
                    'cursor-pointer hover:bg-primary/5 transition-all duration-200',
                    selectedTask && selectedTask.id === task.id ? 'bg-primary/10 ring-2 ring-primary/30' : '',
                    task.status === '执行中' && (!selectedTask || selectedTask.id !== task.id) ? 'bg-green-50 !important' : '',
                    (task.status === '待处理' || task.status === '已定时') && (!selectedTask || selectedTask.id !== task.id) ? 'bg-blue-50 !important' : '',
                    task.status === '已完成' && (!selectedTask || selectedTask.id !== task.id) ? 'bg-gray-50 !important' : '',
                    (task.status === '已取消' || task.status === '失败') && (!selectedTask || selectedTask.id !== task.id) ? 'bg-orange-50 !important' : '',
                    task.status === '暂停中' && (!selectedTask || selectedTask.id !== task.id) ? 'bg-yellow-50 !important' : ''
                  ]"
                  @click="selectTask(task)"
                >
                  <td class="px-6 py-4 text-sm font-medium text-gray-800 min-w-[120px] whitespace-nowrap">
                    {{ task.name }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 min-w-[90px] whitespace-nowrap">
                    {{ task.carName || task.boundDevice || '未设置' }}
                  </td>
                  <td class="px-6 py-4 text-sm min-w-[80px] whitespace-nowrap">
                    <span :class="{
                      'text-purple-600 font-semibold': task.is_scheduled,
                      'text-gray-600 font-semibold': !task.is_scheduled
                    }">
                      {{ task.is_scheduled ? '定时任务' : '普通任务' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm min-w-[60px] whitespace-nowrap">
                    <span :class="{
                      'text-green-600 font-semibold': task.status === '执行中',
                      'text-blue-600 font-semibold': task.status === '待处理' || task.status === '已定时',
                      'text-gray-600 font-semibold': task.status === '已完成',
                      'text-orange-600 font-semibold': task.status === '已取消' || task.status === '失败',
                      'text-yellow-600 font-semibold': task.status === '暂停中'
                    }">
                      {{ task.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 min-w-[280px] whitespace-nowrap">
                    {{ task.startTime }}-{{ task.endTime }}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap">

                    <button 
                      class="text-blue-600 hover:text-blue-800 focus:outline-none mr-3"
                      @click.stop="showTaskPath(task)"
                      title="显示路径"
                    >
                      <i class="fa fa-map-marker"></i>
                    </button>
                    <button 
                      class="text-red-600 hover:text-red-800 focus:outline-none"
                      @click.stop="deleteTask(task)"
                      title="删除任务"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 任务详情视图 -->
        <div v-else class="h-full flex flex-col">
          <!-- 任务详情头部 -->
          <div class="bg-white border-b p-4 flex items-center justify-between">
            <div class="flex items-center">
              <button class="btn-outline text-sm px-4 py-2 mr-4" @click="deselectTask">
                <i class="fa fa-arrow-left mr-1"></i> 返回任务列表
              </button>
              <h3 class="text-lg font-medium">{{ selectedTask.name }}</h3>
              <span :class="{
                'ml-3 px-3 py-1 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': selectedTask.status === '执行中',
                'bg-blue-100 text-blue-800': selectedTask.status === '待处理' || selectedTask.status === '已定时',
                'bg-gray-100 text-gray-800': selectedTask.status === '已完成',
                'bg-orange-100 text-orange-800': selectedTask.status === '已取消' || selectedTask.status === '失败',
                'bg-yellow-100 text-yellow-800': selectedTask.status === '暂停中'
              }">
                {{ selectedTask.status }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn-outline text-sm px-4 py-2" @click="startTask">
                <i class="fa fa-play mr-1"></i> 开始任务
              </button>
              <button class="btn-outline text-sm px-4 py-2" @click="togglePauseResume">
                <i class="fa fa-pause mr-1" v-if="selectedTask.status === '执行中'"></i>
                <i class="fa fa-play-circle mr-1" v-else-if="selectedTask.status === '暂停中'"></i>
                {{ selectedTask.status === '执行中' ? '暂停任务' : '继续任务' }}
              </button>
              <button class="btn-outline text-sm px-4 py-2" @click="completeTask">
                <i class="fa fa-check-circle mr-1"></i> 完成任务
             
              </button>

            </div>
          </div>
          
          <!-- 路径规划工具栏 -->
          <div class="bg-white border-b p-2 flex items-center gap-2">
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('point')">
              <i class="fa fa-mouse-pointer mr-1"></i> 点选模式
            </button>
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('polygon')">
              <i class="fa fa-arrows mr-1"></i> 多边形模式
            </button>
            <button class="btn-outline text-sm px-4 py-2" @click="setPathMode('clear')">
              <i class="fa fa-trash mr-1"></i> 清除路径
            </button>
            <button class="btn-primary text-sm px-4 py-2" @click="showCurrentTaskPath">
              <i class="fa fa-map-marker mr-1"></i> 显示路径
            </button>
            <button class="btn-primary text-sm px-4 py-2" @click="savePath">
              <i class="fa fa-save mr-1"></i> 保存路径
            </button>
            <button class="btn-primary text-sm px-4 py-2" @click="sendTask">
              <i class="fa fa-paper-plane mr-1"></i> 下发任务
            </button>
          </div>
          
          <!-- 左右布局容器 -->
          <div class="flex-1 flex overflow-hidden">
            <!-- 左侧地图区域 -->
            <div class="flex-1 overflow-hidden" id="task-map-container"></div>
            
            <!-- 右侧任务参数区域 -->
            <div class="w-80 bg-white border-l p-4 overflow-y-auto">
              <!-- 路径点顺序 -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 class="font-medium mb-3">路径点顺序</h3>
                <div v-if="waypoints.length > 0 || polygonPoints.length > 0">
                  <div v-for="(point, index) in isDrawingPolygon ? polygonPoints : waypoints" :key="index" class="mb-3 bg-white p-3 rounded-lg shadow-sm">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-medium text-primary">{{ isDrawingPolygon ? '顶点' : '路径点' }} {{ index + 1 }}</span>
                      <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {{ index === 0 ? '起点' : (isDrawingPolygon ? '顶点' : (index === (isDrawingPolygon ? polygonPoints : waypoints).length - 1 ? '终点' : '途经点')) }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      <div class="flex justify-between">
                        <span>X坐标:</span>
                        <span>{{ point?.lon === null || point?.lon === undefined || isNaN(Number(point?.lon)) ? '0.00' : Number(point?.lon || 0).toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Y坐标:</span>
                        <span>{{ point?.lat === null || point?.lat === undefined || isNaN(Number(point?.lat)) ? '0.00' : Number(point?.lat || 0).toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-gray-500 py-4">
                  点击地图添加路径点
                </div>
              </div>
              
              <!-- 小车实时数据 -->
              <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium">小车实时数据</h3>
                  <div class="text-xs text-gray-600">
                    当前执行：{{ selectedTask.carName || selectedTask.deviceName || selectedTask.carId || selectedTask.deviceId || '未知' }}
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div class="text-xs text-green-600 mb-1">电量</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-battery-three-quarters text-green-600"></i>
                      <span class="font-medium">{{ isNaN(currentTaskCarStatus.battery) ? 'NaN' : currentTaskCarStatus.battery }}%</span>
                      <div class="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 rounded-full" :style="{ width: `${isNaN(currentTaskCarStatus.battery) ? 0 : currentTaskCarStatus.battery}%` }"></div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div class="text-xs text-blue-600 mb-1">速度</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-tachometer text-blue-600"></i>
                      <span class="font-medium">{{ currentTaskCarStatus.speed === null || currentTaskCarStatus.speed === undefined || isNaN(Number(currentTaskCarStatus.speed)) ? 'NaN' : Number(currentTaskCarStatus.speed).toFixed(1) }} m/s</span>
                    </div>
                  </div>
                  <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div class="text-xs text-yellow-600 mb-1">温度</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-thermometer-half text-yellow-600"></i>
                      <span class="font-medium">{{ currentTaskCarStatus.temperature === null || currentTaskCarStatus.temperature === undefined || isNaN(Number(currentTaskCarStatus.temperature)) ? 'NaN' : Number(currentTaskCarStatus.temperature).toFixed(1) }}°C</span>
                    </div>
                  </div>
                  <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <div class="text-xs text-purple-600 mb-1">信号</div>
                    <div class="flex items-center gap-2">
                      <i class="fa fa-signal text-purple-600"></i>
                      <span class="font-medium">{{ isNaN(currentTaskCarStatus.signal) ? 'NaN' : currentTaskCarStatus.signal }}%</span>
                      <div class="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${isNaN(currentTaskCarStatus.signal) ? 0 : currentTaskCarStatus.signal}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div class="text-xs text-gray-600 mb-1">坐标</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-sm">
                      <span class="text-gray-500">经度:</span> {{ carRealTimeData.longitude === null || carRealTimeData.longitude === undefined || isNaN(Number(carRealTimeData.longitude)) ? 'NaN' : Number(carRealTimeData.longitude).toFixed(6) }}
                    </div>
                    <div class="text-sm">
                      <span class="text-gray-500">纬度:</span> {{ carRealTimeData.latitude === null || carRealTimeData.latitude === undefined || isNaN(Number(carRealTimeData.latitude)) ? 'NaN' : Number(carRealTimeData.latitude).toFixed(6) }}
                    </div>
                  </div>
                </div>
                <div class="mt-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div class="text-xs text-orange-600 mb-1">车辆状态</div>
                  <div class="flex items-center gap-2">
                    <i class="fa fa-car text-orange-600"></i>
                    <span class="font-medium">
                      {{ 
                         carRealTimeData.car_status === 0 ? '待机' : 
                         carRealTimeData.car_status === 1 ? '充电执行中' : 
                         carRealTimeData.car_status === 2 ? '任务执行中' : 
                         carRealTimeData.car_status === 3 ? '任务完成返回中' : 
                         carRealTimeData.car_status === 4 ? '异常状态' : '未知' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-between items-start mt-6 mb-3">
              <h3 class="font-medium">任务参数设置</h3>
              <div class="flex flex-col gap-2">
                <button v-if="selectedTask?.is_scheduled" class="btn-outline text-sm px-4 py-1.5 text-red-600 border-red-300 hover:bg-red-50" @click="unbindCar">
                  <i class="fa fa-unlink mr-1"></i> 解绑小车
                </button>
                <button class="btn-primary text-sm px-4 py-1.5" @click="saveTaskParams">
                  <i class="fa fa-save mr-1"></i> 保存修改
                </button>
              </div>
            </div>
            
            <!-- 定时任务时间设置 -->
            <div v-if="selectedTask?.is_scheduled" class="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
              <h4 class="font-medium text-blue-800 mb-3">定时任务时间</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">开始时间</label>
                  <div class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {{ selectedTask.scheduledStart || '未设置' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">结束时间</label>
                  <div class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {{ selectedTask.scheduledEnd || '未设置' }}
                  </div>
                </div>
              </div>
            </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">任务名称</label>
                  <input type="text" v-model="selectedTask.name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                </div>
                
                <div>
                  <label class="block text-xs text-gray-500 mb-1">巡检模式</label>
                  <select v-model="selectedTask.inspectionMode" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>快速巡检</option>
                    <option>精细巡检</option>
                    <option>重点区域巡检</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs text-gray-500 mb-1">移动速度</label>
                  <select v-model="selectedTask.speed" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>低速 (0.5m/s)</option>
                    <option>中速 (1.0m/s)</option>
                    <option>高速 (1.5m/s)</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs text-gray-500 mb-1">传感器配置</label>
                  <select v-model="selectedTask.sensorConfig" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>全传感器开启</option>
                    <option>仅雷达</option>
                    <option>仅摄像头</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs text-gray-500 mb-1">任务描述</label>
                  <textarea v-model="selectedTask.description" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" placeholder="输入任务描述..."></textarea>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 确认保存路径模态框 -->
  <Transition name="modal">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style="z-index: 9999;" v-if="showConfirmModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b relative">
          <h3 class="text-lg font-bold">确认保存路径</h3>
          <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" @click="showConfirmModal = false">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <p class="mb-4">确定要保存当前路径吗？</p>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">任务绑定小车</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {{ selectedTask?.carName || '未绑定小车' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">小车状态</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {{ carRealTimeData.car_status === 0 ? '待机' : 
                   carRealTimeData.car_status === 1 ? '充电执行中' : 
                   carRealTimeData.car_status === 2 ? '任务执行中' : 
                   carRealTimeData.car_status === 3 ? '任务完成返回中' : 
                   carRealTimeData.car_status === 4 ? '异常状态' : '未知' }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">路径点数量</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {{ getActivePathPoints().points.length }} 个
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" @click="showConfirmModal = false">
            取消
          </button>
          <button class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" @click="sendPathToBackend">
            <i class="fa fa-save mr-1"></i> 保存路径
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- 确认下发任务模态框 -->
  <Transition name="modal">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style="z-index: 9999;" v-if="showSendTaskModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-6 border-b relative">
          <h3 class="text-lg font-bold">确认任务下发</h3>
          <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" @click="showSendTaskModal = false">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <p class="mb-4">确定要下发当前任务吗？</p>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">任务绑定小车</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {{ selectedTask?.carName || '未绑定小车' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">小车状态</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {{ carRealTimeData.car_status === 0 ? '待机' : 
                   carRealTimeData.car_status === 1 ? '充电执行中' : 
                   carRealTimeData.car_status === 2 ? '任务执行中' : 
                   carRealTimeData.car_status === 3 ? '任务完成返回中' : 
                   carRealTimeData.car_status === 4 ? '异常状态' : '未知' }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">路径点数量</label>
              <div class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {{ getActivePathPoints().points.length }} 个
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" @click="showSendTaskModal = false">
            取消
          </button>
          <button class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" @click="sendTaskToBackend">
            <i class="fa fa-paper-plane mr-1"></i> 下发任务
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- 新建任务弹窗 -->
  <Transition name="modal">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" v-if="showNewTaskModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold">新建任务</h3>
          <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" @click="closeNewTaskModal">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">任务名称</label>
              <input type="text" v-model="newTaskForm.name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="输入任务名称">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">执行小车</label>
              <select v-model="newTaskForm.carId" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option value="" disabled selected>选择小车</option>
                <option v-for="car in props.cars" :key="car.id" :value="car.id">
                  {{ car.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">选择地图</label>
              <select v-model="newTaskForm.mapId" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" @change="onMapChange">
                <option value="" disabled selected>选择地图...</option>
                <option v-for="map in props.maps" :key="map.id" :value="map.id">
                  {{ map.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">是否定时任务</label>
              <select v-model="newTaskForm.isScheduled" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </div>
            
            <div v-if="newTaskForm.isScheduled">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
              <input type="time" v-model="newTaskForm.scheduledStart" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
            </div>
            
            <div v-if="newTaskForm.isScheduled">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">结束时间</label>
              <input type="time" v-model="newTaskForm.scheduledEnd" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
            </div>
          </div>
          
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
            <textarea v-model="newTaskForm.description" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-24 resize-y" placeholder="输入任务描述..."></textarea>
          </div>
        </div>
        
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors" @click="closeNewTaskModal">
            取消
          </button>
          <button class="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" @click="createNewTask">
            创建任务
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 任务地图查看模态框 -->
  <Transition name="modal">
    <div v-if="showTaskMapModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <!-- 模态框头部 -->
        <div class="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-medium">{{ viewedTask?.name }} - 任务地图</h3>
          <button class="text-white hover:text-gray-200 focus:outline-none" @click="closeTaskMap">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>

        <!-- 模态框内容 -->
        <div class="flex h-[calc(90vh-64px)] overflow-hidden">
          <!-- 地图区域 -->
          <div class="flex-1">
            <div id="task-map-view-container" class="w-full h-full"></div>
          </div>

          <!-- 路径点列表 -->
          <div class="w-80 bg-gray-50 p-4 overflow-y-auto">
            <h4 class="text-md font-medium mb-4">路径点顺序</h4>
            <div v-if="viewedTask?.path && viewedTask.path.length > 0">
              <div v-for="(point, index) in viewedTask.path" :key="index" class="mb-3 bg-white p-3 rounded-lg shadow-sm">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-primary">路径点 {{ index + 1 }}</span>
                  <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {{ index === 0 ? '起点' : index === viewedTask.path.length - 1 ? '终点' : '途经点' }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>纬度:</span>
                    <span>{{ point?.lat === null || point?.lat === undefined || isNaN(Number(point?.lat)) ? '0.000000' : Number(point?.lat || 0).toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>经度:</span>
                    <span>{{ (point?.lng || point?.lon) === null || (point?.lng || point?.lon) === undefined || isNaN(Number(point?.lng || point?.lon)) ? '0.000000' : Number((point?.lng || point?.lon) || 0).toFixed(6) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 text-center py-6">
              该任务暂无路径点
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { taskApi, missionApi, pathApi, scheduleApi } from '../utils/api.js'
import { getWebSocketUrl } from '../utils/config.js'
import axios from 'axios'

// 全局任务路径点缓存，用于持久化存储路径点数据
// 确保路径点数据在组件挂载/卸载期间不会丢失
const taskPathCache = reactive({})

// 添加axios取消令牌
const cancelTokenSource = ref(axios.CancelToken.source())

// 任务状态映射 - 完成或取消的状态将导致路径点被移除
const completedOrCancelledStatus = ['已完成', '已取消', '故障']

// 接收从父组件传递的数据
const props = defineProps({
  maps: {
    type: Array,
    default: () => []
  },
  cars: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  },
  autoOpenNewTask: {
    type: Boolean,
    default: false
  },
  selectedTaskId: {
    type: [Number, String, null],
    default: null
  },
  carsStatus: {
    type: Map,
    default: () => new Map()
  }
})

// 定义事件
const emit = defineEmits(['new-task-closed'])

// 监听autoOpenNewTask属性，自动打开新建任务模态框
watch(() => props.autoOpenNewTask, (newVal) => {
  if (newVal) {
    showNewTaskModal.value = true
  }
})

// 监听selectedTaskId属性，自动显示对应的任务详情
watch(() => props.selectedTaskId, async (newVal) => {
  if (newVal) {
    // console.log('Selected task ID changed:', newVal)
    // 等待组件挂载
    await nextTick()
    // 查找对应的任务
    const task = tasks.value.find(t => t.id === newVal)
    if (task) {
      // console.log('Found task:', task)
      // 显示任务详情
      selectedTask.value = task
      showTaskDetails.value = true
      // 加载任务路径
      await showCurrentTaskPath()
    } else {
      console.error('Task not found with ID:', newVal)
    }
  }
}, { immediate: true })

let viewer = null
let carMarker = null
let viewCarMarker = null

// 状态管理
const selectedTask = ref(null)
const showTaskDetails = ref(false)
const savedMessage = ref('')
const showNewTaskModal = ref(false)
const filterStatus = ref('')
const tasks = ref([])

// 路径规划相关状态
const waypoints = ref([])
const pathLayer = ref(null)
const isDrawingPath = ref(false)
const isDrawingPolygon = ref(false)
const polygonPoints = ref([])
const isSending = ref(false)
const showConfirmModal = ref(false)
const showSendTaskModal = ref(false)
const selectedCar = ref(null)

// 小车实时数据
const carRealTimeData = ref({
  battery: NaN,
  speed: NaN,
  temperature: NaN,
  signal: NaN,
  longitude: NaN,
  latitude: NaN,
  car_status: 0
})

// websocket连接状态
const websocket = ref(null)
const isWebSocketConnected = ref(false)
const filteredTasks = computed(() => {
  if (!filterStatus.value) return tasks.value.filter(task => task) // 过滤掉null和undefined的task
  return tasks.value.filter(task => task && task.status === filterStatus.value) // 过滤掉null和undefined的task
})

// 新建任务表单数据
const newTaskForm = reactive({
  name: '',
  carId: null,
  mapId: null,
  mapPreviewUrl: null,
  description: '',
  locationId: null,
  isScheduled: false,
  scheduledStart: null,
  scheduledEnd: null
})

// 关闭新建任务模态框
const closeNewTaskModal = () => {
  showNewTaskModal.value = false
  emit('new-task-closed')
}

// 地图选择变化处理
const onMapChange = () => {
  if (newTaskForm.mapId) {
    // 确保使用map.id来查找选中的地图
    const selectedMap = props.maps.find(map => map.id == newTaskForm.mapId)
    if (selectedMap) {
      newTaskForm.mapPreviewUrl = selectedMap.preview_url || null
      // console.log('Selected map preview URL:', newTaskForm.mapPreviewUrl)
    }
  }
}

// 状态映射 - 后端数字状态到前端中文状态
const statusMap = {
  0: '待处理',
  1: '已定时',
  2: '执行中',
  3: '已完成',
  4: '失败',
  5: '已取消',
  6: '暂停中'
}

// 小车状态映射 - 后端数字状态到前端中文状态
const carStatusMap = {
  0: '待机',
  1: '充电执行中',
  2: '任务执行中',
  3: '任务完成返回中',
  4: '异常状态'
}

// 状态映射 - 前端中文状态到后端数字状态
const reverseStatusMap = {
  '待处理': 0,
  '已定时': 1,
  '执行中': 2,
  '已完成': 3,
  '失败': 4,
  '已取消': 5,
  '暂停中': 6
}

// 更新任务路径点缓存
const updateTaskPathCache = (task) => {
  // 检查任务状态
  const status = statusMap[task.status] || task.status
  
  if (completedOrCancelledStatus.includes(status)) {
    // 如果任务已完成、取消或故障，移除路径点缓存
    if (taskPathCache[task.id]) {
      // console.log(`任务 ${task.id} 已完成/取消/故障，移除路径点缓存`)
      delete taskPathCache[task.id]
    }
  } else {
    // 否则，缓存路径点数据
    // 尝试从不同的字段获取路径点
    let path = []
    
    // 1. 从task.path获取
    if (task.path) {
      path = Array.isArray(task.path) ? task.path : []
    }
    
    // 2. 从task.paths获取
    if (task.paths && Array.isArray(task.paths) && task.paths.length > 0) {
      const firstPath = task.paths[0]
      if (firstPath.waypoints && Array.isArray(firstPath.waypoints)) {
        path = firstPath.waypoints
      }
    }
    
    // 3. 从task.currentPath获取
    if (task.currentPath && Array.isArray(task.currentPath)) {
      path = task.currentPath
    }
    
    // 如果有路径点，更新缓存
    if (path.length > 0) {
      // console.log(`更新任务 ${task.id} 的路径点缓存，共 ${path.length} 个点`)
      taskPathCache[task.id] = path
    }
  }
}

// 将后端任务转换为前端显示格式
const convertBackendTaskToFrontend = (task) => {
  // 更新路径点缓存
  updateTaskPathCache(task)
  
  // 从缓存中获取最新的路径点数据
  let path = taskPathCache[task.id] || []
  
  // 如果缓存中没有，尝试从任务数据中获取
  if (path.length === 0) {
    // 1. 从task.path获取
    if (task.path) {
      path = Array.isArray(task.path) ? task.path : []
      // console.log('从task.path获取路径数据，共', path.length, '个点')
    }
    
    // 2. 从task.paths获取
    if (task.paths && Array.isArray(task.paths) && task.paths.length > 0) {
      const firstPath = task.paths[0]
      if (firstPath.waypoints && Array.isArray(firstPath.waypoints)) {
        path = firstPath.waypoints
        // console.log('从task.paths获取路径数据，共', path.length, '个点')
      }
    }
    
    // 3. 从task.currentPath获取
    if (task.currentPath && Array.isArray(task.currentPath)) {
      path = task.currentPath
      // console.log('从task.currentPath获取路径数据，共', path.length, '个点')
    }
    
    // 4. 从task.path_info获取
    if (task.path_info) {
      if (Array.isArray(task.path_info)) {
        path = task.path_info
        // console.log('从task.path_info获取路径数据，共', path.length, '个点')
      } else if (task.path_info.waypoints && Array.isArray(task.path_info.waypoints)) {
        path = task.path_info.waypoints
        // console.log('从task.path_info.waypoints获取路径数据，共', path.length, '个点')
      }
      // 保存path_id，如果存在的话
      if (task.path_info.id) {
        // console.log('从task.path_info获取到path_id:', task.path_info.id)
      }
    }
  }
  
  // 从executor属性中提取小车信息
  let carId = task.car_id || task.deviceId
  let carName = task.car_name || task.device_name || ''
  let carStatus = carStatusMap[task.car_status] || ''
  let boundDevice = task.bound_device || ''
  
  // 如果有executor属性（从getById接口返回的数据），则使用executor中的信息
  if (task.executor) {
    carId = task.executor.id
    carName = task.executor.name
    carStatus = carStatusMap[task.executor.status] || ''
    
    // 从executor的devices属性中提取绑定的设备信息
    if (task.executor.devices && task.executor.devices.length > 0) {
      boundDevice = task.executor.devices.map(device => device.name).join(', ')
    }
  }
  
  // 构建返回的任务对象
  const result = {
    ...task,
    status: statusMap[task.status] || task.status,
    path: path,
    // 添加小车信息
    carId: carId,
    carName: carName,
    carStatus: carStatus,
    boundDevice: boundDevice,
    // 添加地图预览URL
    map_preview_url: task.map_preview_url || task.mapPreviewUrl || null,
    // 添加定时任务时间信息
    scheduledStart: task.scheduled_start || task.scheduledStart || null,
    scheduledEnd: task.scheduled_end || task.scheduledEnd || null
  }
  
  // 确保path_id字段能正确保存
  if (task.path_id) {
    result.path_id = task.path_id
    // console.log('任务包含path_id:', task.path_id)
  } else if (task.path_info && task.path_info.id) {
    result.path_id = task.path_info.id
    // console.log('从path_info.id设置path_id:', task.path_info.id)
  }
  
  // console.log('转换后的任务数据:', result)
  return result
}

// 将前端任务转换为后端格式
const convertFrontendTaskToBackend = (task) => {
  return {
    ...task,
    car_id: task.carId || task.deviceId, // 确保后端能识别车辆ID
    status: reverseStatusMap[task.status] || task.status
  }
}

// 任务数据缓存
const taskCache = ref({})
const cacheExpiry = ref(0)
const CACHE_DURATION = 60000 // 缓存1分钟

// 获取任务列表
const fetchTasks = async () => {
  // 检查缓存是否有效
  const now = Date.now()
  if (now < cacheExpiry.value && Object.keys(taskCache.value).length > 0) {
    // console.log('使用缓存的任务数据')
    tasks.value = Object.values(taskCache.value)
    return
  }
  
  try {
    const response = await taskApi.get()
    const data = response.data || []
    
    // 将后端任务转换为前端格式
    const convertedTasks = data.map(task => {
      const convertedTask = convertBackendTaskToFrontend(task)
      // 添加任务类型，默认是普通任务
      convertedTask.taskType = task.is_scheduled ? '定时任务' : '普通任务'
      return convertedTask
    })
    
    tasks.value = convertedTasks
    
    // 更新缓存
    taskCache.value = {}
    convertedTasks.forEach(task => {
      taskCache.value[task.id] = task
    })
    cacheExpiry.value = now + CACHE_DURATION
    // console.log('任务数据已缓存')
    
  } catch (error) {
    if (axios.isCancel(error)) {
      // console.log('请求已取消:', error.message)
      return
    }
    console.error('获取任务列表失败:', error)
    savedMessage.value = '获取任务列表失败，请重试'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// WebSocket连接防抖计时器
let wsChangeTimeout = null

// 地图初始化计时器和组件挂载状态
let mapInitTimeout = null
const isMounted = ref(true)

// 任务地图查看相关变量
const showTaskMapModal = ref(false)
const viewedTask = ref(null)
const taskMapViewer = ref(null)

// 设备状态到小车状态的映射
const executorStatusToCarStatusMap = {
  'available': 0,  // 可用 → 待机
  'busy': 2,       // 繁忙 → 任务执行中
  'unavailable': 4 // 不可用 → 异常状态
}

// 状态值处理函数 - 统一处理字符串和数字状态
const getStatusValue = (status) => {
  if (status === undefined || status === null || status === '') {
    return undefined
  }
  
  // 如果是数字，直接返回
  if (typeof status === 'number') {
    return status
  }
  
  // 如果是字符串，使用映射表转换
  if (typeof status === 'string') {
    return executorStatusToCarStatusMap[status] || undefined
  }
  
  return undefined
}

// 小车状态标签
const carStatusLabels = {
  0: '待机',
  1: '充电执行中',
  2: '任务执行中',
  3: '任务完成返回中',
  4: '异常状态'
}

// 小车状态样式
const carStatusStyles = {
  0: 'bg-green-100 text-green-800',  // 待机
  1: 'bg-blue-100 text-blue-800',    // 充电执行中
  2: 'bg-orange-100 text-orange-800', // 任务执行中
  3: 'bg-purple-100 text-purple-800', // 任务完成返回中
  4: 'bg-red-100 text-red-800'       // 异常状态
}

// 获取绑定的设备信息


// 连接到websocket服务器
const connectWebSocket = (carId) => {
  // 如果已经有连接，先断开
  if (websocket.value) {
    disconnectWebSocket()
  }
  
  try {
    // 创建websocket连接 - 使用与后端一致的路径
    const wsUrl = getWebSocketUrl(carId)
    websocket.value = new WebSocket(wsUrl)
    
    // 连接成功
    websocket.value.onopen = () => {
      isWebSocketConnected.value = true
    }
    
    // 接收消息
    websocket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // 检查是否是小车实时数据（根据后端返回格式）
        if (data.battery !== undefined || (data.car_id && data.reported_at)) {
          // 直接更新小车实时数据，不再使用type字段判断
          carRealTimeData.value = {
            battery: data.battery !== undefined ? data.battery : NaN,
            speed: data.speed !== undefined ? data.speed : NaN,
            temperature: data.temperature !== undefined ? data.temperature : NaN,
            signal: data.signal !== undefined ? data.signal : NaN,
            longitude: data.longitude !== undefined ? data.longitude : NaN,
            latitude: data.latitude !== undefined ? data.latitude : NaN,
            car_status: data.car_status !== undefined ? data.car_status : 0
          }
          
          // 更新小车位置标记
          if (data.longitude && data.latitude) {
            const carPoint = [data.latitude, data.longitude] // Leaflet使用[纬度, 经度]格式
            
            // 对于SLAM地图，我们直接使用小车的坐标作为地图坐标
            const carPosition = {
              x: data.longitude,
              y: data.latitude,
              angle: data.angle || 0 // 如果消息中包含方向信息，使用它，否则默认为0
            }
            
            // 更新SLAM地图查看器上的小车位置
            if (viewer && viewer.contentWindow && viewer.contentWindow.SlamMapViewer) {
              viewer.contentWindow.SlamMapViewer.setCarPosition(carPosition)
            }
            
            // 更新查看任务时的SLAM地图查看器上的小车位置
            if (taskMapViewer.value && taskMapViewer.value.contentWindow && taskMapViewer.value.contentWindow.SlamMapViewer) {
              taskMapViewer.value.contentWindow.SlamMapViewer.setCarPosition(carPosition)
            }
            
            // 更新编辑任务时的小车标记（Leaflet地图）
            if (viewer && typeof window.L !== 'undefined' && viewer.removeLayer) {
              updateCarMarker(viewer, carPoint, carMarker)
              carMarker = window.L.marker(carPoint, { icon: createCarIcon() }).addTo(viewer)
            }
            
            // 更新查看任务时的小车标记（Leaflet地图）
            if (taskMapViewer.value && typeof window.L !== 'undefined' && taskMapViewer.value.removeLayer) {
              updateCarMarker(taskMapViewer.value, carPoint, viewCarMarker)
              viewCarMarker = window.L.marker(carPoint, { icon: createCarIcon() }).addTo(taskMapViewer.value)
            }
          }
        } 
        // 处理路径更新消息（如果有）
        else if (data.type === 'path_update' && data.task_id && data.path) {
          // 更新任务路径点缓存
          taskPathCache[data.task_id] = data.path
          
          // 更新本地任务列表中的路径点
          const taskIndex = tasks.value.findIndex(task => task.id === data.task_id)
          if (taskIndex !== -1) {
            tasks.value[taskIndex].path = data.path
          }
        } 
        // 处理任务状态更新（如果有）
        else if (data.type === 'task_status_update' && data.task_id) {
          // 更新任务状态
          const taskIndex = tasks.value.findIndex(task => task.id === data.task_id)
          if (taskIndex !== -1) {
            // 更新任务状态
            tasks.value[taskIndex].status = data.status
            
            // 更新路径点缓存
            updateTaskPathCache(tasks.value[taskIndex])
            
            // 如果任务已完成或取消，清除本地路径点
            if (completedOrCancelledStatus.includes(data.status)) {
              tasks.value[taskIndex].path = []
            }
          }
        }
      } catch (error) {
        // 忽略WebSocket消息解析错误，避免影响页面性能
      }
    }
    
    // 连接关闭
    websocket.value.onclose = () => {
      isWebSocketConnected.value = false
    }
    
    // 连接错误
    websocket.value.onerror = () => {
      isWebSocketConnected.value = false
    }
    
  } catch (error) {
    // 忽略WebSocket连接错误，避免影响页面性能
  }
}

// 创建小车图标
const createCarIcon = () => {
  return window.L.divIcon({
    className: 'car-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #FFC107;
      border-radius: 50%;
      border: 3px solid #FF9800;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">🚗</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -15]
  })
}

// 更新小车标记
const updateCarMarker = (map, carPoint, marker) => {
  // 如果标记已存在，移除旧标记
  if (marker) {
    map.removeLayer(marker)
  }
}

const disconnectWebSocket = () => {
  if (websocket.value) {
    websocket.value.close()
    websocket.value = null
    isWebSocketConnected.value = false
  }
}

// 监听任务设备ID或小车ID变化，自动连接/断开websocket
watch(
  () => [selectedTask.value?.deviceId, selectedTask.value?.carId],
  ([newDeviceId, newCarId], [oldDeviceId, oldCarIdFromPrev]) => {
    // 使用deviceId或carId作为小车ID
    const carId = newDeviceId || newCarId
    const oldCarId = oldDeviceId || oldCarIdFromPrev
    
    // 防抖处理，避免频繁切换任务时的WebSocket连接风暴
    if (wsChangeTimeout) {
      clearTimeout(wsChangeTimeout)
    }
    
    wsChangeTimeout = setTimeout(() => {
      if (carId && carId !== oldCarId) {
        connectWebSocket(carId)
      } else if (!carId) {
        disconnectWebSocket()
      }
    }, 300) // 300ms防抖
  },
  { deep: true }
)

// 监听任务ID变化，自动加载执行器信息


// 当前任务绑定的小车状态（计算属性，从props.carsStatus中获取）
const currentTaskCarStatus = computed(() => {
  if (!selectedTask.value) {
    return {
      battery: NaN,
      speed: NaN,
      temperature: NaN,
      signal: NaN,
      status: 'idle'
    }
  }
  
  // 获取任务绑定的小车ID
  const carId = selectedTask.value.carId || selectedTask.value.deviceId || selectedTask.value.car_id
  if (!carId) {
    return {
      battery: NaN,
      speed: NaN,
      temperature: NaN,
      signal: NaN,
      status: 'idle'
    }
  }
  
  // 直接使用carId作为键获取状态，与App.vue保持一致
  const status = props.carsStatus.get(carId)
  
  return status || {
    battery: NaN,
    speed: NaN,
    temperature: NaN,
    signal: NaN,
    status: 'idle'
  }
})

// 防抖定时器
let fetchTasksTimeout = null
let carStatusTimeout = null

onMounted(() => {
  // 标记组件已挂载
  isMounted.value = true
  
  // 重新初始化cancelTokenSource
  cancelTokenSource.value = axios.CancelToken.source()
  
  // 清除缓存，确保重新获取最新任务数据
  taskCache.value = {}
  cacheExpiry.value = 0
  
  // 延迟加载任务列表，优先显示页面结构
  setTimeout(() => {
    fetchTasks()
  }, 100)
  // 初始状态不加载地图，只有选择任务后才加载
})





// 选择任务
const selectTask = async (task) => {
  try {
    // 调用getById接口获取完整的任务详情，包括小车信息
    const response = await taskApi.getById(task.id)
    let fullTask = response.data
    
    // 应用convertBackendTaskToFrontend函数进行转换，确保小车信息被正确提取和显示
    fullTask = convertBackendTaskToFrontend(fullTask)
    
    // 更新selectedTask
    selectedTask.value = fullTask
    showTaskDetails.value = true
    
    // 加载任务的路径点
    // 优先使用缓存中的路径点数据，确保用户点选的路径点不会丢失
    let path = []
    
    // 1. 首先检查缓存中是否有路径点
    if (taskPathCache[fullTask.id] && taskPathCache[fullTask.id].length > 0) {
      path = taskPathCache[fullTask.id]
      // console.log(`使用缓存中的路径点数据，共 ${path.length} 个点`)
    }
    // 2. 如果缓存中没有，检查任务是否有path_id，调用pathApi获取完整路径数据
    else if (fullTask.path_id) {
      try {
        const pathResponse = await pathApi.getById(fullTask.path_id)
        if (pathResponse.data && pathResponse.data.waypoints) {
          path = pathResponse.data.waypoints
          // console.log(`使用pathApi获取的路径点数据，共 ${path.length} 个点`)
        }
      } catch (error) {
        console.error('获取路径数据失败:', error)
        // 如果获取失败，尝试从任务数据中获取
        if (fullTask.path) {
          path = Array.isArray(fullTask.path) ? fullTask.path : []
          // console.log(`使用任务数据中的路径点数据，共 ${path.length} 个点`)
        }
      }
    }
    // 3. 如果没有path_id，再从API返回的数据中获取
    else if (fullTask.path) {
      path = Array.isArray(fullTask.path) ? fullTask.path : []
      // console.log(`使用API返回的路径点数据，共 ${path.length} 个点`)
    }
    
    // 清空当前路径点并加载新的路径点
    waypoints.value = []
    if (path.length > 0) {
      waypoints.value.push(...path.map(point => ({
        lat: point.lat,
        lon: point.lon || point.lng
      })))
      
      // 更新任务的path属性，确保数据同步
      selectedTask.value.path = [...waypoints.value]
      
      // 打印路径点，用于调试
      // console.log('加载的路径点:', waypoints.value)
    }
    
    // 清除之前的地图初始化计时器
    if (mapInitTimeout) {
      clearTimeout(mapInitTimeout)
    }
    
    // 延迟初始化地图，确保DOM已更新
    mapInitTimeout = setTimeout(() => {
      // 检查组件是否仍然挂载
      if (isMounted.value) {
        initTaskMap()
      }
    }, 100)
    
    // 如果任务有小车ID，自动连接WebSocket获取实时数据
    if (fullTask.carId || fullTask.deviceId) {
      const carId = fullTask.carId || fullTask.deviceId
      connectWebSocket(carId)
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    // 如果获取详情失败，至少显示基本信息
    selectedTask.value = task
    showTaskDetails.value = true
    waypoints.value = []
    
    // 清除之前的地图初始化计时器
    if (mapInitTimeout) {
      clearTimeout(mapInitTimeout)
    }
    
    // 延迟初始化地图，确保DOM已更新
    mapInitTimeout = setTimeout(() => {
      // 检查组件是否仍然挂载
      if (isMounted.value) {
        initTaskMap()
      }
    }, 100)
  }
}

// 显示当前任务路径（用于任务详情视图）
const showCurrentTaskPath = async () => {
  if (!selectedTask.value) return
  
  try {
    savedMessage.value = '正在加载路径...'
    
    // 1. 直接从任务中获取path_id
    let pathId = selectedTask.value.path_id
    
    // 2. 如果没有path_id，尝试从path_info中获取
    if (!pathId && selectedTask.value.path_info) {
      pathId = selectedTask.value.path_info.id
    }
    
    // 3. 如果没有path_id，尝试从任务详情中获取
    if (!pathId) {
      const response = await taskApi.getById(selectedTask.value.id)
      const fullTask = response.data
      pathId = fullTask.path_id || fullTask.path_info?.id
    }
    
    if (!pathId) {
      savedMessage.value = '任务未绑定路径'
      setTimeout(() => { savedMessage.value = '' }, 2000)
      return
    }
    
    // 4. 直接从pathApi获取路径数据
    const pathResponse = await pathApi.getById(pathId)
    const pathData = pathResponse.data
    
    if (!pathData || !Array.isArray(pathData.waypoints)) {
      savedMessage.value = '未获取到路径数据'
      setTimeout(() => { savedMessage.value = '' }, 2000)
      return
    }
    
    // 5. 转换后端返回的路径点格式为前端期望的格式
    const path = pathData.waypoints.map(point => {
      // 检查路径点格式，支持两种格式：
      // 1. List[double, double] 格式 [x, y]
      // 2. Object 格式 {x, y} 或 {lat, lon} 或 {worldX, worldY}
      if (Array.isArray(point) && point.length >= 2) {
        // List[double, double] 格式
        return {
          lat: parseFloat(point[1] || 0),
          lon: parseFloat(point[0] || 0),
          worldX: parseFloat(point[0] || 0),
          worldY: parseFloat(point[1] || 0),
          isPixelCoord: false // 使用世界坐标
        }
      } else if (typeof point === 'object' && point !== null) {
        // Object 格式
        if (point.worldX !== undefined && point.worldY !== undefined) {
          // {worldX, worldY} 格式
          return {
            lat: parseFloat(point.worldY || 0),
            lon: parseFloat(point.worldX || 0),
            worldX: parseFloat(point.worldX || 0),
            worldY: parseFloat(point.worldY || 0),
            isPixelCoord: false // 使用世界坐标
          }
        } else if (point.x !== undefined && point.y !== undefined) {
          // {x, y} 格式
          return {
            lat: parseFloat(point.y || 0),
            lon: parseFloat(point.x || 0),
            worldX: parseFloat(point.x || 0),
            worldY: parseFloat(point.y || 0),
            isPixelCoord: false // 使用世界坐标
          }
        } else if (point.lat !== undefined && (point.lon !== undefined || point.lng !== undefined)) {
          // {lat, lon} 或 {lat, lng} 格式
          return {
            lat: parseFloat(point.lat || 0),
            lon: parseFloat(point.lon || point.lng || 0),
            worldX: parseFloat(point.lon || point.lng || 0),
            worldY: parseFloat(point.lat || 0),
            isPixelCoord: false // 使用世界坐标
          }
        }
      }
      // 无效格式，返回默认值
      return {
        lat: 0,
        lon: 0,
        worldX: 0,
        worldY: 0,
        isPixelCoord: false // 使用世界坐标
      }
    })
    
    // console.log('Loaded path from backend:', path)
    
    // 6. 更新路径点
    waypoints.value = [...path]
    selectedTask.value.path = [...path]
    
    // 7. 更新缓存
    taskPathCache[selectedTask.value.id] = path
    
    // 8. 如果地图已经初始化，直接更新路径，不重新初始化地图
    if (isMounted.value && viewer && viewer.contentWindow && viewer.contentWindow.SlamMapViewer) {
      // 转换路径点格式为SLAM地图查看器期望的格式
      const slamPathPoints = waypoints.value.map(point => ({
        x: point?.worldX || point?.lon || 0,
        y: point?.worldY || point?.lat || 0,
        isPixelCoord: false // 使用世界坐标
      }))
      
      // 更新SLAM地图上的路径
      // console.log('Updating path on SlamMapViewer');
      viewer.contentWindow.SlamMapViewer.setPath(slamPathPoints);
    } else if (isMounted.value) {
      // 如果地图未初始化，初始化地图
      initTaskMap()
    }
    
    savedMessage.value = '路径加载成功'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('加载路径失败:', error)
    savedMessage.value = '路径加载失败'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 显示任务路径
const showTaskPath = async (task) => {
  try {
    // 选择该任务
    selectedTask.value = task
    showTaskDetails.value = true
    
    // 获取完整的任务详情，确保包含路径点信息
    const response = await taskApi.getById(task.id)
    let fullTask = response.data
    
    // 应用convertBackendTaskToFrontend函数进行转换
    fullTask = convertBackendTaskToFrontend(fullTask)
    
    // 更新selectedTask
    selectedTask.value = fullTask
    
    // 清空当前路径点
    waypoints.value = []
    
    // 如果有路径数据，加载并显示
    if (fullTask.path && fullTask.path.length > 0) {
      // 加载新的路径点，确保坐标有效
      waypoints.value.push(...fullTask.path.map(point => ({
        lat: parseFloat(point.lat || 0),
        lon: parseFloat(point.lon || point.lng || 0),
        isPixelCoord: true // 标记为像素坐标
      })))
      
      // 更新任务的path属性，确保数据同步
      selectedTask.value.path = [...waypoints.value]
      
      // 打印路径点，用于调试
      // console.log('加载的路径点:', waypoints.value)
    } else {
      // 尝试从path_id获取路径数据
      if (fullTask.path_id) {
        try {
          const pathResponse = await pathApi.getById(fullTask.path_id)
          const pathData = pathResponse.data
          
          if (pathData && pathData.waypoints && pathData.waypoints.length > 0) {
            // 加载路径点，确保坐标有效
            waypoints.value.push(...pathData.waypoints.map(point => ({
              lat: parseFloat(point.y || 0),
              lon: parseFloat(point.x || 0),
              isPixelCoord: true // 标记为像素坐标
            })))
            
            // 更新任务的path属性，确保数据同步
            selectedTask.value.path = [...waypoints.value]
            
            // 打印路径点，用于调试
            // console.log('从path_id加载的路径点:', waypoints.value)
          }
        } catch (pathError) {
          console.error('获取路径数据失败:', pathError)
        }
      }
    }
    
    // 延迟初始化地图，确保DOM已更新
    setTimeout(() => {
      // 检查组件是否仍然挂载
      if (isMounted.value) {
        initTaskMap()
      }
    }, 300)
  } catch (error) {
    console.error('获取任务详情失败:', error)
    
    // 如果获取详情失败，至少尝试显示基本信息
    selectedTask.value = task
    showTaskDetails.value = true
    
    // 清空路径点
    waypoints.value = []
    
    // 延迟初始化地图
    setTimeout(() => {
      if (isMounted.value) {
        initTaskMap()
      }
    }, 300)
  }
}

// 取消选择任务（返回任务列表）
const deselectTask = () => {
  selectedTask.value = null
  showTaskDetails.value = false
  // 清理地图资源
  if (viewer) {
    try {
      viewer.remove()
      // console.log('Map instance removed')
    } catch (error) {
      console.error('Error removing map instance:', error)
    }
    viewer = null
  }
}

// 查看任务地图
const viewTaskMap = async (task) => {
  try {
    // 先获取完整的任务详情，确保包含路径点信息
    const response = await taskApi.getById(task.id)
    let fullTask = response.data
    
    // 应用convertBackendTaskToFrontend函数进行转换
    fullTask = convertBackendTaskToFrontend(fullTask)
    
    // 优先使用缓存中的路径点数据，确保用户点选的路径点不会丢失
    if (taskPathCache[fullTask.id] && taskPathCache[fullTask.id].length > 0) {
      fullTask.path = [...taskPathCache[fullTask.id]]
    }
    
    // 保存到viewedTask
    viewedTask.value = fullTask
    
    // 先显示模态框
    showTaskMapModal.value = true
    
    // 使用nextTick确保DOM更新完成后再初始化地图
    await nextTick()
    
    // 检查地图容器是否存在且可见
    const mapContainer = document.getElementById('task-map-view-container')
    if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
      initTaskMapForView()
    } else {
      // 如果容器不可见，再等待一段时间后重试
      setTimeout(() => {
        initTaskMapForView()
      }, 200)
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    
    // 如果获取详情失败，尝试从缓存中获取路径点数据
    if (taskPathCache[task.id] && taskPathCache[task.id].length > 0) {
      task.path = [...taskPathCache[task.id]]
      // console.log(`获取任务详情失败，但从缓存中获取到路径点数据，共 ${taskPathCache[task.id].length} 个点`)
    }
    
    // 至少显示基本信息
    viewedTask.value = task
    showTaskMapModal.value = true
    
    // 使用nextTick确保DOM更新完成后再初始化地图
    await nextTick()
    
    // 检查地图容器是否存在且可见
    const mapContainer = document.getElementById('task-map-view-container')
    if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
      initTaskMapForView()
    } else {
      // 如果容器不可见，再等待一段时间后重试
      setTimeout(() => {
        initTaskMapForView()
      }, 200)
    }
  }
}

// 初始化任务地图（用于查看）
const initTaskMapForView = () => {
  if (!viewedTask.value) return
  
  const mapContainer = document.getElementById('task-map-view-container')
  if (!mapContainer) {
    console.error('任务地图容器未找到')
    return
  }
  
  // 强制清理地图容器内容，确保没有残留的地图实例
  mapContainer.innerHTML = ''
  
  // 清理地图实例
  if (taskMapViewer.value) {
    taskMapViewer.value = null
  }
  
  try {
    // 创建iframe元素加载SLAM地图查看器
    const iframe = document.createElement('iframe')
    // 如果有选中的任务且任务有地图预览URL，添加preview参数和map_id
    if (selectedTask.value && selectedTask.value.map_preview_url && selectedTask.value.map_id) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(selectedTask.value.map_preview_url)}&map=${selectedTask.value.map_id}&hideMapSelect=true`
    } else if (selectedTask.value && selectedTask.value.map_preview_url) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(selectedTask.value.map_preview_url)}&hideMapSelect=true`
    } else if (selectedTask.value && selectedTask.value.map_id) {
      //  fallback to map_id if no preview_url
      iframe.src = `/map_modified.html?map=${selectedTask.value.map_id}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_preview_url && viewedTask.value.map_id) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(viewedTask.value.map_preview_url)}&map=${viewedTask.value.map_id}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_preview_url) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(viewedTask.value.map_preview_url)}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_id) {
      //  fallback to map_id if no preview_url
      iframe.src = `/map_modified.html?map=${viewedTask.value.map_id}&hideMapSelect=true`
    } else {
      iframe.src = '/map_modified.html?hideMapSelect=true'
    }
    iframe.className = 'w-full h-full border-none rounded-lg shadow-lg'
    
    // 添加到地图容器
    mapContainer.appendChild(iframe)
    
    // 存储iframe实例
    taskMapViewer.value = iframe
    
    // 等待iframe加载完成后，设置路径和小车位置
      iframe.onload = async function() {
        // console.log('Task map iframe loaded, setting path and car position')
        
        // 先确保地图加载完成
        setTimeout(async () => {
          // 直接使用像素坐标路径
          let path = viewedTask.value.path || []
          
          // 如果没有路径，尝试从后端获取
          if (path.length === 0 && viewedTask.value.path_id) {
            try {
              // console.log('Fetching path data for task:', viewedTask.value.id)
              const response = await fetch(`/api/paths/${viewedTask.value.path_id}`)
              if (response.ok) {
                const pathData = await response.json()
                if (pathData && pathData.waypoints) {
                  path = pathData.waypoints
                  // console.log('Path data fetched:', path)
                }
              }
            } catch (error) {
              console.error('Error fetching path data:', error)
            }
          }
          
          // 设置路径
          if (iframe.contentWindow && iframe.contentWindow.SlamMapViewer) {
            // console.log('Setting path on SlamMapViewer:', path)
            iframe.contentWindow.SlamMapViewer.setPath(path)
          } else {
            console.error('SlamMapViewer not found')
          }
          
          // 设置小车位置
          updateCarPositionOnSlamMapForView()
        }, 500)
      }
    
  } catch (error) {
    console.error('初始化任务地图失败:', error)
    if (mapContainer) {
      mapContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">地图加载失败: ${error.message}</div>`
    }
  }
}

// 更新查看模式下SLAM地图上的小车位置
const updateCarPositionOnSlamMapForView = () => {
  if (!taskMapViewer.value || !taskMapViewer.value.contentWindow || !taskMapViewer.value.contentWindow.SlamMapViewer) {
    return
  }
  
  if (carRealTimeData.value.longitude && carRealTimeData.value.latitude) {
    const carPosition = {
      x: Math.floor((carRealTimeData.value.longitude + 24.25) / 0.05),
      y: Math.floor((31.25 - carRealTimeData.value.latitude) / 0.05),
      angle: 0 // 暂时设置为0，实际项目中需要根据小车的朝向进行设置
    }
    taskMapViewer.value.contentWindow.SlamMapViewer.setCarPosition(carPosition)
  }
}

// 关闭任务地图
const closeTaskMap = () => {
  showTaskMapModal.value = false
  
  // 清理地图资源
  setTimeout(() => {
    if (taskMapViewer.value) {
      taskMapViewer.value = null
      viewCarMarker = null
    }
  }, 100)
}

// 更新路径绘制
const updatePathDrawing = (map, fitBounds = false) => {
  // 清除旧路径
  if (pathLayer.value) {
    try {
      map.removeLayer(pathLayer.value)
      pathLayer.value = null
    } catch (error) {
      console.error('Error removing path layer:', error)
    }
  }
  
  // 过滤掉无效的路径点
  const validWaypoints = waypoints.value.filter(point => {
    return point && typeof point.lat === 'number' && typeof point.lon === 'number'
  })
  
  // 如果有至少2个有效点，绘制新路径
  if (validWaypoints.length >= 2) {
    try {
      const pathCoords = validWaypoints.map(point => [point.lat, point.lon])
      pathLayer.value = window.L.polyline(pathCoords, {
        color: '#FF0000',
        weight: 4,
        opacity: 0.8
      }).addTo(map)
    } catch (error) {
      console.error('Error creating path:', error)
    }
  }
  
  // 更新地图中心和缩放级别以包含所有路径点
  if (validWaypoints.length > 0) {
    // 计算所有路径点的中心点
    const centerPoint = calculateCenterPoint(validWaypoints)
    if (centerPoint) {
      try {
        // 更新地图中心
        map.setView([centerPoint.lat, centerPoint.lon])
        
        // 如果有多个路径点，且需要调整缩放级别，则调整缩放级别以包含所有路径点
        if (fitBounds && validWaypoints.length > 1) {
          // 创建包含所有路径点的边界框
          const bounds = window.L.latLngBounds()
          validWaypoints.forEach(point => {
            try {
              bounds.extend([point.lat, point.lon])
            } catch (error) {
              console.error('Error extending bounds:', error, 'Point:', point)
            }
          })
          
          // 调整地图视图以适应所有路径点，添加10%的内边距
          map.fitBounds(bounds, { padding: [20, 20] })
        }
      } catch (error) {
        console.error('Error updating map view:', error)
      }
    }
  }
}

// 获取当前有效路径点（避免模式状态残留导致保存失败）
const getActivePathPoints = () => {
  const pointModePoints = Array.isArray(waypoints.value) ? waypoints.value : []
  const polygonModePoints = Array.isArray(polygonPoints.value) ? polygonPoints.value : []

  // console.log('getActivePathPoints called:')
  // console.log('  isDrawingPolygon:', isDrawingPolygon.value)
  // console.log('  isDrawingPath:', isDrawingPath.value)
  // console.log('  waypoints count:', pointModePoints.length)
  // console.log('  polygonPoints count:', polygonModePoints.length)

  if (isDrawingPolygon.value) {
    if (polygonModePoints.length > 0) {
      return { mode: 'polygon', points: polygonModePoints }
    }
    if (pointModePoints.length > 0) {
      return { mode: 'point', points: pointModePoints }
    }
    return { mode: 'polygon', points: [] }
  }

  if (pointModePoints.length > 0) {
    return { mode: 'point', points: pointModePoints }
  }
  if (polygonModePoints.length > 0) {
    return { mode: 'polygon', points: polygonModePoints }
  }

  return { mode: 'point', points: [] }
}

// 保存路径
const savePath = async () => {
  const { points: activePathPoints } = getActivePathPoints()
  if (activePathPoints.length === 0) {
    savedMessage.value = '请先在地图上点击选择目标点'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  // 跳过保存任务参数步骤，直接进入路径保存流程
  // 重新获取任务详情，确保绑定的设备信息是最新的
  if (selectedTask.value) {
    try {
      const response = await taskApi.getById(selectedTask.value.id)
      selectedTask.value = convertBackendTaskToFrontend(response.data)
    } catch (error) {
      console.error('获取任务详情失败:', error)
    }
  }
  
  showConfirmModal.value = true
}

// 下发任务
const sendTask = async () => {
  const { points: activePathPoints } = getActivePathPoints()
  if (activePathPoints.length === 0) {
    savedMessage.value = '请先在地图上点击选择目标点'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  // 跳过保存任务参数步骤，直接进入路径保存流程
  // 重新获取任务详情，确保绑定的设备信息是最新的
  if (selectedTask.value) {
    try {
      const response = await taskApi.getById(selectedTask.value.id)
      selectedTask.value = convertBackendTaskToFrontend(response.data)
    } catch (error) {
      console.error('获取任务详情失败:', error)
    }
  }
  
  showSendTaskModal.value = true
}

// 切换暂停/继续任务
const togglePauseResume = () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  if (selectedTask.value.status === '执行中') {
    pauseTask()
  } else if (selectedTask.value.status === '待处理' || selectedTask.value.status === '已定时' || selectedTask.value.status === '暂停中') {
    resumeTask()
  } else {
    savedMessage.value = '该任务状态不支持此操作'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}



// 路径规划模式切换
const setPathMode = (mode) => {
  // console.log('setPathMode called with mode:', mode)
  // console.log('Before - isDrawingPath:', isDrawingPath.value, 'isDrawingPolygon:', isDrawingPolygon.value)
  
  switch (mode) {
    case 'point':
      isDrawingPath.value = true
      isDrawingPolygon.value = false
      savedMessage.value = '进入点选模式，点击地图添加路径点'
      // console.log('进入点选模式，savedMessage设置为:', savedMessage.value)
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      break
    case 'polygon':
      isDrawingPath.value = false
      isDrawingPolygon.value = true
      savedMessage.value = '进入多边形模式，点击地图添加多边形顶点，双击完成绘制'
      setTimeout(() => {
        savedMessage.value = ''
      }, 3000)
      break
    case 'clear':
      clearPath()
      break
  }
  
  // console.log('After - isDrawingPath:', isDrawingPath.value, 'isDrawingPolygon:', isDrawingPolygon.value)
  // console.log('Current waypoints:', waypoints.value, 'polygonPoints:', polygonPoints.value)
}

// 清除所有路径
const clearPath = () => {
  // 清除SLAM地图上的路径
  if (viewer && viewer.contentWindow && viewer.contentWindow.SlamMapViewer) {
    // 优先使用专门的clearPath方法
    if (viewer.contentWindow.SlamMapViewer.clearPath) {
      viewer.contentWindow.SlamMapViewer.clearPath()
    } else {
      // 后备方案
      viewer.contentWindow.SlamMapViewer.setPath([])
    }
  }
  
  // 清空路径点和多边形顶点
  waypoints.value = []
  polygonPoints.value = []
  
  // 重置绘制状态
  isDrawingPath.value = false
  isDrawingPolygon.value = false
  
  // 同时更新任务的path属性，确保数据同步
  if (selectedTask.value) {
    selectedTask.value.path = []
    
    // 更新任务列表中的路径点
    const taskIndex = tasks.value.findIndex(task => task.id === selectedTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].path = []
    }
  }
  
  savedMessage.value = '路径已清除'
  setTimeout(() => {
    savedMessage.value = ''
  }, 2000)
}

// 创建新任务
const createNewTask = async () => {
  // 简单验证
  if (!newTaskForm.name || !newTaskForm.carId || !newTaskForm.mapId) {
    alert('请填写所有必填字段：任务名称、执行小车和选择地图')
    return
  }
  
  // 定时任务验证
  if (newTaskForm.isScheduled && !newTaskForm.scheduledStart) {
    alert('如果是定时任务，必须提供开始时间')
    return
  }
  
  const selectedCarId = Number(newTaskForm.carId)
  
  // 创建新任务对象
  const newTask = {
    name: newTaskForm.name,
    description: newTaskForm.description,
    map_id: newTaskForm.mapId, // 使用选择的地图ID
    map_preview_url: newTaskForm.mapPreviewUrl, // 存储地图预览URL
    car_id: selectedCarId, // 直接指定车辆ID
    is_scheduled: newTaskForm.isScheduled,
    scheduled_start: newTaskForm.scheduledStart,
    scheduled_end: newTaskForm.scheduledEnd
  }
  
  try {
    // 创建普通任务
    const response = await taskApi.post(newTask)
    const createdTask = response.data
    
    if (!createdTask?.id) {
      throw new Error('任务创建成功，但未返回任务ID')
    }
    
    // 显式调用绑定接口，确保后端同步更新 car.current_task
    await taskApi.assignCar(createdTask.id, selectedCarId)
    
    // 重新获取任务的最新信息，确保包含小车绑定信息
    const updatedTaskResponse = await taskApi.getById(createdTask.id)
    const updatedTask = updatedTaskResponse.data
    
    // 将后端任务转换为前端格式并添加到本地任务列表
    const convertedTask = convertBackendTaskToFrontend(updatedTask)
    tasks.value.push(convertedTask)
    
    // 清空表单并关闭弹窗
    Object.assign(newTaskForm, {
      name: '',
      carId: null,
      description: '',
      locationId: null
    })
    
    closeNewTaskModal()
    
    // 直接设置选中的任务，避免selectTask清空waypoints
    selectedTask.value = convertedTask
    showTaskDetails.value = true
    
    // 清空路径点，准备让用户添加新路径
    waypoints.value = []
    polygonPoints.value = []
    
    // 延迟初始化地图，确保DOM已更新
    setTimeout(() => {
      if (isMounted.value) {
        initTaskMap()
      }
    }, 100)
    
    // 自动进入点选模式，让用户可以立即点击地图添加路径点
    isDrawingPath.value = true
    isDrawingPolygon.value = false
    savedMessage.value = '任务创建成功，已进入点选模式，请点击地图添加路径点'
    setTimeout(() => { savedMessage.value = '' }, 3000)
    
    // 如果任务有小车ID，自动连接WebSocket获取实时数据
    if (convertedTask.carId || convertedTask.deviceId) {
      const carId = convertedTask.carId || convertedTask.deviceId
      connectWebSocket(carId)
    }
  } catch (error) {
    console.error('创建任务失败:', error)
    savedMessage.value = '创建任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 开始任务
const startTask = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '执行中') {
    savedMessage.value = '任务已经在执行中'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '已完成') {
    savedMessage.value = '已完成的任务无法开始'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '已取消' || selectedTask.value.status === '失败') {
    savedMessage.value = '已取消或失败的任务无法开始'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  try {
    // 调用API开始任务
    await taskApi.start(selectedTask.value.id)
    // 更新本地任务状态（使用前端中文状态）
    selectedTask.value.status = '执行中'
    savedMessage.value = '任务已开始'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    
    // 如果任务有小车ID，自动连接WebSocket获取实时数据
    if (selectedTask.value.carId || selectedTask.value.deviceId) {
      const carId = selectedTask.value.carId || selectedTask.value.deviceId
      connectWebSocket(carId)
    }
  } catch (error) {
    console.error('开始任务失败:', error)
    savedMessage.value = '开始任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 暂停任务
const pauseTask = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status !== '执行中') {
    savedMessage.value = '只有执行中的任务可以暂停'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  try {
    // 调用API暂停任务
    await taskApi.pause(selectedTask.value.id)
    // 更新本地任务状态（使用前端中文状态）
    selectedTask.value.status = '暂停中'
    savedMessage.value = '任务已暂停'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('暂停任务失败:', error)
    savedMessage.value = '暂停任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 继续任务
const resumeTask = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status !== '待处理' && selectedTask.value.status !== '已定时' && selectedTask.value.status !== '暂停中') {
    savedMessage.value = '只有待处理、已定时或暂停中的任务可以继续'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  try {
    // 调用API继续任务
    await taskApi.resume(selectedTask.value.id) // 使用resume方法，与开始任务区分
    // 更新本地任务状态（使用前端中文状态）
    selectedTask.value.status = '执行中'
    savedMessage.value = '任务已继续'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('继续任务失败:', error)
    savedMessage.value = '继续任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 取消任务
const cancelTask = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '已取消') {
    savedMessage.value = '任务已经被取消'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '已完成') {
    savedMessage.value = '已完成的任务无法取消'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  try {
    // 调用API更新任务状态（传递后端英文状态）
    await taskApi.updateStatus(selectedTask.value.id, 'cancelled')
    // 更新本地任务状态（使用前端中文状态）
    selectedTask.value.status = '已取消'
    
    // 清除路径点缓存
    if (taskPathCache[selectedTask.value.id]) {
      delete taskPathCache[selectedTask.value.id]
      // console.log(`取消任务 ${selectedTask.value.id}，移除路径点缓存`)
    }
    
    // 清除本地路径点
    waypoints.value = []
    selectedTask.value.path = []
    
    // 更新任务列表中的路径点
    const taskIndex = tasks.value.findIndex(task => task.id === selectedTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].path = []
      tasks.value[taskIndex].status = '已取消'
    }
    
    // 如果地图已初始化，更新路径绘制
    if (viewer) {
      updatePathDrawing(viewer)
    }
    
    savedMessage.value = '任务已取消'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('取消任务失败:', error)
    savedMessage.value = '取消任务失败，请重试'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 完成任务
const completeTask = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  if (selectedTask.value.status === '已完成') {
    savedMessage.value = '任务已经完成'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  try {
    // 调用API完成任务
    await taskApi.finish(selectedTask.value.id)
    // 更新本地任务状态（使用前端中文状态）
    selectedTask.value.status = '已完成'
    
    // 清除路径点缓存
    if (taskPathCache[selectedTask.value.id]) {
      delete taskPathCache[selectedTask.value.id]
      // console.log(`完成任务 ${selectedTask.value.id}，移除路径点缓存`)
    }
    
    // 清除本地路径点
    waypoints.value = []
    selectedTask.value.path = []
    
    // 更新任务列表中的路径点
    const taskIndex = tasks.value.findIndex(task => task.id === selectedTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].path = []
      tasks.value[taskIndex].status = '已完成'
    }
    
    // 如果地图已初始化，更新路径绘制
    if (viewer) {
      updatePathDrawing(viewer)
    }
    
    savedMessage.value = '任务已完成'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('完成任务失败:', error)
    savedMessage.value = '完成任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 删除任务
const deleteTask = async (task) => {
  // 如果没有传递task参数，使用当前选中的任务
  const targetTask = task || selectedTask.value
  
  if (!targetTask) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => { savedMessage.value = '' }, 2000)
    return
  }
  
  // 确认删除
  if (!confirm(`确定要删除任务 "${targetTask.name}" 吗？删除后无法恢复。`)) {
    return
  }
  
  try {
    // 调用API删除任务
    await taskApi.delete(targetTask.id)
    
    // 从本地任务列表中移除
    const taskIndex = tasks.value.findIndex(t => t.id === targetTask.id)
    if (taskIndex !== -1) {
      tasks.value.splice(taskIndex, 1)
    }
    
    // 如果删除的是当前选中的任务，取消选中
    if (selectedTask.value && selectedTask.value.id === targetTask.id) {
      selectedTask.value = null
      showTaskDetails.value = false
    }
    
    savedMessage.value = '任务已删除'
    setTimeout(() => { savedMessage.value = '' }, 2000)
  } catch (error) {
    console.error('删除任务失败:', error)
    savedMessage.value = '删除任务失败: ' + (error.message || '请重试')
    setTimeout(() => { savedMessage.value = '' }, 2000)
  }
}

// 保存任务参数
const saveTaskParams = async () => {
  if (!selectedTask.value) {
    savedMessage.value = '请先选择一个任务'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    return
  }
  
  try {
    // 将前端任务转换为后端格式
    const backendTask = convertFrontendTaskToBackend(selectedTask.value)
    // 调用API更新任务
    await taskApi.update(selectedTask.value.id, backendTask)
    savedMessage.value = '任务参数已保存'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('保存任务参数失败:', error)
    savedMessage.value = '保存任务参数失败，请重试'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}

// 发送路径到后端
const sendPathToBackend = async () => {
  try {
    if (!selectedTask.value) {
      savedMessage.value = '请先选择一个任务'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    const { mode: activeMode, points: pathPoints } = getActivePathPoints()

    if (activeMode === 'polygon' && pathPoints.length < 3) {
      savedMessage.value = '多边形顶点数量不足，至少需要3个点'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }

    if (activeMode === 'point' && pathPoints.length < 2) {
      savedMessage.value = '路径点数量不足，至少需要2个点'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    // 确保路径点数组有效
    if (!Array.isArray(pathPoints) || pathPoints.length === 0) {
      savedMessage.value = '路径点数据无效'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    isSending.value = true
    
    // 转换为后端需要的像素坐标格式
    const backendWaypoints = convertPathToSlamCoordinates(pathPoints)
    
    // 创建路径
    const pathResponse = await pathApi.post({
      task_id: selectedTask.value.id,
      car_id: selectedTask.value.carId || selectedTask.value.deviceId,
      map_id: selectedTask.value.mapId || selectedTask.value.map_id || 1,
      name: selectedTask.value.name + ' - 路径',
      waypoints: backendWaypoints
    })
    
    // 检查路径创建是否成功
    if (!pathResponse.data || !pathResponse.data.id) {
      throw new Error('路径创建失败，未返回路径ID')
    }
    
    // 将路径与任务绑定
    await taskApi.bindPath(selectedTask.value.id, pathResponse.data.id)
    
    // 重新获取任务详情，确保绑定的设备信息更新
    const updatedTaskResponse = await taskApi.getById(selectedTask.value.id)
    selectedTask.value = convertBackendTaskToFrontend(updatedTaskResponse.data)
    
    savedMessage.value = '路径创建并绑定成功'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    
    // 关闭模态框
    showConfirmModal.value = false
    
    // 退出绘制模式
    isDrawingPath.value = false
    isDrawingPolygon.value = false
    
    // 广播路径数据到WebSocket，实现与地图监控页面的同步
    if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
      const pathData = {
        type: 'path_update',
        task_id: selectedTask.value.id,
        path: backendWaypoints,
        timestamp: new Date().toISOString()
      }
      websocket.value.send(JSON.stringify(pathData))
      // console.log('路径数据已通过WebSocket广播:', pathData)
    }
    
  } catch (error) {
    console.error('发送路径失败:', error)
    savedMessage.value = '发送路径失败: ' + (error.message || '未知错误')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } finally {
    isSending.value = false
  }
}

// 发送任务到后端
const sendTaskToBackend = async () => {
  try {
    if (!selectedTask.value) {
      savedMessage.value = '请先选择一个任务'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    const { mode: activeMode, points: pathPoints } = getActivePathPoints()

    if (activeMode === 'polygon' && pathPoints.length < 3) {
      savedMessage.value = '多边形顶点数量不足，至少需要3个点'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }

    if (activeMode === 'point' && pathPoints.length < 2) {
      savedMessage.value = '路径点数量不足，至少需要2个点'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    // 确保路径点数组有效
    if (!Array.isArray(pathPoints) || pathPoints.length === 0) {
      savedMessage.value = '路径点数据无效'
      setTimeout(() => {
        savedMessage.value = ''
      }, 2000)
      return
    }
    
    isSending.value = true
    
    // 转换为后端需要的像素坐标格式
    const backendWaypoints = convertPathToSlamCoordinates(pathPoints)
    
    // 创建路径
    const pathResponse = await pathApi.post({
      task_id: selectedTask.value.id,
      car_id: selectedTask.value.carId || selectedTask.value.deviceId,
      map_id: selectedTask.value.mapId || selectedTask.value.map_id || 1,
      name: selectedTask.value.name + ' - 路径',
      waypoints: backendWaypoints
    })
    
    // 检查路径创建是否成功
    if (!pathResponse.data || !pathResponse.data.id) {
      throw new Error('路径创建失败，未返回路径ID')
    }
    
    // 将路径与任务绑定
    await taskApi.bindPath(selectedTask.value.id, pathResponse.data.id)
    
    // 重新获取任务详情，确保绑定的设备信息更新
    const updatedTaskResponse = await taskApi.getById(selectedTask.value.id)
    selectedTask.value = convertBackendTaskToFrontend(updatedTaskResponse.data)
    
    savedMessage.value = '任务已下发'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
    
    // 关闭模态框
    showSendTaskModal.value = false
    
    // 退出绘制模式
    isDrawingPath.value = false
    isDrawingPolygon.value = false
    
    // 广播路径数据到WebSocket，实现与地图监控页面的同步
    if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
      const pathData = {
        type: 'path_update',
        task_id: selectedTask.value.id,
        path: backendWaypoints,
        timestamp: new Date().toISOString()
      }
      websocket.value.send(JSON.stringify(pathData))
    }
    
  } catch (error) {
    console.error('下发任务失败:', error)
    savedMessage.value = '下发任务失败: ' + (error.message || '未知错误')
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } finally {
    isSending.value = false
  }
}

// 解绑小车
const unbindCar = async () => {
  if (!selectedTask.value) return
  
  try {
    await taskApi.unbindCar(selectedTask.value.id)
    // 重新获取任务信息
    const updatedTaskResponse = await taskApi.getById(selectedTask.value.id)
    selectedTask.value = convertBackendTaskToFrontend(updatedTaskResponse.data)
    savedMessage.value = '小车解绑成功'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('解绑小车失败:', error)
    savedMessage.value = '解绑小车失败，请重试'
    setTimeout(() => {
      savedMessage.value = ''
    }, 2000)
  }
}





// 计算多个坐标点的中心点
const calculateCenterPoint = (points) => {
  if (!points || points.length === 0) return null
  
  // 计算所有点的纬度和经度的平均值
  let sumLat = 0, sumLng = 0
  points.forEach(point => {
    sumLat += (point?.lat || 0)
    sumLng += (point?.lon || 0)
  })
  
  return {
    lat: sumLat / points.length,
    lon: sumLng / points.length
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  // 标记组件已卸载
  isMounted.value = false
  
  // 取消所有正在进行的请求
  try {
    cancelTokenSource.value.cancel('组件已卸载')
    // console.log('已取消所有请求')
  } catch (error) {
    console.error('取消请求失败:', error)
  }
  
  // 清理地图实例
  if (viewer) {
    try {
      viewer.remove()
      viewer = null
    } catch (error) {
      console.error('销毁地图实例失败:', error)
    }
  }
  
  // 清理WebSocket连接
  if (websocket.value) {
    try {
      websocket.value.close()
      websocket.value = null
      isWebSocketConnected.value = false
    } catch (error) {
      console.error('关闭WebSocket连接失败:', error)
    }
  }
  
  // 清理定时器
  if (wsChangeTimeout) {
    clearTimeout(wsChangeTimeout)
    wsChangeTimeout = null
  }
  if (fetchTasksTimeout) {
    clearTimeout(fetchTasksTimeout)
    fetchTasksTimeout = null
  }
  if (carStatusTimeout) {
    clearTimeout(carStatusTimeout)
    carStatusTimeout = null
  }
  if (mapInitTimeout) {
    clearTimeout(mapInitTimeout)
    mapInitTimeout = null
  }
  
  // 清理地图相关的全局变量
  if (carMarker) {
    try {
      if (viewer) {
        viewer.removeLayer(carMarker)
      }
      carMarker = null
    } catch (error) {
      console.error('清理小车标记失败:', error)
    }
  }
  
  if (viewCarMarker) {
    try {
      if (taskMapViewer.value) {
        taskMapViewer.value.removeLayer(viewCarMarker)
      }
      viewCarMarker = null
    } catch (error) {
      console.error('清理查看任务时的小车标记失败:', error)
    }
  }
  
  if (taskMapViewer.value) {
    try {
      taskMapViewer.value.remove()
      taskMapViewer.value = null
    } catch (error) {
      console.error('销毁任务地图实例失败:', error)
    }
  }
})

// 存储消息监听器的引用
let mapMessageListener = null

const initTaskMap = () => {
  const mapContainer = document.getElementById('task-map-container')
  if (!mapContainer) {
    console.error('地图容器未找到')
    return
  }
  
  // 强制清理地图容器内容，确保没有残留的地图实例
  mapContainer.innerHTML = ''
  
  // 清理地图实例
  if (viewer) {
    viewer = null
  }
  
  // 移除旧的消息监听器
  if (mapMessageListener) {
    window.removeEventListener('message', mapMessageListener)
    mapMessageListener = null
  }
  
  try {
    // 创建iframe元素加载SLAM地图查看器
    const iframe = document.createElement('iframe')
    // 如果有选中的任务且任务有地图预览URL，添加preview参数和map_id
    if (selectedTask.value && selectedTask.value.map_preview_url && selectedTask.value.map_id) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(selectedTask.value.map_preview_url)}&map=${selectedTask.value.map_id}&hideMapSelect=true`
    } else if (selectedTask.value && selectedTask.value.map_preview_url) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(selectedTask.value.map_preview_url)}&hideMapSelect=true`
    } else if (selectedTask.value && selectedTask.value.map_id) {
      //  fallback to map_id if no preview_url
      iframe.src = `/map_modified.html?map=${selectedTask.value.map_id}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_preview_url && viewedTask.value.map_id) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(viewedTask.value.map_preview_url)}&map=${viewedTask.value.map_id}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_preview_url) {
      iframe.src = `/map_modified.html?preview=${encodeURIComponent(viewedTask.value.map_preview_url)}&hideMapSelect=true`
    } else if (viewedTask.value && viewedTask.value.map_id) {
      //  fallback to map_id if no preview_url
      iframe.src = `/map_modified.html?map=${viewedTask.value.map_id}&hideMapSelect=true`
    } else {
      iframe.src = '/map_modified.html?hideMapSelect=true'
    }
    iframe.className = 'w-full h-full border-none rounded-lg shadow-lg'
    
    // 添加到地图容器
    mapContainer.appendChild(iframe)
    
    // 存储iframe实例
    viewer = iframe
    
    // 等待iframe加载完成后，设置路径和小车位置
      iframe.onload = function() {
        // 转换路径点格式为SLAM地图查看器期望的格式
        const slamPathPoints = waypoints.value.map(point => ({
          x: point?.lon || 0,
          y: point?.lat || 0,
          isPixelCoord: true
        }))
        
        // 设置路径
        if (iframe.contentWindow && iframe.contentWindow.SlamMapViewer) {
          iframe.contentWindow.SlamMapViewer.setPath(slamPathPoints)
        }
        
        // 如果有选中的任务，加载对应的地图
        if (selectedTask.value && selectedTask.value.map_id) {
          if (iframe.contentWindow && iframe.contentWindow.document.getElementById('mapSelect')) {
            const mapSelect = iframe.contentWindow.document.getElementById('mapSelect')
            // 查找与map_id匹配的选项
            let found = false
            for (let i = 0; i < mapSelect.options.length; i++) {
              const option = mapSelect.options[i]
              // 检查选项值是否包含map_id
              if (option.value.includes(selectedTask.value.map_id)) {
                // 设置地图选择器的值
                mapSelect.value = option.value
                // 触发地图选择事件
                const event = new Event('change')
                mapSelect.dispatchEvent(event)
                found = true
                break
              }
            }
            if (!found) {
              // console.log('Map not found in dropdown:', selectedTask.value.map_id)
            }
          }
        }
        
        // 设置小车位置
        updateCarPositionOnSlamMap()
      }
    
    // 添加新的消息监听器
    mapMessageListener = function(event) {
      if (event.data && event.data.type === 'map_click') {
        // console.log('Received map click message:', event.data);
        const { previewPixelX, previewPixelY, worldX, worldY } = event.data
        
        // 根据当前绘制模式添加路径点
        if (isDrawingPath.value) {
          // 点选模式：添加路径点
          const newPoint = {
            lat: worldY,  // 使用世界坐标作为lat
            lon: worldX,  // 使用世界坐标作为lon
            worldX: worldX,
            worldY: worldY
          };
          // console.log('Adding new waypoint:', newPoint);
          waypoints.value.push(newPoint);
          // console.log('Current waypoints:', waypoints.value);
          
          // 实时更新任务的path属性
          if (selectedTask.value) {
            selectedTask.value.path = [...waypoints.value];
            // console.log('Updated task path:', selectedTask.value.path);
          }
          
          // 转换路径点格式为SLAM地图查看器期望的格式
          const slamPathPoints = waypoints.value.map(point => ({
            x: (point?.worldX || point?.lon || 0),
            y: (point?.worldY || point?.lat || 0),
            isPixelCoord: false  // 使用世界坐标
          }));
          // console.log('Converted slam path points:', slamPathPoints);
          
          // 更新SLAM地图上的路径
          if (viewer && viewer.contentWindow && viewer.contentWindow.SlamMapViewer) {
            // console.log('Updating path on SlamMapViewer');
            viewer.contentWindow.SlamMapViewer.setPath(slamPathPoints);
          }
        } else if (isDrawingPolygon.value) {
          // 多边形模式：添加多边形顶点
          const newPoint = {
            lat: worldY,  // 使用世界坐标作为lat
            lon: worldX,  // 使用世界坐标作为lon
            worldX: worldX,
            worldY: worldY
          };
          // console.log('Adding new polygon point:', newPoint);
          polygonPoints.value.push(newPoint);
          // console.log('Current polygon points:', polygonPoints.value);
          
          // 转换路径点格式为SLAM地图查看器期望的格式
          const slamPathPoints = polygonPoints.value.map(point => ({
            x: (point?.lon || 0),
            y: (point?.lat || 0),
            isPixelCoord: true
          }));
          // console.log('Converted slam path points:', slamPathPoints);
          
          // 更新SLAM地图上的多边形
          if (viewer && viewer.contentWindow && viewer.contentWindow.SlamMapViewer) {
            // console.log('Updating polygon on SlamMapViewer');
            viewer.contentWindow.SlamMapViewer.setPath(slamPathPoints);
          }
        }
      }
    }
    
    // 监听来自iframe的消息
    window.addEventListener('message', mapMessageListener)
    
  } catch (error) {
    console.error('初始化任务地图失败:', error)
    if (mapContainer) {
      mapContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">地图加载失败: ${error.message}</div>`
    }
  }
}

// 转换路径点为SLAM地图坐标
const convertPathToSlamCoordinates = (pathPoints) => {
  return pathPoints.map(point => {
    // 确保坐标有效，避免NaN值
    // 使用世界坐标而不是像素坐标
    const x = parseFloat(point?.worldX || point?.lon || point?.x || 0);
    const y = parseFloat(point?.worldY || point?.lat || point?.y || 0);
    
    // 确保坐标是有效数字
    const validX = isNaN(x) ? 0 : x;
    const validY = isNaN(y) ? 0 : y;
    
    // 返回 List[double, double] 格式 [x, y]
    return [validX, validY]
  })
}

// 更新SLAM地图上的小车位置
const updateCarPositionOnSlamMap = () => {
  if (!viewer || !viewer.contentWindow || !viewer.contentWindow.SlamMapViewer) {
    return
  }
  
  if (carRealTimeData.value.longitude && carRealTimeData.value.latitude) {
    // 直接使用经纬度作为像素坐标，确保与路径点使用相同的坐标系统
    const carPosition = {
      x: carRealTimeData.value.longitude,
      y: carRealTimeData.value.latitude,
      angle: carRealTimeData.value.angle || 0,
      isPixelCoord: true // 标记为像素坐标，避免坐标转换
    }
    // console.log('Setting car position:', carPosition);
    viewer.contentWindow.SlamMapViewer.setCarPosition(carPosition)
  }
}
</script>

<style scoped>
#task-page {
  height: 100%;
  width: 100%;
}

#task-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 保存成功消息样式 */
.saved-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4ade80;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* 弹窗过渡动画 */
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
  transform: scale(0.95);
}
</style>

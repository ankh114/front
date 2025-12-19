import { createRouter, createWebHistory } from 'vue-router'
import MapMonitor from '@/views/MapMonitor.vue'
import DeviceManage from '@/views/DeviceManage.vue'
import TaskPlan from '@/views/TaskPlan.vue'
import IssueManage from '@/views/IssueManage.vue'

const routes = [
  { path: '/', redirect: '/map' }, // 默认跳转地图监控
  { path: '/map', component: MapMonitor, name: '地图监控' },
  { path: '/device', component: DeviceManage, name: '设备管理' },
  { path: '/task', component: TaskPlan, name: '任务规划' },
  { path: '/issue', component: IssueManage, name: '问题管理' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
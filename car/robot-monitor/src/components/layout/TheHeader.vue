<template>
  <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
    <div class="flex items-center gap-2">
      <i class="fa fa-robot text-primary text-2xl"></i>
      <h1 class="text-xl font-bold text-primary">无人巡检小车监控平台</h1>
    </div>
    
    <div class="flex items-center gap-6">
      <!-- 页面导航（通过路由跳转） -->
      <nav class="hidden md:flex items-center gap-1">
        <button 
          @click="$router.push('/map')" 
          :class="['px-4 py-2 text-sm font-medium rounded-md', $route.path === '/map' ? 'bg-primary/10 text-primary' : '']"
        >
          地图监控
        </button>
        <button 
          @click="$router.push('/device')" 
          :class="['px-4 py-2 text-sm font-medium rounded-md', $route.path === '/device' ? 'bg-primary/10 text-primary' : '']"
        >
          设备管理
        </button>
        <button 
          @click="$router.push('/task')" 
          :class="['px-4 py-2 text-sm font-medium rounded-md', $route.path === '/task' ? 'bg-primary/10 text-primary' : '']"
        >
          任务规划
        </button>
        <button 
          @click="$router.push('/issue')" 
          :class="['px-4 py-2 text-sm font-medium rounded-md', $route.path === '/issue' ? 'bg-primary/10 text-primary' : '']"
        >
          问题管理
        </button>
      </nav>
      
      <!-- 用户信息 -->
      <div class="flex items-center gap-3">
        <span class="hidden md:inline-block text-sm">管理员</span>
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <i class="fa fa-user"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// 无需额外逻辑，仅负责导航跳转
</script>
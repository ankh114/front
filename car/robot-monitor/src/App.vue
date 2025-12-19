<template>
  <div class="bg-gray-50 text-dark overflow-hidden h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧边栏 -->
      <Sidebar />
      
      <!-- 页面内容（路由出口） -->
      <router-view class="flex-1 overflow-hidden relative" />
    </main>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<style scoped>
/* 全局布局样式 */
main {
  height: calc(100vh - 4rem); /* 减去导航栏高度 */
}
</style>
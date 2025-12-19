<template>
  <div class="h-full flex flex-col">
    <!-- 页面标题和操作区 -->
    <div class="p-6 border-b flex justify-between items-center">
      <h2 class="text-xl font-bold">设备管理</h2>
      <div class="flex gap-3">
        <div class="relative">
          <input type="text" placeholder="搜索设备..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
          <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
        <button class="btn-primary">
          <i class="fa fa-plus mr-1"></i> 添加设备
        </button>
      </div>
    </div>
    
    <!-- 设备列表 -->
    <div class="flex-1 overflow-y-auto p-6
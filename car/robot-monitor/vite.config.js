import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 配置@别名指向src目录
    }
  },
  // 配置Cesium（解决Cesium加载问题）
  define: {
    'CESIUM_BASE_URL': JSON.stringify('node_modules/cesium/Build/Cesium')
  }
})
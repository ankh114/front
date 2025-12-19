import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 引入外部资源（图标库）
import 'font-awesome/css/font-awesome.min.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
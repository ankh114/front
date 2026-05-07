// API请求基础配置
import axios from 'axios';

// 后端API基础URL
// 可以根据实际情况修改
const API_BASE_URL = '/api';


// axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 设置10秒超时
  timeoutErrorMessage: '请求超时，请检查网络连接或服务器状态'
});

// 请求队列管理器
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.running = 0;
  }

  // 添加请求到队列
  add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  // 处理队列
  processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.running++;

    requestFn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.processQueue();
      });
  }

  // 清空队列
  clear() {
    this.queue = [];
  }

  // 获取队列状态
  getStatus() {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// 创建全局请求队列实例
const requestQueue = new RequestQueue();

// 通用请求函数
async function request(url, method = 'GET', data = null, headers = {}, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
    useQueue = true,
    ...axiosOptions
  } = options;

  // 创建请求函数
  const requestFn = async () => {
    let retries = 0;
    let lastError;

    while (retries <= maxRetries) {
      try {
        const response = await apiClient({
          url,
          method,
          data,
          headers,
          ...axiosOptions
        });
        
        return { data: response.data };
      } catch (error) {
        lastError = error;
        
        // 检查是否应该重试
        const shouldRetry = retries < maxRetries && (
          // 网络错误
          !error.response ||
          // 可重试的HTTP状态码
          retryableStatuses.includes(error.response.status)
        );

        if (shouldRetry) {
          // 指数退避策略
          const delay = retryDelay * Math.pow(2, retries) + Math.random() * 1000;
          retries++;
          console.log(`请求失败，${delay}ms后重试 (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // 处理axios错误
          if (error.response) {
            // 服务器返回错误响应
            let errorMessage = error.response.data.detail || `请求失败: ${error.response.status}`;
            // 确保错误信息是字符串
            if (typeof errorMessage !== 'string') {
              errorMessage = JSON.stringify(errorMessage);
            }
            throw new Error(errorMessage);
          } else if (error.request) {
            // 请求发出但没有收到响应
            throw new Error('网络错误，服务器无响应');
          } else {
            // 请求配置错误
            throw new Error('请求配置错误: ' + error.message);
          }
        }
      }
    }

    // 如果所有重试都失败，抛出最后一个错误
    throw lastError;
  };

  // 使用队列控制并发
  if (useQueue) {
    return requestQueue.add(requestFn);
  } else {
    return requestFn();
  }
}

// 汽车管理API
export const carApi = {
  // 获取所有汽车（带设备信息）
  get: () => request('/cars/', 'GET'),
  
  // 获取单个汽车（带设备信息）
  getById: (id) => request(`/cars/${id}`, 'GET'),
  
  // 创建汽车
  post: (car) => request('/cars/', 'POST', car),
  
  // 更新汽车
  update: (id, car) => request(`/cars/${id}`, 'PATCH', car),
  
  // 删除汽车
  delete: (id) => request(`/cars/${id}`, 'DELETE'),
  
  // 绑定设备到汽车
  bindDevice: (carId, deviceId) => request(`/cars/${carId}/bind_device/${deviceId}`, 'POST'),
  
  // 解绑设备
  unbindDevice: (carId, deviceId) => request(`/cars/${carId}/unbind_device/${deviceId}`, 'DELETE'),
  
  // 获取汽车状态
  getStatus: (id) => request(`/cars/${id}/status`, 'GET')
};

// 设备管理API
export const deviceApi = {
  // 获取所有设备
  get: () => request('/devices/', 'GET'),
  
  // 获取单个设备
  getById: (id) => request(`/devices/${id}`, 'GET'),
  
  // 创建设备
  post: (device) => request('/devices/', 'POST', device),
  
  // 更新设备
  update: (id, device) => request(`/devices/${id}`, 'PATCH', device),
  
  // 删除设备
  delete: (id) => request(`/devices/${id}`, 'DELETE')
};

// 任务管理API
export const taskApi = {
  // 获取所有任务列表
  get: () => request('/tasks/', 'GET'),
  
  // 获取单个任务详情
  getById: (id) => request(`/tasks/${id}`, 'GET'),
  
  // 创建基础任务
  post: (task) => request('/tasks/', 'POST', task),
  
  // 给任务绑定路径
  bindPath: (taskId, pathId) => request(`/tasks/${taskId}/bind_path/${pathId}`, 'PUT'),
  
  // 指派车辆（仅绑定）
  assignCar: (taskId, carId) => request(`/tasks/${taskId}/assign_car/${carId}`, 'POST'),
  
  // 开始/继续任务
  start: (taskId) => request(`/tasks/${taskId}/start`, 'POST'),
  
  // 暂停任务
  pause: (taskId) => request(`/tasks/${taskId}/pause`, 'POST'),
  
  // 继续任务
  resume: (taskId) => request(`/tasks/${taskId}/resume`, 'POST'),
  
  // 完成任务
  finish: (taskId) => request(`/tasks/${taskId}/finish`, 'POST'),
  
  // 删除任务
  delete: (taskId) => request(`/tasks/${taskId}`, 'DELETE'),
  
  // 更新任务
  update: (taskId, task) => request(`/tasks/${taskId}`, 'PATCH', task),
  
  // 解绑小车
  unbindCar: (taskId) => request(`/tasks/${taskId}/unbind_car`, 'POST')
};

// 路径管理API
export const pathApi = {
  // 查询路径列表
  get: () => request('/paths/', 'GET'),
  
  // 创建路径
  post: (path) => request('/paths/', 'POST', path),
  
  // 查询单个路径详情
  getById: (id) => request(`/paths/${id}`, 'GET'),
  
  // 更新路径(支持只改名字)
  update: (id, path) => request(`/paths/${id}`, 'PATCH', path),
  
  // 删除指定路径
  delete: (id) => request(`/paths/${id}`, 'DELETE')
};

// 机器人管理API（模拟实现）
export const robotApi = {
  getStatus: (id) => Promise.resolve({ data: {
    battery: 78,
    speed: 0.8,
    temperature: 32,
    signal: 92,
    status: 'running'
  }}),
  sendCommand: (id, command) => Promise.resolve({ data: { success: true }})
};

// 地图管理API
export const mapApi = {
  // 获取所有地图数据
  get: () => request('/maps/', 'GET'),
  
  // 获取单个地图数据
  getById: (id) => request(`/maps/${id}`, 'GET'),
  
  // 上传地图文件
  upload: (formData) => request('/maps/upload', 'POST', formData, {}, { headers: { 'Content-Type': 'multipart/form-data' } }),
  
  // 更新地图数据
  update: (id, mapData) => request(`/maps/${id}`, 'PATCH', mapData),
  
  // 删除地图数据
  delete: (id) => request(`/maps/${id}`, 'DELETE')
};

// 任务分发API（对应project后端接口）
export const missionApi = {
  // 发送任务到后端
  dispatch: (missionData) => request('/missions/dispatch', 'POST', missionData),
  // 获取任务执行器信息
  getTaskExecutor: (taskId) => request(`/missions/tasks/${taskId}/executor`, 'GET')
};

// 问题管理API
export const issueApi = {
  // 获取问题列表（支持按task_id筛选）
  getAll: (taskId = null) => {
    let url = '/problems/';
    if (taskId) {
      url += `?task_id=${taskId}`;
    }
    return request(url, 'GET');
  },
  
  // 获取单个问题详情
  getById: (id) => request(`/problems/${id}`, 'GET'),
  
  // 创建新问题
  create: (problem) => request('/problems', 'POST', problem),
  
  // 更新问题信息
  update: (id, problem) => request(`/problems/${id}`, 'PATCH', problem),
  
  // 删除问题
  delete: (id) => request(`/problems/${id}`, 'DELETE')
};

// 定时任务API
export const scheduleApi = {
  // 创建定时任务
  post: (schedule) => request('/schedules/', 'POST', schedule),
  
  // 获取定时任务列表
  get: () => request('/schedules/', 'GET'),
  
  // 获取单个定时任务详情
  getById: (id) => request(`/schedules/${id}`, 'GET'),
  
  // 更新定时任务
  update: (id, schedule) => request(`/schedules/${id}`, 'PATCH', schedule),
  
  // 删除定时任务
  delete: (id) => request(`/schedules/${id}`, 'DELETE'),
  
  // 给定时任务绑定路径
  bindPath: (scheduleId, pathId) => request(`/schedules/${scheduleId}/bind_path/${pathId}`, 'PUT')
};


// 配置文件
export const config = {
  // WebSocket服务器URL前缀
  wsUrlPrefix: 'ws://192.168.0.154:8000',
  
  // API服务器URL前缀
  apiUrlPrefix: 'http://192.168.0.154:8000',
  
  // WebSocket路径模板
  wsPathTemplate: '/history/{carId}/monitor'
};

// 生成WebSocket连接URL
export const getWebSocketUrl = (carId) => {
  return config.wsUrlPrefix + config.wsPathTemplate.replace('{carId}', carId);
};

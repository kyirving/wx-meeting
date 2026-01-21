// app.js
App({
  // 全局数据
  globalData: {
    // ✅ 直接定义，不会出现 undefined
    config: {
      API_BASE_URL: 'http://localhost:3000',
      DEBUG: true
    }
  },
  
  data: {
    baseUrl: 'http://172.16.8.105:8000',
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})

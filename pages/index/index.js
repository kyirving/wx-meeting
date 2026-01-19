// index.js
const app = getApp()

Page({
  data: {
    isRecording: false,
    recordingTime: '00:00:00',
    timer: null,
    seconds: 0,
    recorderManager: null,
    currentFilePath: '' // 当前录音文件路径
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '会议'
    });
    
    // 初始化录音管理器
    this.initRecorder();
  },

  /**
   * 初始化录音管理器
   */
  initRecorder() {
    const recorderManager = wx.getRecorderManager();
    
    // 录音配置
    const options = {
      duration: 60000 * 60, // 最长60分钟
      sampleRate: 16000,    // 采样率
      numberOfChannels: 1,  // 单声道
      encodeBitRate: 48000, // 码率
      format: 'mp3',        // 格式
      frameSize: 50         // 帧大小
    };
    
    // 录音开始回调
    recorderManager.onStart(() => {
      console.log('录音开始');
    });
    
    // 录音停止回调
    recorderManager.onStop((res) => {
      console.log('录音停止', res);
      const { tempFilePath, duration, fileSize } = res;
      
      // 保存文件路径，用于后续上传
      this.setData({ currentFilePath: tempFilePath });
      
      // 显示录音信息
      console.log('录音文件:', {
        路径: tempFilePath,
        时长: duration + 'ms',
        大小: (fileSize / 1024 / 1024).toFixed(2) + 'MB'
      });
      
      // 自动保存到本地
      this.saveAudioFile(tempFilePath);
    });
    
    // 录音错误处理
    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      wx.showToast({
        title: '录音失败',
        icon: 'error'
      });
      this.setData({ isRecording: false });
      if (this.data.timer) {
        clearInterval(this.data.timer);
        this.setData({ timer: null });
      }
    });
    
    this.setData({ recorderManager });
    this.data.recorderManager = recorderManager;
  },

  /**
   * 切换录音状态
   */
  toggleRecording() {
    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  /**
   * 开始录音
   */
  startRecording() {
    this.setData({ 
      isRecording: true, 
      seconds: 0, 
      recordingTime: '00:00:00',
      currentFilePath: '' // 清空前一个文件路径
    });
    
    // 启动计时器
    this.data.timer = setInterval(() => {
      const seconds = this.data.seconds + 1;
      this.setData({
        seconds: seconds,
        recordingTime: this.formatTime(seconds)
      });
    }, 1000);

    // 开始录音
    this.data.recorderManager.start({
      duration: 60000 * 30, // 30分钟
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
      frameSize: 50
    });

    wx.showToast({
      title: '会议开始',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 停止录音
   */
  stopRecording() {
    clearInterval(this.data.timer);
    this.setData({ 
      isRecording: false, 
      timer: null 
    });

    // 停止录音
    this.data.recorderManager.stop();
    
    // 弹窗询问（在onStop回调后会执行）
    wx.showModal({
      title: '会议结束',
      content: '录音已保存，是否立即生成纪要？',
      confirmText: '生成',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          // 检查是否有录音文件
          if (this.data.currentFilePath) {
            this.generateSummary();
          } else {
            wx.showToast({
              title: '请等待录音保存',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  /**
   * 保存音频文件到本地
   */
  saveAudioFile(tempFilePath) {
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: (res) => {
        const savedFilePath = res.savedFilePath;
        console.log('文件保存成功:', savedFilePath);
        
        // 保存到本地缓存，方便稍后使用
        this.saveToHistory(savedFilePath);
        
        // 可选：自动上传到服务器
        // this.uploadAudio(savedFilePath);
      },
      fail: (err) => {
        console.error('保存文件失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 保存到历史记录
   */
  saveToHistory(filePath) {
    const history = wx.getStorageSync('audioHistory') || [];
    const record = {
      filePath: filePath,
      time: new Date().toLocaleString(),
      duration: this.data.seconds,
      recordingTime: this.data.recordingTime
    };
    
    history.unshift(record); // 添加到开头
    if (history.length > 20) history.pop(); // 最多保存20条
    
    wx.setStorageSync('audioHistory', history);
    console.log('已保存到历史记录');
  },

  /**
   * 生成纪要
   */
  generateSummary() {
    wx.showLoading({ 
      title: 'AI生成纪要中...',
      mask: true
    });
    
    // 如果有文件路径，先上传再分析
    if (this.data.currentFilePath) {
      this.uploadAndAnalyze(this.data.currentFilePath);
    } else {
      wx.hideLoading();
      wx.showToast({
        title: '录音文件不存在',
        icon: 'error'
      });
    }
  },

  /**
   * 上传并分析音频
   */
  uploadAndAnalyze(filePath) {
    wx.uploadFile({
      url: 'https://your-server.com/api/analyze', // 替换为你的服务器地址
      filePath: filePath,
      name: 'audio',
      formData: {
        'duration': this.data.seconds,
        'timestamp': Date.now(),
        "meeting_name": "test"
      },
      success: (res) => {
        wx.hideLoading();
        
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            wx.showToast({
              title: '生成成功',
              icon: 'success'
            });
            
            // 跳转到结果页面
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/summary/summary?data=' + encodeURIComponent(JSON.stringify(data.result))
              });
            }, 1000);
          } else {
            wx.showToast({
              title: data.message || '生成失败',
              icon: 'error'
            });
          }
        } catch (e) {
          wx.showToast({
            title: '服务器响应错误',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传失败:', err);
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
        
        // 保存到待上传队列
        this.saveToUploadQueue(filePath);
      }
    });
  },

  /**
   * 保存到待上传队列
   */
  saveToUploadQueue(filePath) {
    const queue = wx.getStorageSync('uploadQueue') || [];
    queue.push({
      filePath: filePath,
      time: Date.now(),
      duration: this.data.seconds
    });
    wx.setStorageSync('uploadQueue', queue);
    
    wx.showModal({
      title: '提示',
      content: '网络异常，文件已保存到本地，可在"最近草稿"中重新上传',
      showCancel: false
    });
  },

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  },

  /**
   * 点击上传录音文件
   */
  onTapUpload() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a', 'aac'],
      success: (res) => {
        const tempFile = res.tempFiles[0];
        console.log('选择文件:', tempFile);
        
        wx.showLoading({ 
          title: '上传分析中...',
          mask: true 
        });
        
        // 上传并分析
        this.uploadAndAnalyze(tempFile.path);
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 点击最近草稿
   */
  onTapRecent() {
    wx.switchTab({
      url: '/pages/history/history',
    });
  },

  onUnload() {
    // 页面卸载时清理资源
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    if (this.data.isRecording) {
      this.data.recorderManager.stop();
    }
  }
});
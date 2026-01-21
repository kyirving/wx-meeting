// pages/ai/ai.js
const app = getApp();

Page({
  data: {
    inputValue: '',
    msgList: [
      { type: 'ai', content: '您好，我是您的智能会议助手。您可以问我关于会议记录的任何问题，或者让我帮您总结会议内容。' }
    ],
    toView: '',
    isLoading: false
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMsg() {
    const text = this.data.inputValue.trim();
    if (!text || this.data.isLoading) return;

    // 1. 添加用户消息
    const userMsg = { type: 'user', content: text };
    const newMsgList = [...this.data.msgList, userMsg];

    this.setData({
      msgList: newMsgList,
      inputValue: '',
      toView: `msg-${newMsgList.length - 1}`,
      isLoading: true
    });

    // 2. 发送请求
    wx.request({
      url: `${app.data.baseUrl}/api/rag/search`, // 假设的 AI 对话接口
      method: 'POST',
      data: {
        message: text
      },
      success: (res) => {
        const responseData = res.data;
        // 假设后端返回结构: { answer: "AI的回答内容" }
        // 请根据实际接口调整
        const answer = responseData.answer || responseData.reply || responseData.content || '抱歉，我暂时无法回答这个问题。';

        const aiMsg = { type: 'ai', content: answer };
        const updatedList = [...this.data.msgList, aiMsg];
        
        this.setData({
          msgList: updatedList,
          toView: `msg-${updatedList.length - 1}`,
          isLoading: false
        });
      },
      fail: (err) => {
        console.error('AI request failed', err);
        const errorMsg = { type: 'ai', content: '网络请求失败，请稍后重试。' };
        const updatedList = [...this.data.msgList, errorMsg];
        
        this.setData({
          msgList: updatedList,
          toView: `msg-${updatedList.length - 1}`,
          isLoading: false
        });
      }
    });
  }
})

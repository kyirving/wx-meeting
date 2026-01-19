// pages/ai/ai.js
Page({
  data: {
    inputValue: '',
    msgList: [
      { type: 'ai', content: '你好，我是AI会议助手，有什么可以帮你的吗？' }
    ],
    toView: ''
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMsg() {
    if (!this.data.inputValue.trim()) return;

    const userMsg = { type: 'user', content: this.data.inputValue };
    const newMsgList = [...this.data.msgList, userMsg];

    this.setData({
      msgList: newMsgList,
      inputValue: '',
      toView: `msg-${newMsgList.length - 1}`
    });

    // 模拟AI回复
    setTimeout(() => {
      const aiMsg = { type: 'ai', content: '收到，我正在分析您的需求...' };
      const updatedList = [...newMsgList, aiMsg];
      this.setData({
        msgList: updatedList,
        toView: `msg-${updatedList.length - 1}`
      });
    }, 1000);
  }
})

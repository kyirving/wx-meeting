// pages/history/history.js
Page({
  data: {
    meetingList: [
      { id: 1, title: '产品需求评审会', date: '2023-10-27 10:00', duration: '01:30:00', status: 'completed' },
      { id: 2, title: '周例会', date: '2023-10-26 14:00', duration: '00:45:00', status: 'completed' },
      { id: 3, title: '技术分享会', date: '2023-10-25 16:00', duration: '02:00:00', status: 'processing' },
    ]
  },

  onTapDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看详情: ' + id,
      icon: 'none'
    });
  }
})

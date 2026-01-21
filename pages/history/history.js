// pages/history/history.js
const app = getApp();

Page({
  data: {
    meetingList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    isRefreshing: false,
    
    // 弹窗相关
    showDetailModal: false,
    currentMeeting: null
  },

  onLoad() {
    this.loadData(true);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    if (this.data.isLoading) return;
    this.setData({ isRefreshing: true });
    this.loadData(true);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.isLoading || !this.data.hasMore) return;
    this.loadData(false);
  },

  /**
   * 加载数据
   * @param {boolean} reset 是否重置（刷新）
   */
  loadData(reset = false) {
    this.setData({ isLoading: true });

    const nextPage = reset ? 1 : this.data.page + 1;

    wx.request({
      url: `${app.data.baseUrl}/api/meetings/history`,
      method: 'GET',
      data: {
        page: nextPage,
        page_size: this.data.pageSize
      },
      success: (res) => {
        // 假设后端直接返回 { page, page_size, items } 结构，或者嵌套在 data 中
        // 根据实际接口响应结构调整，这里假设 res.data 直接就是该结构
        const responseData = res.data; 
        
        // 容错处理
        if (!responseData || !responseData.items) {
          console.error('Invalid response format', responseData);
          this.setData({ isLoading: false, isRefreshing: false });
          return;
        }

        const { items, page, page_size } = responseData;
        
        // 格式化数据（如果后端返回的格式不满足前端展示需求）
        const formattedItems = items.map(item => ({
          ...item,
          // 如果后端返回的时间格式需要处理，可以在这里处理
          // date: this.formatDate(new Date(item.created_at)) 
          
          // 如果后端没有返回 minutes_preview，这里给个默认值测试用
          minutes_preview: item.minutes_preview || '# 默认会议纪要\n\n## 1. 主要议题\n- 讨论了项目进度\n- 确定了下一步计划\n\n## 2. 待办事项\n- [ ] 完成接口联调\n- [ ] 优化 UI 细节'
        }));

        const newList = reset ? formattedItems : [...this.data.meetingList, ...formattedItems];
        
        this.setData({
          meetingList: newList,
          page: page,
          // 判断是否还有更多：当前返回数量等于请求的 pageSize，且当前列表总数小于总数（如果有 total 字段更好）
          // 这里简化判断：如果返回的 items 数量小于 pageSize，说明没有下一页了
          hasMore: items.length >= page_size, 
          isLoading: false,
          isRefreshing: false
        });

        if (reset) {
          wx.stopPullDownRefresh();
        }
      },
      fail: (err) => {
        console.error('Request failed', err);
        this.setData({ isLoading: false, isRefreshing: false });
        if (reset) wx.stopPullDownRefresh();
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  /**
   * 点击列表项，打开详情弹窗
   */
  onTapDetail(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.meetingList.find(i => i.id === id);
    
    if (item) {
      this.setData({
        currentMeeting: item,
        showDetailModal: true
      });
    }
  },

  /**
   * 关闭详情弹窗
   */
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      currentMeeting: null
    });
  },

  /**
   * 阻止冒泡
   */
  preventBubble() {},

  /**
   * 复制内容
   */
  copyContent() {
    if (this.data.currentMeeting && this.data.currentMeeting.minutes_preview) {
      wx.setClipboardData({
        data: this.data.currentMeeting.minutes_preview,
        success: () => {
          wx.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    }
  }
})

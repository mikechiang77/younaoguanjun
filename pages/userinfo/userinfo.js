const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    wxavatarUrl: null,
    wxnickName: '',
    returnPage: '', // 存储返回的页面路径
    returnParams: {} // 存储返回页面需要的参数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取需要返回的页面和参数
    if (options.returnPage) {
      this.setData({
        returnPage: decodeURIComponent(options.returnPage)
      });
    }
    
    // 如果有其他参数，解析并保存
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({
          returnParams: params
        });
      } catch (e) {
        console.error('解析参数出错:', e);
      }
    }
  },

  // 获取头像
  gettourl: function(e) {
    console.log('头像地址:', e.detail.avatarUrl);
    this.setData({ 
      wxavatarUrl: e.detail.avatarUrl
    });
    wx.setStorageSync('useravatarUrl', e.detail.avatarUrl);
  },
  
  // 昵称输入监听
  onNicknameInput: function(e) {
    this.setData({
      wxnickName: e.detail.value
    });
  },
  
  // 获取昵称并保存
  formSubmit: function(e) {
    let nickname = e.detail.value.nickname;
    console.log('昵称：', nickname);
    
    if (nickname) {
      // 用户有输入昵称
      this.setData({ 
        wxnickName: nickname
      });
      wx.setStorageSync('usernickname', nickname);
      
      // 如果头像已获取，返回原页面
      if (this.data.wxavatarUrl) {
        this.returnToOriginalPage();
      } else {
        wx.showToast({
          title: '请选择头像',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        icon: 'error',
        title: '请获取昵称',
      });
    }
  },
  
  // 返回原始页面
  returnToOriginalPage: function() {
    // 将用户信息保存到全局变量
    app.globalData = app.globalData || {};
    app.globalData.wxnickName = this.data.wxnickName;
    app.globalData.wxavatarUrl = this.data.wxavatarUrl;
    
    if (this.data.returnPage) {
      // 构建返回URL
      let url = this.data.returnPage;
      
      // 如果有参数，添加到URL
      if (Object.keys(this.data.returnParams).length > 0) {
        url += '?';
        for (const key in this.data.returnParams) {
          url += `${key}=${this.data.returnParams[key]}&`;
        }
        url = url.slice(0, -1); // 移除最后的&符号
      }
      
      // 返回原页面
      wx.redirectTo({
        url: url,
        fail: function(err) {
          console.error('页面跳转失败:', err);
          // 尝试使用switchTab（如果是tabBar页面）
          wx.switchTab({
            url: url.split('?')[0],
            fail: function(err) {
              console.error('switchTab跳转失败:', err);
              // 如果都失败了，返回首页
              wx.redirectTo({
                url: '/pages/index/index'
              });
            }
          });
        }
      });
    } else {
      // 没有指定返回页面，默认返回首页
      wx.redirectTo({
        url: '/pages/index/index'
      });
    }
  }
})

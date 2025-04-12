var app = getApp()      //用于取全局变量

Page({
  
  data:{
       canIUse: wx.canIUse('button.open-type.getUserInfo'),
       isshowusername: false,
       wxavatarUrl: null,
       wxnickName: '',
       shouquan: 1,
       userInfo: '',  //初始为空
       isShowUserInfo: false, // 控制用户信息弹窗显示
       defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    },
    
  onLoad: function() {
    console.log('页面加载 - 准备显示最新题目');
    console.log('当前 cache_total 值:', wx.getStorageSync('cache_total'));
    
    // 添加加载提示
    wx.showLoading({
      title: '加载中...',
    });
    
    // 调用云函数获取题目数据
    wx.cloud.callFunction({
      name: 'playlist',
      success: (res) => {
        console.log('res.result.total的值', res.result.all);
        wx.setStorageSync('cache_total', res.result.total); // 题目数量存到缓存里
        wx.setStorageSync('cache_all', res.result.all);     // 题目数组存到缓存里
        console.log('res的值', res);
        app.global_all = res.result.all; // 赋值到全局变量里
        
        if (res.result.all == null) {     // 如果题目数组是空
          wx.setStorageSync('cache_all', res.result.tasks);
          app.global_all = res.result.tasks;
        }
        
        console.log('全局变量global_all的值', app.global_all);
        wx.hideLoading(); // 隐藏加载提示
      },
      fail: function(error) {
        console.error('云函数调用失败:', error);
        wx.hideLoading();
        // 显示错误信息但不阻止页面显示
        wx.showToast({
          title: '数据加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    });

    // 检查是否已有用户信息
    const wxnickName = wx.getStorageSync('usernickname');
    const wxavatarUrl = wx.getStorageSync('useravatarUrl');
    
    if (wxnickName && wxavatarUrl) {
      this.setData({
        wxnickName: wxnickName,
        wxavatarUrl: wxavatarUrl
      });
    }
  },

  shownewone: function() {
    // 检查是否已获取用户头像和昵称
    const wxnickName = wx.getStorageSync('usernickname');
    const wxavatarUrl = wx.getStorageSync('useravatarUrl');
    
    if (!wxnickName || !wxavatarUrl) {
      // 如果没有用户信息，显示获取用户信息的弹窗
      this.setData({
        isShowUserInfo: true
      });
      return;
    }
    
    // 检查缓存数据是否已加载
    const cacheAll = wx.getStorageSync('cache_all');
    
    console.log('跳转前缓存数据检查:', {
      cacheAll: cacheAll ? (Array.isArray(cacheAll) ? `数组长度:${cacheAll.length}` : typeof cacheAll) : 'undefined'
    });
    
    if (cacheAll && Array.isArray(cacheAll) && cacheAll.length > 0) {
      // 设置题目为最新记录（数组的最后一个元素）
      wx.setStorageSync('cache_total', cacheAll.length); // 设置为数组长度
      wx.navigateTo({url: '../shownewone/shownewone'});
    } else {
      // 需要重新加载数据
      wx.showLoading({
        title: '加载题目数据...',
      });
      
      wx.cloud.callFunction({
        name: 'playlist',
        success: (res) => {
          wx.hideLoading();
          if (res.result && res.result.all && Array.isArray(res.result.all) && res.result.all.length > 0) {
            // 更新缓存和全局变量
            wx.setStorageSync('cache_all', res.result.all);
            // 设置题目为最新记录（数组的第一个元素）
            wx.setStorageSync('cache_total', 1);
            app.global_all = res.result.all;
            console.log('已重新加载题目数据到缓存');
            
            // 数据加载成功后继续跳转
            wx.navigateTo({url: '../shownewone/shownewone'});
          } else {
            wx.showModal({
              title: '加载失败',
              content: '题目数据无效，请联系管理员',
              showCancel: false
            });
          }
        },
        fail: (error) => {
          wx.hideLoading();
          wx.showModal({
            title: '加载失败',
            content: '无法获取题目数据，请检查网络连接',
            showCancel: false
          });
          console.error('云函数调用失败:', error);
        }
      });
    }
  },
  
  // 获取头像
  gettourl(e) {
    console.log('头像地址:', e.detail.avatarUrl);
    this.setData({ 
      wxavatarUrl: e.detail.avatarUrl
    });
    wx.setStorageSync('useravatarUrl', e.detail.avatarUrl);
  },
  
  // 获取昵称并保存
  formSubmit(e) {
    let nickname = e.detail.value.nickname;
    console.log('昵称：', nickname);
    
    if (nickname) {
      // 用户有输入昵称或使用了微信昵称
      this.setData({ 
        wxnickName: nickname 
      });
      wx.setStorageSync('usernickname', nickname);
      
      // 如果头像已获取，关闭弹窗并继续进入答题页面
      if (this.data.wxavatarUrl) {
        this.setData({
          isShowUserInfo: false
        });
        
        // 获取缓存数据
        const cacheAll = wx.getStorageSync('cache_all');
        if (cacheAll && Array.isArray(cacheAll) && cacheAll.length > 0) {
          // 设置题目为最新记录（数组的最后一个元素）
          wx.setStorageSync('cache_total', cacheAll.length); // 设置为数组长度
        }
        
        wx.navigateTo({url: '../shownewone/shownewone'});
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
  
  // 关闭用户信息弹窗
  closeUserInfo() {
    this.setData({
      isShowUserInfo: false
    });
  },

  onShow: function () {
  },

  gotomanage(){
    wx.redirectTo({url: '../manage/manage'})
  },

  gotomanage1(){
    wx.redirectTo({url: '../manage1/manage1'})
  },

  gotonextpage(){
    wx.redirectTo({url: '../view/view'})
  },

  addtodb(){
    wx.redirectTo({url: '../adddata/adddata'})
  },

  showdb(){
    wx.redirectTo({url: '../showdata/adddata'})
  },

  tocount(){
    wx.redirectTo({url: '../count_demo/count_demo'})
  },

  tosearchdb(){
    wx.redirectTo({url: '../searchdb/searchdb'})
  },

  topage1(){
    wx.redirectTo({url: '../search_new/search_new'})
  },

  showall(){
    wx.redirectTo({url: '../showall/showall'})
  },

  showone(){
    wx.redirectTo({url: '../showone/showone'})
  },

  timecount(){
    wx.redirectTo({url: '../timecount/timecount'})
  },

  huxi(){
    wx.redirectTo({url: '../huxi/huxi'})
  },
})
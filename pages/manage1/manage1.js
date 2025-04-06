// pages/manage1/manage1.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    usernickname:'' , //初始为空
    avatarUrl: defaultAvatarUrl,
    useravatarUrl: defaultAvatarUrl,
    
  },

  

    	//获取头像
      gettourl(e) {
        console.log('头像地址:', e.detail.avatarUrl)    //真机预览这句执行了
        //let useravatarUrl = wx.getStorageSync('useravatarUrl');  
          //let useravatarUrl = e.detail.avatarUrl;  
       // userinfo['avatarUrl'] = e.detail.avatarUrl;
        this.setData({ 
          useravatarUrl: e.detail.avatarUrl,
          avatarUrl: e.detail.avatarUrl  // 重要：同时更新界面显示的变量
        });
        console.log('头像地址1:', this.data.useravatarUrl)   //显示了
        wx.setStorageSync('useravatarUrl', this.data.useravatarUrl);
      },

 //  获取昵称
 formSubmit(e) {
  console.log('昵称：', e.detail.value.nickname)
  if (e.detail.value.nickname != '') {
    // 同时更新两个变量，保持一致
    this.setData({ 
      usernickname: e.detail.value.nickname,
      nickName: e.detail.value.nickname  // 重要：同时更新界面显示的变量
    });
    wx.setStorageSync('usernickname', this.data.usernickname);
    console.log('昵称1：', this.data.usernickname)
    
    // 可以添加一个提示，告诉用户保存成功
    wx.showToast({
      title: '昵称保存成功',
      icon: 'success',
      duration: 2000
    });
  } else {
    // 保持原有代码
    wx.showToast({
      icon:'error',
      title: '请填入昵称',
    })
  }
},



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
//取出缓存中头像地址赋值给avatarUrl
var avatar = wx.getStorageSync('useravatarUrl'); //取出全局变量user当前用户头像 缓存？
this.setData({ avatarUrl: avatar });
  
  var usernickname = wx.getStorageSync('usernickname'); //取出全局变量user当前用户头像 缓存？
this.setData({ nickName: usernickname });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
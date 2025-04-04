// pages/manage/manage.js
var app = getApp()      //用于取全局变量

Page({

  /**
   * 页面的初始数据
   */
  data: {
    playlist:[], //存储云数据库中的数据
    usernickname:'' , //初始为空
    useravatarUrl:'' ,
  },

  //以下执行了
  getinfo(e) {
    wx.getUserInfo({
      //成功后会返回
      success:(res)=>{
        console.log(res);
      }
    })

    //获取code值
    wx.login({
      //成功放回
      success:(res)=>{
        console.log(res);
        let code=res.code
      }
    })

  },

  	//获取头像
    gettourl(e) {
      console.log('头像:', e.detail.avatarUrl)    //这句执行了
      //let useravatarUrl = wx.getStorageSync('useravatarUrl');  
     // userinfo['avatarUrl'] = e.detail.avatarUrl;
      this.setData({ useravatarUrl: e.detail.avatarUrl });
      wx.setStorageSync('useravatarUrl', this.data.useravatarUrl);
    },
    //  获取昵称
    formSubmit(e) {
      console.log('昵称：', e.detail.value.nickname)  //这句执行正确
      if (e.detail.value.nickname != '') {
       //let usernickname = wx.getStorageSync('usernickname');
       // userinfo['nickName'] = e.detail.value.nickname;  //usernifo应该是个数组
        //this.setData({ userinfo['nickName'] :e.detail.value.nickname });
        this.setData({ usernickname :e.detail.value.nickname });
        wx.setStorageSync('usernickname', this.data.usernickname);

      }else{
        wx.showToast({
          icon:'error',
          title: '请填入昵称',
        })
      }
    },
  


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  doadd(){
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env:'cloud1-4g9qgiuo73789486',  
    //   traceUser:true
    // });  
    
    wx.cloud.callFunction({
      // 云函数名称
      name: 'add',
      // 传给云函数的参数
      data: {
        a: 1,
        b: 2,
      },
      success: function(res) {
        console.log(res.result.sum) // 3
      },
      fail: console.error
    })
  },

  deleteall() {
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env:'cloud1-4g9qgiuo73789486',   //开发环境
    //   traceUser:true
    // });  

    wx.cloud.callFunction({
    name: 'delete_all',                //调用delete_all云函数
    })
  },

  getalldb() {
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env:'cloud1-4g9qgiuo73789486',   //开发环境
    //   traceUser:true
    // });  

    wx.cloud.callFunction({
    name: 'playlist',                //调用playlist云函数不行，调用add就行
    success: function(res) {
      console.log(res.result.total) // 这里显示
      console.log(res.result.batchTimes) // 这里显示
      console.log(res.result.all) //这里ok
      wx.setStorageSync('cache_total', res.result.total) //题目数量存到缓存里
      wx.setStorageSync('cache_all', res.result.all)    //题目数组存到缓存里，如何赋值到全局变量里

      app.global_all = res.result.all
      console.log('全局变量global_all的值', app.global_all)
    },
    fail: console.error
    })
  },

  gotoaddquestion(){
    wx.redirectTo({url: '../addquestion/addquestion'})
  },

  gotovoice(){
    wx.redirectTo({url: '../voice/voice'})
  },

  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
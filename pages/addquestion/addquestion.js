// pages/addquestion/addquestion.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {




  },

  onsubmit: function(event){
  console.log(event.detail.value);
  // 删除云环境初始化代码，使用app.js中的统一初始化
  // wx.cloud.init({                              //连上云端准备添加
  //   env:'cloud1-4g9qgiuo73789486',  
  //   traceUser:true                             //traceuser？
  // });  
  const db=wx.cloud.database();   
  const table1=db.collection("testdatabase")   //连上数据库准备添加
  table1.add({
    data:{
      tip1: event.detail.value.addtip1,  
      tip2: event.detail.value.addtip2,
      tip3: event.detail.value.addtip3,
      tip4: event.detail.value.addtip4,
      answer: event.detail.value.addanswer,
      reason: event.detail.value.addreason
    },
  })
  wx.redirectTo({url: '../index/index'})                                  //去首页
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
// pages/search_new/search_new.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ne:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   // var _this = this;
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env: 'cloud1-4g9qgiuo73789486' //云开发环境id
    // });
    //1、引用数据库，删除env参数，使用app.js中的统一环境   
    const db = wx.cloud.database();
    const _ = db.command
    db.collection('testdatabase').orderBy('date1','desc').where({
      date: _.gt(5)
    }).get({
      success: function(res) {
      console.log(res.data)   
        //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值      
        this.setData({
          ne: res.data
        })
      }
    })
  },

  querydata1: function () {
    var _this = this;
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env: 'cloud1-4g9qgiuo73789486' //云开发环境id
    // });
    //1、引用数据库，删除env参数，使用app.js中的统一环境  
    const db = wx.cloud.database();
    const _ = db.command
    db.collection('testdatabase').orderBy('date1','desc').where({
      date: _.gt(5)
    }).get({
      success: function(res) {
      console.log(res.data)   
        //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值      
        this.setData({
          ne: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
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
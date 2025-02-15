// pages/timecount/timecount.js
var init;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hour:0,
    minute:0,
    second:0,
    millisecond:0,
    timecount:'00:00',
    cost:0,
    flag:1,
    endtime:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  start:function(){
    clearInterval(init); //取消该定时
    var that=this; 
    that.setData({       //初始化都为0
      hour:0,
      minute:0,
      second:0,
      millisecond:0
    })
    init=setInterval(function(){  //设定一个定时器。按照指定的周期（以50毫秒计）来执行注册的回调函数: timer()
      that.timer()
    },1000);       //注意这里是1000毫秒，也就是每1秒回调刷新一次timer()
  },

  stop:function(){         //暂停
    clearInterval(init);  //取消该定时
  },

  Reset:function(){        //停止
    var that=this;
    clearInterval(init); //取消该定时
    that.setData({       //清0
      hour:0,
      minute:0,
      second:0,
      millisecond:0,
      timecount:'00:00'
    })
  },

  timer:function(){
    var that = this;
    console.log(that.data.second)   //输出秒数
    that.setData({
      millisecond:that.data.millisecond+5, //每次回调，millisecond+5
      second:that.data.second+1            //每次回调，second+1
    })

    if(that.data.second >= 60){    //秒数计到60分数+1，秒数清零
      that.setData({
        second:0,
        minute:that.data.minute+1
      })
    }

    that.setData({            //前端用timecount展现，只显示分和秒
      timecount:+that.data.minute+":"+that.data.second
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
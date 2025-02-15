// pages/count_demo/count_demo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
   count:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  /*
  onLoad: function (options) {
    const db=wx.cloud.database(),
    //创建更新指令
    const _=db.command
    const counters=db.collection('counters')
    //查询用户在counters集合中的数据
    db.collection('counters').get().then(res=>{
    console.log(res)
    if(res.data.length>0){
      //更新访问次数
      db.collection('counters').doc(res.data[0]._id).update({
        data:{
          count:_.inc(1)
        }
      })
      //在页面上显示的访问次数
      this.setData({
        count:++res.data[0].count
      })
    }else
    {
      //新增数据
      db.collection('counters').add({
        data:{
          count:1
        }
      }).then(res=>{
       this.setData({count:1})
      })
    }
  })
  },

  */

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
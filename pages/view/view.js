// pages/view/view.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip1:"绿色",
    tip2:"夏天",
    tip3:"椭圆",
    tip4:"红色",
    tip5:"西瓜",
    answernumber: "2",
    result:true,
    inputValue: "",
    useranswer: "",
    useranswer1: "",
    uid:""
  },

bindkeyinput: function(e){
  this.setData({
    useranswer: e.detail.value
  })
},

redirectBtn:
function () {
  wx.setStorageSync('useranswer', this.data.useranswer);
   let useranswer1 = this.data.useranswer
/*上面这行非常关键，如果用setdata就不行 let申明的变量是局部变量，该变量只会在最靠近{ }内的范围有效，出了{}之后，该变量就不能够再用了*/

if(useranswer1 == this.data.tip5)
//必须前面有this.data//
{wx.redirectTo({url: '../result/result'})}

else{wx.showModal({
  showCancel: false,
  title: '不对',
  content: '你离答案很近了，加油！',
success: function(res) {
      {
      console.log("用户答案正确")
      console.log(useranswer1)
  }
}
})}
},


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("用户名");
    var nickName = ''

    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        nickName = userInfo.nickName
        console.log(nickName)
        this.setData({uid: nickName})
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
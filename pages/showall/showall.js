// pages/showall/showall.js
//如果全局变量qnumber>0，则从qnumber+1那个记录开始展示题目
Page({
  data: {
    map:[], //存储云数据库中的数据
    nowdata:{}, //存储当前显示的值
    mapindex:1, //当前显示的序列号
    useranswer: "", //用户填空的数据，全局变量
    reason: "", //答案说明, 全局变量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;        //用that承接this中原始数据并操作后传给视图层
    wx.cloud.init({
      env:'cloud1-4g9qgiuo73789486',  
      traceUser:true
    });               
    const db=wx.cloud.database();   
    const banner=db.collection("testdatabase");  //指定要获取的请求集
    banner.get().then(res=>{  //banner.get()是个布尔值, true则执行res=>等于function(res)
      console.log(res);
      that.map=res;         //用that来接云端的数,操作完后用setdata传给视图

      var num = wx.getStorageSync('qnumber'); //取出全局变量题目序号
      //this.setData({ qnumber: qnumber }); 

      that.setData({        //setdata把数据从逻辑层发到渲染层, 同步改变this.data中数值
        map:res,                 //把that从云接到的数据集传到map中
        nowdata:that.map.data[num],  //把that.map中序号qnumber的数据传到nowdata中
      });
    }).catch(err=>{  //如果banner.get()出错,则function(err)处理err数据
      console.log(err);
    });
  },

  back:function(){
    var num=this.data.mapindex-1;     //题目序号减1
    if(num>0){
      this.setData({
        nowdata:this.data.map.data[num-1],   //把数据集中上一条记录传给nowdata
        mapindex:num     //mapindex在视图层而且数据会变，所以要用setdata
      });
    }else{
      //弹窗
      wx.showToast({
        title: '已经是第一道题了！',
        icon:'none',
        duration:1500
      })
    }
  },

  next:function(){
    var num=this.data.mapindex+1;
    var sizenum=this.data.map.data.length;  //获取当前长度
    if(num<sizenum+1){
      this.setData({
        nowdata:this.data.map.data[num-1],
        mapindex:num
      });
    }else{
      //弹窗
      wx.showToast({
        title: '已经是最后一道题了！',
        icon:'none',
        duration:1500
      })
    }
  },

  bindkeyinput: function(e){
    this.setData({
      useranswer: e.detail.value      //把用户填空的数据传给useranswer
    })
  },

redirectBtn:
function () {
 let useranswer1 = this.data.useranswer  //因为每次提交, 填空里的数据都不一样
/*以下理解可能有误：上面这行非常关键，如果用setdata就不行 let申明的变量是局部变量，该变量只会在最靠近{ }内的范围有效，出了{}之后，该变量就不能够再用了*/

if(useranswer1 == this.data.nowdata.answer)  //用户填空数据与当前数据记录里的答案比较
//必须前面有this.data//
{
 wx.setStorageSync('useranswer', this.data.nowdata.answer); //把当前正确答案存入全局变量
 wx.setStorageSync('reason', this.data.nowdata.reason); //把当前答案说明存入全局变量
 wx.setStorageSync('qnumber', this.data.mapindex); //把当前题目序号存入全局变量
 wx.redirectTo({url: '../result/result'})
}
else{wx.showModal({
  showCancel: false,
  title: '不对',
  content: '你离答案很近了，加油！',
})}
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
// pages/result/result.js
//这里展示答案说明，从上一个页面接收答案和答案说明
//下一题还去showall界面，只是nowdata要变成下一题，通过全局变量qnumber
Page({
  data: {
    hiddenmodalput: true,
   reason: "",
   num: null,
   hasrecord: 0,
   text1: 0,
   res:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
  },

  async onLoad() {                           //注意这里async是变异步为同步
    var useranswer = wx.getStorageSync('useranswer'); //取出全局变量useranswer当前答案
    this.setData({ useranswer: useranswer });
    var tip1 = wx.getStorageSync('tip1'); //取出全局变量提示1tip1
    this.setData({ tip1: tip1 });
    var tip2 = wx.getStorageSync('tip2'); //取出全局变量提示2
    this.setData({ tip2: tip2 });
    var tip3 = wx.getStorageSync('tip3'); //取出全局变量提示3
    this.setData({ tip3: tip3 });
    var tip4 = wx.getStorageSync('tip4'); //取出全局变量提示4
    this.setData({ tip4: tip4 });
    var reason = wx.getStorageSync('reason'); //取出全局变量reason当前答案说明
    this.setData({ reason: reason });
    var user = wx.getStorageSync('usernickname'); //取出全局变量user当前用户名 缓存？
    this.setData({ user: user });        //赋值给user
    var avatar = wx.getStorageSync('useravatarUrl'); //取出全局变量user当前用户头像 缓存？
    this.setData({ avatar: avatar });
    var useminute = wx.getStorageSync('useminute'); //取出全局变量当前题用时
    this.setData({ useminute: useminute });
    var usesecond = wx.getStorageSync('usesecond'); //取出全局变量当前题用时
    this.setData({ usesecond: usesecond });
    var qnumber = wx.getStorageSync('qnumber'); //取出全局变量当前题号, qnumber比显示题号少1
    this.setData({ show_qnumber: qnumber+1 });     //这里show_qnumber显示题号，那进入最新一题时qnumber是多少？

    this.setData({ first_total_seconds: useminute*60+usesecond });   //历史总时间缺省等于当前总时间

  var that=this;   //定义到这里，让that先获取外面方法的this    什么意思？
  var text1 = 0;
  var text2 = 0;
  let len = 0   //记录检索结果数
  const db=wx.cloud.database();   
  const table1=db.collection("score1")   

  console.log("执行查找历史答题时间前show_qnumber的值：",this.data.show_qnumber); 
  console.log("当前用户名：",user);       //当前用户是谁？
    await db.collection("score1").where({                  //这里await是变异步为同步
    qnumber: this.data.show_qnumber-1,                            //根据题号检索数据库，当前题号怎么取？ 总是能查到，不对
    username: this.data.user,                          //根据当前用户昵称检索，如果用户换昵称怎么办，不对？应该是user?
})
.get()
.then(res =>{  
      console.log("执行了查询，查询到记录：",res);     //res是检索结果数组，如果没有记录也显示，但数组为空
      this.setData({
        res: res.data})
        len = res.data.length
        console.log("查询结果res里len的值：",len);  //没执行？ 如果放在下一句之后就不执行
        this.setData({first_minute:res.data[0].minute})              //取出数据集中的初次用时
        this.setData({first_second:res.data[0].second})
        this.setData({first_total_seconds:res.data[0].total_seconds})     //查出初次总用秒数
    }
)
    .catch(err =>       //如果查不到就增加一条记录，这个有问题，因为查到0条记录也算成功
      table1.add({
        data:{
          qnumber: this.data.show_qnumber-1,         //注意这里又+1？  小猪第一次答题总不对没减去1
          username: user,
          minute: useminute,
          second: usesecond,
          total_seconds: useminute*60+usesecond                     //这里要换算成总秒数写入total_seconds
        },
  }),
  this.setData({first_minute:useminute}) ,       // 历史成绩就是本次成绩   
  this.setData({first_second:usesecond}) 
  )

  //以下计算本题的答题人数qusers
  var qusers = await db.collection("score1")
  .where({                 qnumber: this.data.show_qnumber-1,                           })    //该题号的所有答题人数
.count();
  var qusers = qusers.total;   
  console.log('result里qnumber的值', qnumber);
  this.setData({ qusers: qusers });
  console.log('qusers的值', qusers);

//以下计算本题比我慢的答题人数slower_users
const _ = db.command
console.log('first_total_seconds的值', this.data.first_total_seconds);

var slower_users = await db.collection("score1")
.where({qnumber: this.data.show_qnumber-1,  
        total_seconds: _.gt(this.data.first_total_seconds),      //大于当前人当前题的历史有效记录，第一次答题是没有历史记录的
})
.count();
var slower_users = slower_users.total;   
console.log('slower_users的值', slower_users);
this.setData({ slower_users: slower_users });
let beat_percent = 100*slower_users/qusers;
this.setData({ beat_percent: parseInt(beat_percent) });    //计算领先百分比
  },


  gotonext(){
    //全局变量qnumber应该+1
    var num = wx.getStorageSync('qnumber');     //这里又取出全局变量qnumber
    this.setData({ num: num });
    //取出全局变量记录数
    //var sizenum = wx.getStorageSync('cache_total');
    //this.setData({ sizenum: sizenum });
    //还有记录就继续展示单题，否则提示到头了

    if(num>0){
    wx.setStorageSync('qnumber', this.data.num-1);  //-1 存入全局变量
    wx.redirectTo({url: '../showone/showone'})
    }
    else{
      //弹窗
      wx.showToast({
        title: '这是最老一道题！',
        icon:'none',
        duration:1500
      })
    }
  },

  modalinput: function (e) {    //点一下就把输入框显示出来
    this.setData({
      //注意到模态框的取消按钮也是绑定的这个函数，
      //所以这里直接取反hiddenmodalput，也是没有毛病
      hiddenmodalput: !this.data.hiddenmodalput,

    })
  },

  getjumpnumber:function(e){         //这里要考虑输入为null的情况
    var jumpnumber=this.data.num   //要不缺省等于当前题号？
    /*if (e.detail.value!=null){  */      //这里根本没有执行
    this.setData({
      jumpnumber: e.detail.value    
    })       
    console.log("jumpnumber的值：",this.data.jumpnumber);   //this.data还必须写！
  
    /*else{        //如果输入为null，这里根本没有执行
      wx.showToast({
        title: '请输入题号',    
        icon:'none',
        duration:1500
      })
    }*/
  },

  confirm: function(){
    var sizenum = wx.getStorageSync('cache_total');
    this.setData({ sizenum: sizenum });

    if (this.data.jumpnumber!=null)    //这里先判断输入不为null，还得判断不为0或负数等
    {
      if ((this.data.jumpnumber<this.data.sizenum)&&(this.data.jumpnumber>0)&&((/(^[0-9]*$)/.test(this.data.jumpnumber))))  //如果输入的数字小于sizenumber且大于0且是个整数
      {
        wx.setStorageSync('qnumber', this.data.jumpnumber-1);  //题号-1 存入全局变量
        wx.redirectTo({url: '../showone/showone'})
      }
    //  if (this.data.jumpnumber>this.data.sizenum)
      else
      {
      wx.showToast({
      title: '题号不超过'+sizenum,    //这里很好，替换成变量
      icon:'none',
      duration:1500
})
      }
  /* else{
    wx.setStorageSync('qnumber', this.data.jumpnumber-1);  //题号-1 存入全局变量
    wx.redirectTo({url: '../showone/showone'})
  } */
    }
    else{
      wx.showToast({
        title: '请输入不大于'+sizenum+'的题号',    
        icon:'none',
        duration:1500
      })                   //如果输入为空，那么继续输入
    }

  },

  onShareAppMessage: function () {
    return{
    title: this.data.user+'仅用时'+this.data.first_minute+'分'+this.data.first_second+'秒，答出第'+this.data.show_qnumber+'题, 来试试?', //qnumber显示undefined?
    path: '/pages/showone/showone',    
    imageUrl: 'sharepic.jpg'
    }
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

})
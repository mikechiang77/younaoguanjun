// pages/adddata/adddata.js

var util = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */

  data: {
    clicknext: 0,
    index: 0,
    ne:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    // 删除云环境初始化代码，使用app.js中的统一初始化
    // wx.cloud.init({
    //   env: 'cloud1-4g9qgiuo73789486' //云开发环境id
    // });
    //1、引用数据库，删除env参数，使用app.js中的统一环境   
    const db = wx.cloud.database();
    const _ = db.command
    db.collection('testdatabase').orderBy('date1','desc').where({
      date: _.gt(1)
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

  //以下函数没法执行报错
querydata2: function(){
  // 删除云环境初始化代码，使用app.js中的统一初始化
  // wx.cloud.init({
  //   env: 'cloud1-4g9qgiuo73789486' //云开发环境id
  // });
const db = wx.cloud.database() //获取数据库的引用
const _ = db.command //获取数据库查询及更新指令
const cont = db.collection("testdatabase")//获取集合testdatabase的引用
    .where(
      {date: _.gt(5)}
    )
    .field({   //显示哪些字段
      _id: false,  //默认显示_id: 这个隐藏
      date: true,
      tip1: true,
      tip2: true,
      tip3: true,
      tip4: true,
      answer: true
    })
    .orderby('date','desc')  //排序方式，降序排列
    .skip(0)    //跳过多少个记录（常用于分页），0表示这里不跳过
    .limit(2)   //限制显示多少条记录，这里为2
    .get()      //获取根据查询条件筛选后的集合数据
    .then(res => {
      console.log(res.data)
    })
    .catch(err =>{
      console.error(err)
    })
},

querydata: function(){
  this.setData({
    clicknext: 1})
  // 删除云环境初始化代码，使用app.js中的统一初始化
  // wx.cloud.init({
  //   env: 'cloud1-4g9qgiuo73789486' //云开发环境id
  // });
  const db = wx.cloud.database()
  const cont = db.collection('testdatabase');
  cont.doc("cbddf0af60b4e7b80d4f773c6a24a61c").get({
    success: function (res) {
      console.log(res.data)   //res.data指包含该记录的数据
    }
  }) 
  db.collection('testdatabase').get({
    success: res => {
      console.log(res.data)
      //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值      
      this.setData({
        ne: res.data})
      }
    })
},

querydata1: function(){
// 1. 获取数据库引用
const db = wx.cloud.database()
// 2. 构造查询语句
// collection 方法获取一个集合的引用
// where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
// get 方法会触发网络请求，往数据库取数据
db.collection('testdatabase').where({
  date: 6
}).get({
  success: function(res) {
  // 输出 [ ]
  console.log(res.data)
 }
})
},

querydata3: function(){
  var _this = this;
  const db = wx.cloud.database()
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

  querydata4: function(){
    const db = wx.cloud.database()
    const _ = db.command
    var time = util.formatTime(new Date());
    db.collection('testdatabase').where({
      date1: _.lt(time)  //这样没有比较出时间？
    }).get({
      success: function(res) {
      console.log(res.data)
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


var app = getApp()      //用于取全局变量

Page({
  
  data:{
       canIUse: wx.canIUse('button.open-type.getUserInfo'),
       isshowusername: false,
       wxavatarUrl: null,
       wxnickName: '',
       shouquan: 1,
       userInfo: '',  //初始为空
    },
    

    onLoad () {
        wx.cloud.init({
          env:'younao-4gsgil468bff86d9',   //开发环境
          traceUser:true
        });  
    
        wx.cloud.callFunction({
        name: 'playlist',                //调用playlist云函数
        success: function(res) {
          console.log('res.result.total的值', res.result.all) //手机预览这里不显示？  
          wx.setStorageSync('cache_total', res.result.total) //题目数量存到缓存里
          wx.setStorageSync('cache_all', res.result.all)    //题目数组存到缓存里
          console.log('res的值',res);  //result是数组集
          app.global_all = res.result.all //赋值到全局变量里
          if(res.result.all==null){     //如果题目数组是空
            wx.setStorageSync('cache_all', res.result.tasks)  //tasks是什么意思？可能是为了测试用的
            app.global_all = res.result.tasks
          }
          console.log('全局变量global_all的值', app.global_all)  //显示、验证global_all成功赋值
        },
        fail: console.error
        })

        //试试获取用户信息，不过没有执行
        wx.getUserInfo({
          //成功后会返回
          success:(res)=>{
            console.log(res);
          }
        })
      
    },


    shownewone(){
      /*wx.getUserProfile({           //获取微信昵称和头像
        desc: '业务需要',
        success:res=>
        {
        console.log('显示取到的用户信息：', res)     //这句执行了，取到的是微信用户
        let info=res.userInfo;        //记录数据
      this.setData({
        userInfo : info.nickName,   //微信昵称
        src: info.avatarUrl,        //微信头像
        //isShow : false
      })
      wx.setStorageSync('user', info.nickName); //同步缓存  user不用提前定义？
      wx.setStorageSync('avatar', info.avatarUrl); */
     // wx.redirectTo({url: '../shownewone/shownewone'});  //这句进入的页面没内容
      wx.navigateTo({url: '../shownewone/shownewone'}); 
  
   },
  

onShow: function () {

},

gotomanage(){
  wx.redirectTo({url: '../manage/manage'})
},

gotomanage1(){
  wx.redirectTo({url: '../manage1/manage1'})
},

gotonextpage(){
  wx.redirectTo({
  })({url: '../view/view'})
},

addtodb(){
  wx.redirectTo({url: '../adddata/adddata'})
},

showdb(){
  wx.redirectTo({url: '../showdata/adddata'})
},

tocount(){
  wx.redirectTo({url: '../count_demo/count_demo'})
},

tosearchdb(){
  wx.redirectTo({url: '../searchdb/searchdb'})
},

topage1(){
  wx.redirectTo({url: '../search_new/search_new'})
},

showall(){
  wx.redirectTo({url: '../showall/showall'})
},

showone(){
  wx.redirectTo({url: '../showone/showone'})
},



timecount(){
  wx.redirectTo({url: '../timecount/timecount'})
},

huxi(){
  wx.redirectTo({url: '../huxi/huxi'})
},



})
// pages/showone/showone.js
var init;   //这个非常重要，不加的话数据库数据都调取不过来
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map:[], //存储云数据库中的数据
    nowdata:{}, //存储当前显示的值
    mapindex:1, //当前显示的序列号
    useranswer: "", //用户填空的数据，全局变量
    reason: "", //答案说明, 全局变量
    answerlength: 0,  //答案字数
    sharenumber: 0,
    qnumber: 0,
    inputShowed: true,
    addtext: '',
    hour:0,
    minute:0,
    second:0,
    timecount:'00:00',
    cost:0,
    flag:1,
    endtime:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({breathNum: 0}); //让tip1透明度初始为0
    this.setData({breathNum2: 0});
    this.setData({breathNum3: 0});
    this.setData({breathNum4: 0}); 

    this.setTextBreathing(this);
    this.setTextBreathing2(this);
    this.setTextBreathing3(this);
    this.setTextBreathing4(this);
    let that=this;        //用that承接this中原始数据并操作后传给视图层
    //计时器
clearInterval(init); //取消定时
that.setData({       //初始化都为0
  minute:0,
  second:0
})
init=setInterval(function(){  //设定一个定时器。按照指定的周期（以1000毫秒计）来执行注册的回调函数: timer()
  that.timer()
},1000);       //注意这里是1000毫秒，也就是每1秒回调刷新一次timer()

/*
    wx.cloud.init({
      env:'cloud1-4g9qgiuo73789486',  
      traceUser:true
    });               
    const db=wx.cloud.database();   
    const banner=db.collection("testdatabase");  //指定要获取的请求集

    banner.get().then(res=>{  //banner.get()是个布尔值, true则执行res=>等于function(res)
      console.log(res);
      that.map=res;         //用that来接云端的数,操作完后用setdata传给视图

      var sizenum=that.map.data.length; //得到数据集合记录数，作为全局变量
      wx.setStorageSync('sizenum', sizenum); //把记录数存入全局变量
*/

      var num = wx.getStorageSync('qnumber'); //取出全局变量题目序号
      that.setData({        //setdata把数据从逻辑层发到渲染层, 同步改变this.data中数值
        num:num,   //不知道对不？对，事实证明必要
        sharenumber:num+1,
        //map:res,                 //把that从云接到的数据集传到map中
        nowdata:wx.getStorageSync('cache_all')[num],  //把that.map中序号qnumber的数据传到nowdata中
      });

      var answerlength=this.data.nowdata.answer.length; //当前答案字数
      this.setData({answerlength: answerlength}); 

    /*  
    }).catch(err=>{  //如果banner.get()出错,则function(err)处理err数据
      console.log(err);
    });
*/


  },

  setTextBreathing: function(that) {   //这里传递2个参数? cls是class
    //使用记录呼吸效果
    var transparency = 0;    
    var add = true;  //记录当前在做透明度增加操作
    var timerId = setInterval(function(){  //setinterval是定时器，后面有个500毫秒是到时间回调，用500秒来执行function内容
      if (add === true){   //如果现在是递增
        transparency += 1;    //那么transpanrency加1
        if (transparency === 10){    //如果transpanrency加到10了
            add = false;      //那么add值变为false，别再加了
        }
      } 
      that.setData({    //_defaultcomponet应该是当前class缺省的模块
        breathNum:transparency/10        //breathNum是class里透明度的变量
      })
                              //通过setData的方式，设置breathNum的值
    },500)                 //500是定时器时间！
  },

  setTextBreathing2: function(that){
    var transparency2 = 0;    //初始是0，完全不透明
    var add2 = true;  
    var timerId = setInterval(function(){   //应该是间隔执行库函数
      if (add2 === true){   
        transparency2 += 1;    
        if (transparency2 === 15){     //当transparency2累加到15时透明度是1了，不再增加透明度
            add2 = false;      
        }
      } 
      that.setData({    //这句怎么理解？
        breathNum2:(transparency2-5)/10        //breathNum2 从0到1渐变
      })                        
    },500)                    //300是文字浮现的时间！
  },

  setTextBreathing3: function(that){
    var transparency3 = 0;    //初始是0，完全不透明
    var add3 = true;  
    var timerId = setInterval(function(){   //应该是间隔执行库函数
      if (add3 === true){   
        transparency3 += 1;    
        if (transparency3 === 20){     //当transparency3累加到20时透明度是1了，不再增加透明度
            add3 = false;      
        }
      } 
      that.setData({    //这句怎么理解？
        breathNum3:(transparency3-10)/10        //breathNum3 从0到1渐变
      })                        
    },500)                    //300是文字浮现的时间！
  },

  setTextBreathing4: function(that){
    var transparency4 = 0;    //初始是0，完全不透明
    var add4 = true;  
    var timerId = setInterval(function(){   //应该是间隔执行库函数
      if (add4 === true){   
        transparency4 += 1;    
        if (transparency4 === 25){     //当transparency3累加到20时透明度是1了，不再增加透明度
            add4 = false;      
        }
      } 
      that.setData({    //这句怎么理解？
        breathNum4:(transparency4-15)/10        //breathNum4 从0到1渐变
      })                        
    },500)                    //500是文字浮现的时间！
  },


  bindkeyinput: function(e){
    this.setData({
      useranswer: e.detail.value      //把用户填空的数据传给useranswer
    })
  },

  loosefocus: function () {
    this.setData({
      inputShowed: true  //当input里失去焦点时，给inputShowed赋值为true，重新获取焦点
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
 wx.setStorageSync('tip1', this.data.nowdata.tip1); //把当前提示1存入全局变量
 wx.setStorageSync('tip2', this.data.nowdata.tip2); //把当前提示2存入全局变量
 wx.setStorageSync('tip3', this.data.nowdata.tip3); //把当前提示3存入全局变量
 wx.setStorageSync('tip4', this.data.nowdata.tip4); //把当前提示4存入全局变量
 wx.setStorageSync('reason', this.data.nowdata.reason); //把当前答案说明存入全局变量
 wx.setStorageSync('qnumber', this.data.num); //把当前题目序号存入全局变量
 //把当前的用时存入全局变量
 wx.setStorageSync('useminute', this.data.minute); 
 wx.setStorageSync('usesecond', this.data.second); 
 wx.redirectTo({url: '../result/result'})
}
else{wx.showModal({
  showCancel: false,
  title: '不对',
  content: '你离答案很近了，加油！',
})
 //这里应该清空填空框
 this.setData({
  'addtext': ''
})
}
},

timer:function(){             //计时器，每1000毫秒回调刷新
  var that = this;
  //console.log(that.data.second)   //输出秒数
  that.setData({
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
    // 不进行任何操作
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
    return{
      title: '你能答出第'+this.data.sharenumber+'题吗？',
      //path: /pages/index,
      imageUrl: 'sharepic.jpg'
    }
  }
})
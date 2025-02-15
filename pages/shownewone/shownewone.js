// pages/shownewone/shownewone.js
var app = getApp();      //用于取全局变量
var init;
Page({
  data: {
    map:[], //存储云数据库中的数据
    nowdata:{}, //存储从数据库取下的tip值
    showtip4: "", //在wxml中显示的tip
    mapindex:1, //当前显示的序列号
    useranswer: "", //用户填空的数据，全局变量
    reason: "", //答案说明, 全局变量
    answerlength: 0,  //答案字数
    qnumber: 0,   //题目序号，注意0是数据集中的最新记录
    useminute: 0, //当前题用时分，全局变量
    usesecond: 0, //当前题用时秒，全局变量
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

async onLoad () {
  this.setData({breathNum: 0}); //让tip1透明度初始为0
  this.setData({breathNum2: 0});
  this.setData({breathNum3: 0});
  this.setData({breathNum4: 0}); 

  this.setTextBreathing(wx.createSelectorQuery(".flex-item1"),this) ;   
  this.setTextBreathing2(wx.createSelectorQuery(".flex-item2"),this) ;
  this.setTextBreathing3(wx.createSelectorQuery(".flex-item3"),this) ;
  this.setTextBreathing4(wx.createSelectorQuery(".flex-item4"),this) ; //前面加await还是提前显示tip

//先取全局变量global_all[0]的值
console.log('取到全局变量global_all的值', app.global_all)  //执行正确

//this.data.nowdata = wx.getStorageSync('cache_all')[0]   //这句非常非常重要！
let totalnumber = wx.getStorageSync('cache_total')
console.log('totalnumber的值', totalnumber)   //正确

this.setData({        //
  nowdata:wx.getStorageSync('cache_all')[totalnumber-1]  //  最新一题赋值给数组nowdata
}) 

console.log('nowdata的值', this.data.nowdata)   //正确

    let that=this;        //用that承接this中原始数据并操作后传给视图层
//计时器
clearInterval(init); //取消定时
that.setData({       //初始化都为0
  hour:0,
  minute:0,
  second:0
})
init=setInterval(function(){  //设定一个定时器。按照指定的周期（以1000毫秒计）来执行注册的回调函数: timer()
  that.timer()
},1000);       //注意这里是1000毫秒，也就是每1秒回调刷新一次timer()
  
 /*   wx.cloud.init({
      env:'cloud1-4g9qgiuo73789486',  
      traceUser:true
    });               
    const db=wx.cloud.database();   
    const banner=db.collection("testdatabase");  //.orderBy('date1','desc')指定要获取的请求集，这里按时间排序，倒叙 asc升序 desc降序

    const total = await (await banner.count()).total    //计算云数据库记录数，算分成多少个20条
    wx.setStorageSync('sizenum', total); //把记录数存入全局变量sizenum,这个倒是准的
    console.log('sizenum的值',total)   //没执行了
*/
    var num=totalnumber;
    this.setData({num: num});  //这句赋值成功了
    console.log('num的值',num)  //执行成功

    var answerlength=this.data.nowdata.answer.length; //当前答案字数 有问题，如果隐去下一句就没事
    this.setData({answerlength: answerlength}); 


  },


  setTextBreathing: function(cls,e) {   //这里传递2个参数? cls是class
    //使用记录呼吸效果
    var transparency = 0;    //初始完全不透明不显示
    var add = true;  //记录当前在做透明度增加操作
    setInterval(function(){  //setinterval是定时器，后面有个500毫秒是到时间回调，用500毫秒来执行function内容
      if (add === true){   //如果现在是递增
        transparency += 1;    //那么transpanrency加1
        if (transparency === 10){    //如果transpanrency加到10了，此时完全透明完全显示
            add = false;      //那么add值变为false，别再加了
        }
      } 
      cls._defaultComponent.setData({    //_defaultcomponet应该是当前class缺省的模块
        breathNum:transparency/10        //breathNum是class里透明度的变量
      })
                              //通过setData的方式，设置breathNum的值
    },500)                 //500是定时器时间！
  },

  setTextBreathing2: function(cls,e){
    var transparency2 = 0;    //初始是0，完全不透明
    var add2 = true;  
    setInterval(function(){   //应该是间隔执行库函数
      if (add2 === true){   
        transparency2 += 1;    
        if (transparency2 === 15){     //当transparency2累加到15时透明度是1了，不再增加透明度
                                       //为什么比transparency多5，因为要等tip1完全浮现，才开始浮现tip2
            add2 = false;      
        }
      } 
      cls._defaultComponent.setData({    //这句怎么理解？
        breathNum2:(transparency2-5)/10        //breathNum2 从0到1渐变
      })                        
    },500)                    //300是文字浮现的时间！
  },

  setTextBreathing3: function(cls,e){
    var transparency3 = 0;    //初始是0，完全不透明
    var add3 = true;  
    setInterval(function(){   //应该是间隔执行库函数
      if (add3 === true){   
        transparency3 += 1;    
        if (transparency3 === 20){     //当transparency3累加到20时透明度是1了，不再增加透明度
            add3 = false;      
        }
      } 
      cls._defaultComponent.setData({    //这句怎么理解？
        breathNum3:(transparency3-10)/10        //breathNum3 从0到1渐变
      })                        
    },500)                    //300是文字浮现的时间！
  },

   setTextBreathing4: function(cls,e){
    var transparency4 = 0;    //初始是0，完全不透明
    var add4 = true;  
    setInterval(function(){   //应该是间隔执行库函数
      if (add4 === true){   
        transparency4 += 1;    
        if (transparency4 === 25){     //当transparency3累加到20时透明度是1了，不再增加透明度
            add4 = false;      
        }
        
      } 
      cls._defaultComponent.setData({    //这句怎么理解？
        breathNum4:(transparency4-15)/10
            //breathNum4 从0到1渐变
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
 wx.setStorageSync('reason', this.data.nowdata.reason); //把当前答案说明存入全局变量
 wx.setStorageSync('tip1', this.data.nowdata.tip1); //把当前提示1存入全局变量
 wx.setStorageSync('tip2', this.data.nowdata.tip2); //把当前提示2存入全局变量
 wx.setStorageSync('tip3', this.data.nowdata.tip3); //把当前提示3存入全局变量
 wx.setStorageSync('tip4', this.data.nowdata.tip4); //把当前提示4存入全局变量
 wx.setStorageSync('qnumber', this.data.num-1); //把当前题目序号减去1也就是下一个要展示的题存入全局变量qnumber
 console.log('shownewone里qnumber的值',this.data.num-1);   //注意这里
 //把当前的用时存入全局变量
 wx.setStorageSync('useminute', this.data.minute); 
 wx.setStorageSync('usesecond', this.data.second); 

 wx.redirectTo({url: '../result/result'})
}
else{
  //this.setData({
  //  inputShowed: false  //如何重新获取焦点
 //})
  wx.showModal({
  showCancel: false,
  title: '不对',
  content: '你离答案很近了，加油！',
})
 //这里应该清空填空框
this.setData({
   addtext: '',
  // inputShowed: true  //如何重新获取焦点
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
    title: '你能答出第'+this.data.num+'题吗？',
    //path: /pages/index,
    imageUrl: 'sharepic.jpg'
  }
  }
})
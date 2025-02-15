// pages/huxi/huxi.js
Page({
  data: {
    breathNum : 0,            //透明度初始值为0
    breathNum2: 0,
    breathNum3: 0,
    breathNum4: 0,
    add: false,
    transparency2 : 0,    
    add2 : true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setTextBreathing(wx.createSelectorQuery(".get-record"),this) ;//怎么理解？
//get-record是wxml文件中view中button的class名称，createSelectorQuery返回一个SelectorQuery对象实例
//对get-record这个区域做呼吸效果

    var breathNum = 1;   
    if (breathNum === 1)    //这句压根就没执行
    {
      console.log(breathNum);
      this.setTextBreathing2(wx.createSelectorQuery(".get-record2"),this) ;
    //对get-record2这个区域做呼吸效果
      this.setTextBreathing3(wx.createSelectorQuery(".get-record3"),this) ;
      this.setTextBreathing4(wx.createSelectorQuery(".get-record4"),this) ;
    }
    //节点查询器, get-record是要渐变的按钮
  },

  setTextBreathing: function(cls,e) {   //这里传递2个参数? cls是class
    //使用记录呼吸效果
    var transparency = 0;    
    var add = true;  //记录当前在做透明度增加操作
    setInterval(function(){  //setinterval是定时器，后面有个500毫秒是到时间回调，用500秒来执行function内容
      if (add === true){   //如果现在是递增
        transparency += 1;    //那么transpanrency加1
        if (transparency === 10){    //如果transpanrency加到10了
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
              add2 = false;      
          }
        } 
        cls._defaultComponent.setData({    //这句怎么理解？
          breathNum2:(transparency2-5)/10        //breathNum2 从0到1渐变
        })                        
      },500)                    //500是文字浮现的时间！
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
      },500)                    //500是文字浮现的时间！
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
          breathNum4:(transparency4-15)/10        //breathNum4 从0到1渐变
        })                        
      },500)                    //500是文字浮现的时间！
    },

  /*setTextBreathing: function(cls,e) {   //这里传递2个参数?
    //使用记录呼吸效果
    var transparency = 10;    
    var reduce = true;  //记录当前做透明度增加或降低操作
    setInterval(function(){   //应用函数里再定义一个函数setinterval
      if (reduce === true){   //如果现在是递减
        transparency -= 1;    //那么transpanrency减1
        if (transparency === 0){    //如果transpanrency减到0了
            reduce = false;      //那么reduce值变为false，别再减了
        }
      } else if (reduce === false){     //当reduce值为false
          transparency += 1;            //那么transpanrency加1
        if (transparency === 10){        //如果transpanrency加10了
            reduce = true;          //那么reduce值变为true，别再加了，该减了
        }
      }
      cls._defaultComponent.setData({    //这句怎么理解？
        breathNum:transparency/10        //breathNum 从0到1渐变
      })
      //通过setData的方式，设置breathNum的值
    },200)                    //200是什么？
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
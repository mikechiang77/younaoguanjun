//app.js


App({

  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)


    // 登录
   /* wx.login({          //在app.js里正常调用，拿到 res.userInfo 用户的信息
                        //wx.login是用户进入app就要调用的
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId ?
      }
    })*/

    // 获取用户信息
    /*wx.getSetting({   //使用wx.getsetting来判断用户是否已经授权你的小程序获取用户的信息
      success: res => {
        if (res.authSetting['scope.userInfo']) {   
          //scope是授权范围，scope.userInfo为true表示授权了用户信息，对应接口是wx.getUserinfo
          //scope.UserLocation表示用户授权了位置信息, 对应接口是wx.getLocation
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo    //把用户信息存储到全局变量里

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    }) */
    
  },

  globalData: {
    //userInfo: null,             //用户信息
    useranswer: null,
    reason: null,
    qnumber: 0,
    tip1: null,
    tip2: null,
    tip3: null,
    tip4: null,
    useminute: 0,
    usesecond: 0,
    sizenum: null,
    wxnickName: null,
    wxavatarUrl: null,
    global_all: [],            //全局变量存放云函数下载的题目数组
  }
})
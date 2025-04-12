// pages/showone/showone.js
var init;   //这个非常重要，不加的话数据库数据都调取不过来
const app = getApp(); // 添加这行代码来获取全局app实例
const rankingService = require('../../utils/rankingService');

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
    wxavatarUrl: null,
    wxnickName: '',
    isShowUserInfo: false,
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    tempNickName: '',
    shareParams: null,
    _rankingData: {
      qusers: 0,             // 挑战人数
      slower_users: 0,        // 比我慢的人数
      beat_percent: 0,        // 领先百分比
      first_minute: 0,        // 历史记录分钟
      first_second: 0,        // 历史记录秒
      first_total_seconds: 0  // 历史记录总秒数
    },
    _isRankingLoaded: false  // 排名是否已加载（内部状态）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('showone页面加载，参数:', options);
    
    // 初始化页面效果
    this.setData({breathNum: 0, breathNum2: 0, breathNum3: 0, breathNum4: 0}); 
    this.setTextBreathing(this);
    this.setTextBreathing2(this);
    this.setTextBreathing3(this);
    this.setTextBreathing4(this);
    
    // 初始化计时器
    let that = this;
    clearInterval(init);
    that.setData({minute: 0, second: 0});
    init = setInterval(function(){ that.timer() }, 1000);
    
    // 保存选项参数，以便在获取用户信息后使用
    if (options) {
      this.setData({shareParams: options});
    }

    // 检查用户信息
    const wxnickName = wx.getStorageSync('usernickname');
    const wxavatarUrl = wx.getStorageSync('useravatarUrl');
    
    if (!wxnickName || !wxavatarUrl) {
      // 如果没有用户信息，跳转到用户信息页面
      let returnPage = '/pages/showone/showone';
      let params = options || {};
      
      wx.redirectTo({
        url: `/pages/userinfo/userinfo?returnPage=${encodeURIComponent(returnPage)}&params=${encodeURIComponent(JSON.stringify(params))}`,
        fail: function(err) {
          console.error('跳转到用户信息页面失败:', err);
        }
      });
      return;
    }
    
    // 设置用户信息
    this.setData({
      wxnickName: wxnickName,
      wxavatarUrl: wxavatarUrl
    });
    
    // 处理题目加载逻辑
    this.handleQuestionLoading(options);
  },

  /**
   * 处理题目加载逻辑，统一处理分享和非分享情况
   */
  handleQuestionLoading: function(options) {
    console.log('处理题目加载，参数:', options);
    
    // 从分享链接打开的情况
    if (options && options.display_num) {
      // 直接使用显示题号减1得到索引
      const displayNum = parseInt(options.display_num);
      if (!isNaN(displayNum) && displayNum > 0) {
        const index = displayNum - 1; // 转换为从0开始的索引
        console.log('从分享链接加载题目，显示题号:', displayNum, '索引:', index);
        
        // 加载指定题目
        this.loadQuestionByIndex(index);
        return;
      }
    }
    
    // 非分享情况，加载默认题目（上次浏览的题目）
    const num = wx.getStorageSync('qnumber');
    if (num !== undefined && num !== null) {
      console.log('加载上次浏览的题目，索引:', num);
      this.loadQuestionByIndex(num);
    } else {
      console.log('没有上次浏览记录，加载第一题');
      this.loadQuestionByIndex(0);
    }
  },

  /**
   * 根据索引加载题目（统一的题目加载函数）
   */
  loadQuestionByIndex: function(index) {
    console.log('根据索引加载题目:', index);
    
    // 确保索引是数字
    const questionIndex = parseInt(index);
    if (isNaN(questionIndex)) {
      console.warn('无效的题目索引:', index);
      return;
    }
    
    // 先尝试从缓存加载题目数据
    const cacheAll = wx.getStorageSync('cache_all');
    if (cacheAll && Array.isArray(cacheAll) && cacheAll.length > 0) {
      // 确保索引在有效范围内
      if (questionIndex >= 0 && questionIndex < cacheAll.length) {
        const question = cacheAll[questionIndex];
        
        // 设置题目数据
        this.setData({
          nowdata: question,
          num: questionIndex,              // 保存索引（从0开始）
          sharenumber: questionIndex + 1,  // 显示题号（从1开始）
          qnumber: questionIndex           // 同步更新qnumber
        });
        
        // 保存当前题目索引到缓存
        wx.setStorageSync('qnumber', questionIndex);
        
        // 获取答案长度
        if (question && question.answer) {
          this.setData({answerlength: question.answer.length});
        }
        
        console.log('成功加载题目，索引:', questionIndex, '显示题号:', (questionIndex + 1));
      } else {
        console.warn('题目索引超出范围:', questionIndex, '题目总数:', cacheAll.length);
        // 加载第一题
        if (questionIndex !== 0) {
          this.loadQuestionByIndex(0);
        }
      }
    } else {
      // 无缓存，需要从云函数加载
      console.log('没有本地缓存，通过云函数加载题目数据');
      this.loadQuestionDataFromCloud(questionIndex);
    }
    
    // 最后在后台预加载这个题目的排名数据（不影响界面）
    this.preloadRankingData(questionIndex);
  },

  /**
   * 从云函数加载题目数据
   */
  loadQuestionDataFromCloud: function(targetIndex) {
    console.log('从云函数加载题目数据，目标索引:', targetIndex);
    
    wx.showLoading({
      title: '加载题目...',
    });
    
    wx.cloud.callFunction({
      name: 'playlist',
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.all && Array.isArray(res.result.all)) {
          // 更新缓存
          wx.setStorageSync('cache_total', res.result.total);
          wx.setStorageSync('cache_all', res.result.all);
          if (app.global_all) {
            app.global_all = res.result.all;
          }
          
          // 加载目标题目
          this.loadQuestionByIndex(targetIndex);
        } else {
          wx.showModal({
            title: '加载失败',
            content: '题目数据无效',
            showCancel: false
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        wx.showModal({
          title: '加载失败',
          content: '无法获取题目数据',
          showCancel: false
        });
        console.error('云函数调用失败:', error);
      }
    });
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
    // 每次显示页面时重新检查用户信息
    this.getUserInfoFromStorage();
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
    return {
      title: '你能答出第'+this.data.sharenumber+'题吗？',
      path: '/pages/showone/showone?display_num=' + this.data.sharenumber + '&source=showone',
      imageUrl: 'sharepic.jpg'
    }
  },

  // 从缓存获取用户信息
  getUserInfoFromStorage: function() {
    const wxnickName = wx.getStorageSync('usernickname');
    const wxavatarUrl = wx.getStorageSync('useravatarUrl');
    
    console.log('从缓存获取用户信息:', { wxnickName, wxavatarUrl });
    
    if (wxnickName && wxavatarUrl) {
      this.setData({
        wxnickName: wxnickName,
        wxavatarUrl: wxavatarUrl
      });
      
      // 将用户信息保存到全局变量，以便其他页面使用
      app.globalData.wxnickName = wxnickName;
      app.globalData.wxavatarUrl = wxavatarUrl;
      
      return true;
    }
    return false;
  },
  
  // 检查是否需要获取用户信息
  checkUserInfoNeeded: function() {
    // 如果缓存中没有用户信息，显示获取用户信息的弹窗
    if (!this.data.wxnickName || !this.data.wxavatarUrl) {
      this.setData({
        isShowUserInfo: true
      });
    }
  },
  
  // 获取头像
  gettourl: function(e) {
    console.log('头像地址:', e.detail.avatarUrl);
    this.setData({ 
      wxavatarUrl: e.detail.avatarUrl
    });
    wx.setStorageSync('useravatarUrl', e.detail.avatarUrl);
  },
  
  // 昵称输入监听
  onNicknameInput: function(e) {
    this.setData({
      tempNickName: e.detail.value
    });
  },
  
  // 获取昵称并保存
  formSubmit: function(e) {
    let nickname = e.detail.value.nickname;
    console.log('昵称：', nickname);
    
    if (nickname) {
      // 用户有输入昵称或使用了微信昵称
      this.setData({ 
        wxnickName: nickname,
        tempNickName: nickname
      });
      wx.setStorageSync('usernickname', nickname);
      
      // 如果头像已获取，关闭弹窗
      if (this.data.wxavatarUrl) {
        this.setData({
          isShowUserInfo: false
        });
        
        // 如果是从分享进入的，加载分享的题目
        if (this.data.shareParams) {
          this.loadSharedQuestion(this.data.shareParams.qnumber);
        } else {
          // 正常加载页面
          this.loadPageData();
        }
      } else {
        wx.showToast({
          title: '请选择头像',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        icon: 'error',
        title: '请获取昵称',
      });
    }
  },
  
  // 关闭用户信息弹窗
  closeUserInfo: function() {
    this.setData({
      isShowUserInfo: false
    });
  },
  
  // 加载页面数据
  loadPageData: function() {
    // 这里可以添加加载题目等页面初始化操作
    // 可以把原有的数据加载逻辑放到这里
    console.log('加载页面数据');
  },
  
  // 加载分享的题目
  loadSharedQuestion: function(qnumber) {
    // 根据题目编号加载对应题目的逻辑
    console.log('加载分享题目，编号:', qnumber);
    
    // 将字符串转为数字
    let questionIndex = parseInt(qnumber);
    
    // 检查是否为有效索引
    if (isNaN(questionIndex)) {
      questionIndex = 0; // 默认为第一题
      return;
    }
    
    // 检查是否是从result页面分享的（result页面分享的题号是从1开始的）
    // 当qnumber大于0且参数中含有shared=true时，认为是从result页面分享的
    if (questionIndex > 0 && this.data.shareParams && this.data.shareParams.shared === 'true') {
      // 将显示题号转换为索引（从1开始转为从0开始）
      questionIndex = questionIndex - 1;
    }
    
    console.log('处理后的题目索引:', questionIndex);
    
    // 如果已有题目数据缓存，可以直接使用
    const cacheAll = wx.getStorageSync('cache_all');
    if (cacheAll && Array.isArray(cacheAll) && cacheAll.length > 0) {
      if (questionIndex >= 0 && questionIndex < cacheAll.length) {
        // 找到对应题目
        const question = cacheAll[questionIndex];
        // 设置到页面数据中
        this.setData({
          nowdata: question,
          num: questionIndex,           // 保存索引
          sharenumber: questionIndex + 1, // 显示给用户的题号
          qnumber: questionIndex        // 同步更新qnumber
        });
        
        // 记录当前题号到缓存，确保全局状态一致
        wx.setStorageSync('qnumber', questionIndex);
        
        // 获取答案长度
        if (question && question.answer) {
          this.setData({
            answerlength: question.answer.length
          });
        }
      }
    } else {
      // 如果没有缓存，需要重新加载题目数据
      this.loadQuestionData(questionIndex);
    }
  },
  
  // 加载题目数据的函数
  loadQuestionData: function(qnumber) {
    wx.showLoading({
      title: '加载题目...',
    });
    
    wx.cloud.callFunction({
      name: 'playlist',
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.all && Array.isArray(res.result.all)) {
          // 更新缓存
          wx.setStorageSync('cache_total', res.result.total);
          wx.setStorageSync('cache_all', res.result.all);
          app.global_all = res.result.all;
          
          // 找到对应题目
          const questionIndex = parseInt(qnumber);
          if (!isNaN(questionIndex) && questionIndex >= 0 && questionIndex < res.result.all.length) {
            const question = res.result.all[questionIndex];
            this.setData({
              nowdata: question,
              num: questionIndex,      // 修正：不要再加1，保持与索引一致
              sharenumber: questionIndex + 1 // 显示给用户的题号从1开始
            });
            
            // 记录到缓存
            wx.setStorageSync('qnumber', questionIndex);
            
            // 获取答案长度
            if (question && question.answer) {
              this.setData({
                answerlength: question.answer.length
              });
            }
          }
        } else {
          wx.showModal({
            title: '加载失败',
            content: '题目数据无效',
            showCancel: false
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        wx.showModal({
          title: '加载失败',
          content: '无法获取题目数据',
          showCancel: false
        });
        console.error('云函数调用失败:', error);
      }
    });
  },

  // 添加预加载排名数据函数（后台执行，不影响用户界面）
  /**
   * 预加载排名数据（不显示在界面上）
   * @param {Number} qnumber 题目编号（索引，从0开始）
   */
  preloadRankingData: async function(qnumber) {
    try {
      console.log('预加载题目排名数据:', qnumber);
      const user = wx.getStorageSync('usernickname');
      
      if (!user) {
        console.log('用户信息不完整，跳过排名预加载');
        return;
      }
      
      // 先查询用户历史记录
      const userRecord = await rankingService.getUserHistoryRecord(qnumber, user);
      
      if (userRecord) {
        // 有历史记录，使用历史记录计算排名
        console.log('找到历史记录，使用历史时间:', userRecord);
        
        // 保存到内部状态，不更新界面
        this.data._rankingData = {
          first_minute: userRecord.minute,
          first_second: userRecord.second,
          first_total_seconds: userRecord.total_seconds
        };
        
        // 获取排名数据
        const ranking = await rankingService.getUserRanking({
          qnumber: qnumber,
          username: user,
          minute: userRecord.minute,
          second: userRecord.second,
          isNewSubmission: false
        });
        
        // 更新内部状态，不影响界面显示
        this.data._rankingData.qusers = ranking.totalCount;
        this.data._rankingData.slower_users = ranking.slowerCount;
        this.data._rankingData.beat_percent = ranking.beatPercent;
        this.data._isRankingLoaded = true;
        
        console.log('排名数据预加载完成（仅后台）:', ranking);
      } else {
        console.log('未找到历史记录，等待用户回答后计算排名');
        // 没有历史记录，等待用户回答后再计算
        this.data._rankingData = {
          first_minute: 0,
          first_second: 0,
          first_total_seconds: 0,
          qusers: 0,
          slower_users: 0,
          beat_percent: 0
        };
        this.data._isRankingLoaded = false;
      }
    } catch (error) {
      console.error('预加载排名数据失败:', error);
      // 出错不阻断主流程
    }
  }
})
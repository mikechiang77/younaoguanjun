var app = getApp();
var init;

const rankingService = require('../../utils/rankingService');

Page({
  data: {
    map: [], //存储云数据库中的数据
    nowdata: {}, //存储从数据库取下的tip值
    showtip4: "", //在wxml中显示的tip
    mapindex: 1, //当前显示的序列号
    useranswer: "", //用户填空的数据，全局变量
    reason: "", //答案说明, 全局变量
    answerlength: 0,  //答案字数
    qnumber: 0,   //题目序号，注意0是数据集中的最新记录
    useminute: 0, //当前题用时分，全局变量
    usesecond: 0, //当前题用时秒，全局变量
    inputShowed: true,
    addtext: '',
    hour: 0,
    minute: 0,
    second: 0,
    timecount: '00:00',
    cost: 0,
    flag: 1,
    endtime: "",
    breathNum: 0,
    breathNum2: 0,
    breathNum3: 0,
    breathNum4: 0,
    _timerIds: [], // 新增：用于存储定时器ID
    _rankingData: {},
    _isRankingLoaded: false
  },

  onLoad: function(options) {
    console.log('页面加载 - 将显示最新题目');
    
    // 初始化透明度设置
    this.setData({
      breathNum: 0,
      breathNum2: 0,
      breathNum3: 0,
      breathNum4: 0
    });

    // 初始化呼吸动画
    this.startBreathingAnimations();
    
    // 加载最新题目
    this.loadNewestQuestion();
    
    // 预加载排名数据（在获取题目后）
    this.preloadRankingData();

    // 计时器设置
    let that = this;
    clearInterval(init);
    that.setData({
      hour: 0,
      minute: 0,
      second: 0
    });
    
    init = setInterval(function() {
      that.timer();
    }, 1000);
  },
  
  // 专门用于加载最新题目的函数
  loadNewestQuestion: function() {
    // 尝试从缓存获取题目数据
    const cacheAll = wx.getStorageSync('cache_all');
    
    if (cacheAll && Array.isArray(cacheAll) && cacheAll.length > 0) {
      console.log('从缓存加载题目数据，总题目数量:', cacheAll.length);
      
      // 获取最新题目 - 数组的最后一个元素
      const lastIndex = cacheAll.length - 1;
      const newestQuestion = cacheAll[lastIndex];
      
      if (newestQuestion) {
        console.log('找到最新题目，索引:', lastIndex);
        console.log('最新题目内容:', newestQuestion);
        
        this.setData({
          nowdata: newestQuestion,
          num: lastIndex + 1, // 显示题号为索引+1
          answerlength: newestQuestion.answer ? newestQuestion.answer.length : 0
        });
        
        return true;
      }
    }
    
    // 如果缓存中没有数据，尝试从全局变量获取
    if (app.global_all && Array.isArray(app.global_all) && app.global_all.length > 0) {
      console.log('从全局变量加载题目数据，总题目数量:', app.global_all.length);
      
      // 更新缓存
      wx.setStorageSync('cache_all', app.global_all);
      
      // 获取最新题目 - 数组的最后一个元素
      const lastIndex = app.global_all.length - 1;
      const newestQuestion = app.global_all[lastIndex];
      
      if (newestQuestion) {
        console.log('从全局变量找到最新题目，索引:', lastIndex);
        
        this.setData({
          nowdata: newestQuestion,
          num: lastIndex + 1, // 显示题号为索引+1
          answerlength: newestQuestion.answer ? newestQuestion.answer.length : 0
        });
        
        return true;
      }
    }
    
    // 如果缓存和全局变量都没有数据，从云函数重新加载
    console.log('缓存和全局变量都没有题目数据，从云函数重新加载');
    
    wx.showLoading({
      title: '加载最新题目...',
    });
    
    wx.cloud.callFunction({
      name: 'playlist',
      success: (res) => {
        wx.hideLoading();
        
        if (res.result && res.result.all && Array.isArray(res.result.all) && res.result.all.length > 0) {
          console.log('云函数返回题目数据，总题目数量:', res.result.all.length);
          
          // 更新缓存和全局变量
          wx.setStorageSync('cache_all', res.result.all);
          app.global_all = res.result.all;
          
          // 获取最新题目 - 数组的最后一个元素
          const lastIndex = res.result.all.length - 1;
          const newestQuestion = res.result.all[lastIndex];
          
          if (newestQuestion) {
            console.log('从云函数找到最新题目，索引:', lastIndex);
            
            this.setData({
              nowdata: newestQuestion,
              num: lastIndex + 1, // 显示题号为索引+1
              answerlength: newestQuestion.answer ? newestQuestion.answer.length : 0
            });
            
            return true;
          } else {
            console.error('云函数返回的数据中没有最新题目');
            
            this.setData({
              nowdata: {
                tip1: '题目数据加载错误',
                tip2: '请联系管理员',
                tip3: '',
                tip4: '',
                answer: ''
              }
            });
            
            wx.showToast({
              title: '题目数据无效',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('云函数返回的数据无效');
          
          this.setData({
            nowdata: {
              tip1: '题目数据加载错误',
              tip2: '请联系管理员',
              tip3: '',
              tip4: '',
              answer: ''
            }
          });
          
          wx.showModal({
            title: '加载失败',
            content: '题目数据无效，请联系管理员',
            showCancel: false
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('云函数调用失败:', error);
        
        this.setData({
          nowdata: {
            tip1: '网络连接错误',
            tip2: '请检查网络后重试',
            tip3: '',
            tip4: '',
            answer: ''
          }
        });
        
        wx.showModal({
          title: '加载失败',
          content: '无法连接服务器，请检查网络',
          showCancel: false
        });
      }
    });
    
    return false;
  },
  
  // onShow 生命周期函数，每次页面显示时都确保加载最新题目
  onShow: function() {
    console.log('页面显示 - 将刷新最新题目');
    this.loadNewestQuestion();
  },
  
  // 启动所有呼吸动画
  startBreathingAnimations: function() {
    // 清除之前的定时器
    this.clearAllTimers();
    
    var that = this;
    
    // 启动第一个呼吸动画
    var transparency = 0;
    var add = true;
    
    var timer1 = setInterval(function() {
      if (!that || !that.setData) {
        console.log('页面已卸载，停止动画1');
        clearInterval(timer1);
        return;
      }
      
      if (add === true) {
        transparency += 1;
        if (transparency === 10) {
          add = false;
        }
      }
      
      try {
        that.setData({
          breathNum: transparency/10
        });
      } catch (error) {
        console.error('动画1出错：', error);
        clearInterval(timer1);
      }
    }, 500);
    
    // 保存定时器ID
    this.data._timerIds.push(timer1);
    
    // 启动第二个呼吸动画
    var transparency2 = 0;
    var add2 = true;
    
    var timer2 = setInterval(function() {
      if (!that || !that.setData) {
        console.log('页面已卸载，停止动画2');
        clearInterval(timer2);
        return;
      }
      
      if (add2 === true) {
        transparency2 += 1;
        if (transparency2 === 15) {
          add2 = false;
        }
      }
      
      try {
        that.setData({
          breathNum2: (transparency2-5)/10
        });
      } catch (error) {
        console.error('动画2出错：', error);
        clearInterval(timer2);
      }
    }, 500);
    
    // 保存定时器ID
    this.data._timerIds.push(timer2);
    
    // 启动第三个呼吸动画
    var transparency3 = 0;
    var add3 = true;
    
    var timer3 = setInterval(function() {
      if (!that || !that.setData) {
        console.log('页面已卸载，停止动画3');
        clearInterval(timer3);
        return;
      }
      
      if (add3 === true) {
        transparency3 += 1;
        if (transparency3 === 20) {
          add3 = false;
        }
      }
      
      try {
        that.setData({
          breathNum3: (transparency3-10)/10
        });
      } catch (error) {
        console.error('动画3出错：', error);
        clearInterval(timer3);
      }
    }, 500);
    
    // 保存定时器ID
    this.data._timerIds.push(timer3);
    
    // 启动第四个呼吸动画
    var transparency4 = 0;
    var add4 = true;
    
    var timer4 = setInterval(function() {
      if (!that || !that.setData) {
        console.log('页面已卸载，停止动画4');
        clearInterval(timer4);
        return;
      }
      
      if (add4 === true) {
        transparency4 += 1;
        if (transparency4 === 25) {
          add4 = false;
        }
      }
      
      try {
        that.setData({
          breathNum4: (transparency4-15)/10
        });
      } catch (error) {
        console.error('动画4出错：', error);
        clearInterval(timer4);
      }
    }, 500);
    
    // 保存定时器ID
    this.data._timerIds.push(timer4);
  },

  bindkeyinput: function(e) {
    this.setData({
      useranswer: e.detail.value
    });
  },

  loosefocus: function() {
    this.setData({
      inputShowed: true
    });
  },

  redirectBtn: function() {
    let useranswer1 = this.data.useranswer;
    
    // 安全检查
    if (!this.data.nowdata || !this.data.nowdata.answer) {
      wx.showModal({
        showCancel: false,
        title: '题目数据错误',
        content: '请返回重新进入',
      });
      return;
    }
    
    if(useranswer1 == this.data.nowdata.answer) {
      // 保存用户的答案及相关信息
      wx.setStorageSync('useranswer', this.data.nowdata.answer);
      wx.setStorageSync('reason', this.data.nowdata.reason);
      wx.setStorageSync('tip1', this.data.nowdata.tip1);
      wx.setStorageSync('tip2', this.data.nowdata.tip2);
      wx.setStorageSync('tip3', this.data.nowdata.tip3);
      wx.setStorageSync('tip4', this.data.nowdata.tip4);
      wx.setStorageSync('qnumber', this.data.num-1);
      console.log('shownewone里qnumber的值', this.data.num-1);
      
      // 保存用时
      wx.setStorageSync('useminute', this.data.minute);
      wx.setStorageSync('usesecond', this.data.second);
      
      // 如果有预加载的排名数据但无历史记录，需要添加记录并实时计算排名
      if (this.data._isRankingLoaded === false) {
        console.log('无历史记录，需要提交并计算排名');
        
        // 显示提交中的提示
        wx.showLoading({
          title: '提交中...',
        });
        
        // 调用排名服务将答题记录保存到数据库并计算排名
        const user = wx.getStorageSync('usernickname');
        const qnumber = this.data.num - 1;
        
        rankingService.getUserRanking({
          qnumber: qnumber,
          username: user,
          minute: this.data.minute,
          second: this.data.second,
          isNewSubmission: true
        }).then(ranking => {
          wx.hideLoading();
          
          // 保存排名数据到Storage
          wx.setStorageSync('qusers', ranking.totalCount);
          wx.setStorageSync('slower_users', ranking.slowerCount);
          wx.setStorageSync('beat_percent', ranking.beatPercent);
          wx.setStorageSync('first_minute', ranking.userMinute);
          wx.setStorageSync('first_second', ranking.userSecond);
          wx.setStorageSync('first_total_seconds', ranking.userTotalSeconds);
          
          // 跳转到结果页
          wx.redirectTo({url: '../result/result'});
        }).catch(error => {
          wx.hideLoading();
          console.error('计算排名失败，直接跳转:', error);
          // 即使计算排名失败，也跳转到结果页
          wx.redirectTo({url: '../result/result'});
        });
      } else {
        // 已有预加载的排名数据或用户历史记录，直接跳转
        console.log('已有排名数据或历史记录，直接跳转');
        wx.redirectTo({url: '../result/result'});
      }
    } else {
      wx.showModal({
        showCancel: false,
        title: '不对',
        content: '你离答案很近了，加油！',
      });
      
      this.setData({
        addtext: '',
      });
    }
  },

  timer: function() {
    var that = this;
    that.setData({
      second: that.data.second+1
    });
    
    if(that.data.second >= 60) {
      that.setData({
        second: 0,
        minute: that.data.minute+1
      });
    }
    
    that.setData({
      timecount: that.data.minute + ":" + that.data.second
    });
  },
  
  onHide: function() {
    console.log('页面隐藏 - 清理所有定时器');
    this.clearAllTimers();
  },
  onUnload: function() {
    console.log('页面卸载 - 清理所有定时器');
    this.clearAllTimers();
  },
  onPullDownRefresh: function() {
    // 下拉刷新时重新加载最新题目
    this.loadNewestQuestion();
    wx.stopPullDownRefresh();
  },
  onReachBottom: function() {},
  
  onShareAppMessage: function() {
    return {
      title: '你能答出第'+this.data.num+'题吗？',
      imageUrl: 'sharepic.jpg'
    };
  },

  // 添加清理定时器的函数
  clearAllTimers: function() {
    if (this.data._timerIds && this.data._timerIds.length > 0) {
      console.log('清理', this.data._timerIds.length, '个定时器');
      this.data._timerIds.forEach(timerId => {
        clearInterval(timerId);
      });
      this.data._timerIds = [];
    }
    
    // 同时清理全局计时器
    if (init) {
      clearInterval(init);
      init = null;
    }
  },

  // 添加预加载排名数据的函数
  preloadRankingData: async function() {
    try {
      // 获取当前题目索引（最新题目索引）
      const qnumber = this.data.num - 1; // 转为从0开始的索引
      console.log('预加载最新题目排名数据:', qnumber);
      
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
        
        // 将数据保存到Storage中，供result页面使用
        wx.setStorageSync('qusers', ranking.totalCount);
        wx.setStorageSync('slower_users', ranking.slowerCount);
        wx.setStorageSync('beat_percent', ranking.beatPercent);
        wx.setStorageSync('first_minute', ranking.userMinute);
        wx.setStorageSync('first_second', ranking.userSecond);
        wx.setStorageSync('first_total_seconds', ranking.userTotalSeconds);
        
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
});

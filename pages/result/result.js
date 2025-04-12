/**
 * 答题结果页面 (新版)
 * 增加排名功能的结果页面
 */
const rankingService = require('../../utils/rankingService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenmodalput: true,
    reason: "",
    num: null,
    hasrecord: 0,
    text1: 0,
    res: [],
    qusers: 0,
    slower_users: 0,
    beat_percent: 0,
    first_minute: 0,
    first_second: 0,
    first_total_seconds: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    // 从缓存加载数据
    var useranswer = wx.getStorageSync('useranswer');
    this.setData({ useranswer: useranswer });
    var tip1 = wx.getStorageSync('tip1');
    this.setData({ tip1: tip1 });
    var tip2 = wx.getStorageSync('tip2');
    this.setData({ tip2: tip2 });
    var tip3 = wx.getStorageSync('tip3');
    this.setData({ tip3: tip3 });
    var tip4 = wx.getStorageSync('tip4');
    this.setData({ tip4: tip4 });
    var reason = wx.getStorageSync('reason');
    this.setData({ reason: reason });
    var user = wx.getStorageSync('usernickname');
    this.setData({ user: user });
    var avatar = wx.getStorageSync('useravatarUrl');
    this.setData({ avatar: avatar });
    var useminute = wx.getStorageSync('useminute');
    this.setData({ useminute: useminute });
    var usesecond = wx.getStorageSync('usesecond');
    this.setData({ usesecond: usesecond });
    var qnumber = wx.getStorageSync('qnumber');
    this.setData({ show_qnumber: qnumber+1 });
    
    // 尝试从缓存加载排名数据
    var qusers = wx.getStorageSync('qusers');
    var slower_users = wx.getStorageSync('slower_users');
    var beat_percent = wx.getStorageSync('beat_percent');
    var first_minute = wx.getStorageSync('first_minute');
    var first_second = wx.getStorageSync('first_second');
    var first_total_seconds = wx.getStorageSync('first_total_seconds');
    
    if (qusers && slower_users !== undefined && beat_percent !== undefined) {
      // 使用预先计算的排名数据
      this.setData({ 
        qusers: qusers,
        slower_users: slower_users,
        beat_percent: beat_percent,
        first_minute: first_minute,
        first_second: first_second,
        first_total_seconds: first_total_seconds || (first_minute*60+first_second)
      });
      
      console.log('使用预加载的排名数据');
    } else {
      // 没有预先计算的数据，重新获取
      console.log('无预加载排名数据，重新获取');
      this.setData({ first_total_seconds: useminute*60+usesecond });
      await this.fetchUserRanking(qnumber, user, useminute, usesecond);
    }
  },
  
  /**
   * 获取用户排名数据
   */
  async fetchUserRanking(qnumber, username, minute, second) {
    try {
      // 调用排名服务
      const ranking = await rankingService.getUserRanking({
        qnumber: qnumber,
        username: username,
        minute: parseInt(minute),
        second: parseInt(second),
        isNewSubmission: true
      });
      
      console.log('获取到排名数据:', ranking);
      
      // 更新页面数据 - 映射到与原始页面相同的字段
      this.setData({
        qusers: ranking.totalCount,          // 挑战人数
        slower_users: ranking.slowerCount,   // 比我慢的人数
        beat_percent: ranking.beatPercent,   // 领先百分比
        first_minute: ranking.userMinute,    // 历史记录分钟
        first_second: ranking.userSecond,    // 历史记录秒
        first_total_seconds: ranking.userTotalSeconds // 历史记录总秒数
      });
    } catch (error) {
      console.error('获取排名失败:', error);
      
      // 发生错误时，保持原有逻辑 - 查询数据库
      await this.queryHistoricalRecords();
    }
  },
  
  /**
   * 原有的数据库查询逻辑 - 作为备用
   */
  async queryHistoricalRecords() {
    var that = this;
    var text1 = 0;
    var text2 = 0;
    let len = 0;
    const db = wx.cloud.database();
    const table1 = db.collection("score1");

    console.log("执行查找历史答题时间前show_qnumber的值：", this.data.show_qnumber);
    console.log("当前用户名：", this.data.user);

    await db.collection("score1").where({
      qnumber: this.data.show_qnumber-1,
      username: this.data.user,
    })
    .get()
    .then(res => {
      console.log("执行了查询，查询到记录：", res);
      this.setData({
        res: res.data
      });
      len = res.data.length;
      console.log("查询结果res里len的值：", len);
      if(len > 0) {
        this.setData({first_minute: res.data[0].minute});
        this.setData({first_second: res.data[0].second});
        this.setData({first_total_seconds: res.data[0].total_seconds});
      }
    })
    .catch(err => 
      table1.add({
        data:{
          qnumber: this.data.show_qnumber-1,
          username: this.data.user,
          minute: this.data.useminute,
          second: this.data.usesecond,
          total_seconds: this.data.useminute*60+this.data.usesecond
        },
      }),
      this.setData({first_minute: this.data.useminute}),
      this.setData({first_second: this.data.usesecond})
    );

    // 计算本题的答题人数qusers
    var qusers = await db.collection("score1")
      .where({qnumber: this.data.show_qnumber-1})
      .count();
    var qusers = qusers.total;
    this.setData({ qusers: qusers });
    console.log('qusers的值', qusers);

    // 计算本题比我慢的答题人数slower_users
    const _ = db.command;
    console.log('first_total_seconds的值', this.data.first_total_seconds);

    var slower_users = await db.collection("score1")
      .where({
        qnumber: this.data.show_qnumber-1,
        total_seconds: _.gt(this.data.first_total_seconds),
      })
      .count();
    var slower_users = slower_users.total;
    console.log('slower_users的值', slower_users);
    this.setData({ slower_users: slower_users });
    let beat_percent = 100*slower_users/qusers;
    this.setData({ beat_percent: parseInt(beat_percent) });
  },

  gotonext(){
    var num = wx.getStorageSync('qnumber');
    this.setData({ num: num });

    if(num>0){
      wx.setStorageSync('qnumber', this.data.num-1);
      wx.redirectTo({url: '../showone/showone'});
    }
    else{
      wx.showToast({
        title: '这是最老一道题！',
        icon:'none',
        duration:1500
      });
    }
  },

  modalinput: function (e) {
    // 获取总题数
    var sizenum = wx.getStorageSync('cache_total');
    console.log("获取到的总题数:", sizenum);
    
    // 如果总题数不存在或无效，尝试其他方式获取
    if (!sizenum || sizenum <= 0) {
      const cacheAll = wx.getStorageSync('cache_all');
      if (cacheAll && Array.isArray(cacheAll)) {
        sizenum = cacheAll.length;
        console.log("从cache_all获取的总题数:", sizenum);
        wx.setStorageSync('cache_total', sizenum);
      } else {
        sizenum = 100; // 设置一个默认最大值
        console.log("未找到有效的总题数，使用默认值:", sizenum);
      }
    }
    
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput,
      sizenum: sizenum
    });
  },

  getjumpnumber: function(e){
    console.log("输入的题号原始值:", e.detail.value);
    const value = e.detail.value.trim(); // 去除空格
    this.setData({
      jumpnumber: value    
    });
    console.log("处理后的jumpnumber值:", value);
  },

  confirm: function(){
    console.log("确认跳转，当前jumpnumber:", this.data.jumpnumber);
    
    // 获取总题数
    var sizenum = wx.getStorageSync('cache_total');
    console.log("获取到的总题数:", sizenum);
    
    // 如果总题数不存在或无效，尝试其他方式获取
    if (!sizenum || sizenum <= 0) {
      const cacheAll = wx.getStorageSync('cache_all');
      if (cacheAll && Array.isArray(cacheAll)) {
        sizenum = cacheAll.length;
        console.log("从cache_all获取的总题数:", sizenum);
        wx.setStorageSync('cache_total', sizenum);
      } else {
        sizenum = 100; // 设置一个默认最大值
        console.log("未找到有效的总题数，使用默认值:", sizenum);
      }
    }
    
    this.setData({ sizenum: sizenum });
    
    // 检查输入值
    if (this.data.jumpnumber !== undefined && this.data.jumpnumber !== null && this.data.jumpnumber !== '') {
      // 转换为数字
      const jumpNum = parseInt(this.data.jumpnumber);
      console.log("解析后的跳转题号:", jumpNum);
      
      // 检查是否为有效数字
      if (!isNaN(jumpNum) && jumpNum > 0 && jumpNum <= sizenum) {
        console.log("题号有效，将跳转到第", jumpNum, "题");
        wx.setStorageSync('qnumber', jumpNum - 1); // 转为索引
        
        // 成功时关闭对话框
        this.setData({
          hiddenmodalput: true
        });
        
        wx.redirectTo({
          url: '../showone/showone',
          success: function() {
            console.log("跳转成功");
          },
          fail: function(error) {
            console.error("跳转失败:", error);
            wx.showToast({
              title: '跳转失败：' + error.errMsg,
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
        console.log("题号无效:", jumpNum);
        
        // 输入无效时，不关闭对话框
        wx.showToast({
          title: '请输入1-' + sizenum + '之间的题号',
          icon: 'none',
          duration: 2000
        });
        
        // 保持对话框打开
        this.setData({
          hiddenmodalput: false
        });
      }
    } else {
      console.log("未输入题号");
      
      // 未输入时，不关闭对话框
      wx.showToast({
        title: '请输入题号',
        icon: 'none',
        duration: 1500
      });
      
      // 保持对话框打开
      this.setData({
        hiddenmodalput: false
      });
    }
  },

  onShareAppMessage: function () {
    return {
      title: this.data.user+'仅用时'+this.data.first_minute+'分'+this.data.first_second+'秒，答出第'+this.data.show_qnumber+'题, 来试试?',
      path: '/pages/showone/showone?display_num=' + this.data.show_qnumber + '&source=result',
      imageUrl: 'sharepic.jpg'
    };
  },

  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {}
});

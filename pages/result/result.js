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
    
    this.setData({ first_total_seconds: useminute*60+usesecond });

    // 使用排名服务获取用户排名
    await this.fetchUserRanking(qnumber, user, useminute, usesecond);
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
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput,
    });
  },

  getjumpnumber: function(e){
    this.setData({
      jumpnumber: e.detail.value    
    });
    console.log("jumpnumber的值：", this.data.jumpnumber);
  },

  confirm: function(){
    var sizenum = wx.getStorageSync('cache_total');
    this.setData({ sizenum: sizenum });

    if (this.data.jumpnumber!=null){
      if ((this.data.jumpnumber<this.data.sizenum)&&(this.data.jumpnumber>0)&&((/(^[0-9]*$)/.test(this.data.jumpnumber)))){
        wx.setStorageSync('qnumber', this.data.jumpnumber-1);
        wx.redirectTo({url: '../showone/showone'});
      }
      else{
        wx.showToast({
          title: '题号不超过'+sizenum,
          icon:'none',
          duration:1500
        });
      }
    }
    else{
      wx.showToast({
        title: '请输入不大于'+sizenum+'的题号',    
        icon:'none',
        duration:1500
      });
    }
  },

  onShareAppMessage: function () {
    return{
      title: this.data.user+'仅用时'+this.data.first_minute+'分'+this.data.first_second+'秒，答出第'+this.data.show_qnumber+'题, 来试试?',
      path: '/pages/showone/showone',    
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

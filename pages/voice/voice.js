// pages/voice/voice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRecording: false,
    duration: 0,
    recorderManager: wx.getRecorderManager() // 录音管理器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
// 监听录音停止事件
this.data.recorderManager.onStop(res => {
  console.log('录音文件路径:', res.tempFilePath)
  this.setData({ duration: 0, isRecording: false })
  
  // 示例：调用语音识别接口（需配合后端API）
  // wx.uploadFile({
  //   url: '你的服务器接口',
  //   filePath: res.tempFilePath,
  //   name: 'voice',
  // })
})
  },

  toggleRecording() {
    if (this.data.isRecording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  },

  startRecording() {
    this.setData({ isRecording: true })
    let durationTimer
    // 开始录音
    this.data.recorderManager.start({
      format: 'mp3',     // 格式：支持aac/mp3
      sampleRate: 16000, // 采样率
      numberOfChannels: 1 // 单声道
    })

    // 更新录音时长
    this.setData({ duration: 0 })
    durationTimer = setInterval(() => {
      if (this.data.isRecording) {
        this.setData({ duration: this.data.duration + 1 })
      } else {
        clearInterval(durationTimer)
      }
    }, 1000)
  },

  stopRecording() {
    this.setData({ isRecording: false })
    this.data.recorderManager.stop()
    wx.showToast({
      title: '录音完成',
      icon: 'success'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
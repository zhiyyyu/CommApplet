const app = getApp();
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
//获取全局唯一的语音识别管理器recordRecoManager
const manager = plugin.getRecordRecognitionManager();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //语音
    recordState: false, //录音状态
    content_total:'',//内容
    content_input:'',//内容
    stateReported: {},
    recv_flag: false,
    send_flag: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //识别语音
    this.initRecord();
  },
  // 手动输入内容
  conTotal: function (e) {
    this.setData({
      content:e.detail.value,
    })
  },
  // 手动输入内容
  conInput: function (e) {
    this.setData({
      content_input:e.detail.value,
    })
  },
  // 手动输入内容
  conTotal: function (e) {
    this.setData({
      content_total:e.detail.value,
    })
  },
  sleep: function (ms){
    return new Promise((resolve)=>setTimeout(resolve,ms));
  },
  test: async function (time){
    var temple=await this.sleep(time*1000);
    this.recvFromCloud()
    return temple
  },
  // 手动输入内容
  sendToWrap: function () {
    // console.log(this.data.content_total)
    this.setData({
      content_total: this.data.content_total + "\tI  : " + this.data.content_input + "\n"
    })
    // console.log(this.data.content_total)
    this.data.send_flag = false
    this.sendToCloud(this.data.content_input)
    this.data.recv_flag = false
    this.test(15);
  },
  sendToCloud(e) {
    let obj = {
      "hello_world": e,
    }    
    this.setData({ content_input: "" })
    let payload = JSON.stringify(obj)
    console.log("send payload: ", payload)
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'iothub-publish',
      data: {
        SecretId: app.globalData.secretId,
        SecretKey: app.globalData.secretKey,
        ProductId: app.globalData.productId,
        DeviceName: app.globalData.deviceName,
        Topic: app.globalData.productId + "/" + app.globalData.deviceName + "/data",
        Payload: payload,
      },
      success: res => {
        wx.showToast({
          icon: 'success',
          title: '发送成功',
        })
        console.log("send success: ", res)
      },
      fail: err => {
        wx.showToast({
          icon: 'error',
          title: '发送失败，设备未连接',
        })
        console.error('[云函数] [iotexplorer] 调用失败：', err)
      }
    })
  },
  recvFromCloud() {
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'iothub-shadow-query',
      data: {
        ProductId: app.globalData.productId,
        DeviceName: app.globalData.deviceName,
        SecretId: app.globalData.secretId,
        SecretKey: app.globalData.secretKey,
      },
      success: res => {
        wx.showToast({
          icon: 'success',
          title: '接收到数据',
        })
        let deviceData = JSON.parse(res.result.Data)
        this.setData({
          stateReported: deviceData.payload.state.reported
        })
        console.log("result:", deviceData.payload)
        this.data.recv_flag = true
        this.setData({
          content_total: this.data.content_total + "\tC : " + this.data.stateReported.hello_world + "\n"
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'error',
          title: '接收数据失败',
        })
        console.error('[云函数] [iotexplorer] 调用失败：', err)
      }
    })
  },
  //识别语音 -- 初始化
  initRecord: function () {
    const that = this;
    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = function (res) {
      console.log(res)
    }
    // 正常开始录音识别时会调用此事件
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    // 识别错误事件
    manager.onError = function (res) {
      console.error("error msg", res)
    }
    //识别结束事件
    manager.onStop = function (res) {
      console.log('..............结束录音')
      console.log('录音临时文件地址 -->' + res.tempFilePath); 
      console.log('录音总时长 -->' + res.duration + 'ms'); 
      console.log('文件大小 --> ' + res.fileSize + 'B');
      console.log('语音内容 --> ' + res.result);
      if (res.result == '') {
        wx.showModal({
          title: '提示',
          content: '听不清楚，请重新说一遍！',
          showCancel: false,
          success: function (res) {}
        })
        return;
      }
      var text = res.result;
      that.setData({
        content_input: text
      })
    }
  },
  //语音  --按住说话
  touchStart: function (e) {
    this.setData({
      recordState: true  //录音状态
    })
    // 语音开始识别
    manager.start({
      lang: 'zh_CN',// 识别的语言，目前支持zh_CN en_US zh_HK sichuanhua
    })
  },
  //语音  --松开结束
  touchEnd: function (e) {
    this.setData({
      recordState: false
    })
    // 语音结束识别
    manager.stop();
  },
})
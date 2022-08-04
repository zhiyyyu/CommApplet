//app.js
App({
  globalData: {
    // 腾讯云物联网通信平台中获取 产品ID和设备名称
    productId: "98HK7MLEME", // 产品ID
    deviceName: "hi3861_mqtt", // 设备名称
    // 腾讯云控制台-访问管理-访问密钥-API密钥管理中获取 SecretId, SecretKey
    secretId: "AKIDpSoujJcePu85mDNGsEJ7euud4F9m8E3c",
    secretKey: "JL6anjOnvmMjsl11mGTP4TcU5QUHm1zh",
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: "langya-9g59kr7kc937fff5",
        traceUser: true,
      })
    }
  }
})
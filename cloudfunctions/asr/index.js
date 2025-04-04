// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const tcb = require('@cloudbase/node-sdk');  //正确引入tcb sdk
const tencentcloud = require('tencentcloud-sdk-nodejs');  //调用腾讯云API

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //初始化云开发环境
  const app = tcb.init({
    env: tcb.SYMBOL_CURRENT_ENV //动态环境绑定
});

const { Audio } = tcb.cloud.database();
const { CloudAPI } = tcb.TcbServiceSdk;
const { Credential } = tencentcloud.common;
const { AsrClient } = tencentcloud.asr.v20190614;

const cred = new Credential(event.SecretId, event.SecretKey);   //读取API的 ID和Key
const client = new AsrClient(cred, '');  //初始化客户端（安全推荐：环境变量管理密钥）

const audio = await Audio.get(event.fileID);    //读取音频文件

const params = {      //构建参数
  EngineModelType: '8k_0', //采样率
  ChannelNum: 1,  //单声道
  ResTextFormat: 0,  //0是带时间戳的json 1是纯文本
  Data: audio.fileContent.toString('base64') //音频参数 需确保音频二进制正确 转换为base64
};

//使用腾讯云的Node.js SDK调用语音识别接口时，构造了一个`CreateRecTaskRequest`的实例，并尝试将参数转换成JSON字符串来初始化请求；现在最新的SDK通常采用更简洁的方式，直接传递参数对象，而不需要手动转换成JSON字符串
const req = new tencentcloud.asr.v20190614.models.CreateRecTaskRequest();
req.from_json_string(JSON.stringify(params));


return new Promise((resolve, reject) => {
  client.CreateRecTask(req, (errMsg, response) => {
      if (errMsg) {
          console.error(errMsg);
          reject(errMsg);
      } else {
          console.log(response.to_json_string());
          resolve(response);
      }
  }
)})



/*
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  } */
}
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try{
  return await db.collection('score1').where({
    minute: _.exists(true)       //只要minute有值就删除
  }).remove()
}catch(e){
  console.error(e)
}
  }

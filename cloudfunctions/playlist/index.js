// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()   
const db=cloud.database();   

let playlistCollection=db.collection("testdatabase")   //连上数据库

// 云函数入口函数
exports.main = async (event, context) => {
  const countResult = await playlistCollection.count() //拿到对象
  const total = countResult.total //拿到数据的总数
  const batchTimes = Math.ceil(total/100) //分几次取，次数向上取整 最大数限制MAX_LIMIT 这里是100
  let all = []

     for (let i = 0; i < total; i += 100) {
       let promise = await db.collection("testdatabase").skip(i).get()
       all = all.concat(promise.data);
     }
     console.log(all);
 return {
  total: total ,    //这样成功了
  batchTimes: batchTimes,
  all: all,    //所有的数据集数据
  ph:"ss"
}
  
}
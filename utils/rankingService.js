/**
 * 排名服务模块
 * 提供高效的排名计算功能，保证每个用户每道题只有一条记录
 */

// 缓存相关常量
const RANKING_CACHE_DURATION = 5 * 60 * 1000;  // 排名缓存5分钟
const STATS_CACHE_DURATION = 30 * 60 * 1000;   // 统计数据缓存30分钟

// 导出API函数
module.exports = {
  getUserRanking,     // 获取用户排名（主函数）
  clearRankingCache,  // 清除用户排名缓存
  clearStatisticsCache, // 清除题目统计缓存
  saveUserRecord,     // 保存用户答题记录
  getUserHistoryRecord, // 获取用户历史记录
  getUserAverageRanking, // 获取用户平均排名
  constants: {
    RANKING_CACHE_DURATION,
    STATS_CACHE_DURATION
  }
};

/**
 * 获取用户排名
 * @param {Object} params 参数对象
 * @param {Number} params.qnumber 题目编号
 * @param {String} params.username 用户名
 * @param {Number} params.minute 用时(分)
 * @param {Number} params.second 用时(秒)
 * @param {Boolean} params.isNewSubmission 是否新提交的答案
 * @returns {Promise<Object>} 排名数据
 */
async function getUserRanking(params) {
  const { qnumber, username, minute, second, isNewSubmission = false } = params;
  
  try {
    // 计算用户当前提交的总用时(秒)
    const currentTotalSeconds = minute * 60 + second;
    
    // 1. 检查用户是否已有历史记录
    const userRecord = await getUserHistoryRecord(qnumber, username);
    
    // 2. 确定使用的时间数据
    let finalTotalSeconds;
    let isHistoryRecord = false;
    
    if (userRecord) {
      // 如果有历史记录，使用历史记录中的时间计算排名
      finalTotalSeconds = userRecord.total_seconds;
      isHistoryRecord = true;
      console.log('使用历史记录计算排名:', finalTotalSeconds, '秒');
    } else {
      // 如果没有历史记录，使用当前提交的时间
      finalTotalSeconds = currentTotalSeconds;
      console.log('使用当前提交计算排名:', finalTotalSeconds, '秒');
      
      // 如果是新提交的答案，保存用户记录
      if (isNewSubmission) {
        console.log('保存新提交的答题记录');
        await saveUserRecord({
          qnumber,
          username,
          minute,
          second,
          total_seconds: currentTotalSeconds
        });
      }
    }
    
    // 3. 检查本地缓存中是否有排名数据
    const cachedRanking = getFromLocalCache(qnumber, username);
    if (cachedRanking) {
      console.log('使用缓存的排名数据');
      
      // 将时间数据添加到缓存结果中
      return {
        ...cachedRanking,
        isHistoryRecord: isHistoryRecord,
        ...(isHistoryRecord ? {
          // 历史记录的时间数据
          userMinute: userRecord.minute,
          userSecond: userRecord.second,
          userTotalSeconds: userRecord.total_seconds,
          // 当前提交的时间数据
          currentMinute: minute,
          currentSecond: second,
          currentTotalSeconds: currentTotalSeconds
        } : {
          // 首次提交的时间数据
          userMinute: minute,
          userSecond: second,
          userTotalSeconds: currentTotalSeconds
        })
      };
    }
    
    // 4. 没有缓存，计算新的排名数据
    console.log('计算新的排名数据');
    const rankingData = await calculateStatisticalRanking(qnumber, finalTotalSeconds);
    
    // 5. 构建完整的排名结果
    const result = {
      ...rankingData,
      isHistoryRecord: isHistoryRecord,
      ...(isHistoryRecord ? {
        // 历史记录的时间数据
        userMinute: userRecord.minute,
        userSecond: userRecord.second,
        userTotalSeconds: userRecord.total_seconds,
        // 当前提交的时间数据
        currentMinute: minute,
        currentSecond: second,
        currentTotalSeconds: currentTotalSeconds
      } : {
        // 首次提交的时间数据
        userMinute: minute,
        userSecond: second,
        userTotalSeconds: currentTotalSeconds
      })
    };
    
    // 6. 缓存计算结果
    saveToLocalCache(qnumber, username, result);
    
    return result;
  } catch (error) {
    console.error('获取排名失败', error);
    
    // 发生错误时返回默认排名
    return {
      totalCount: 1,
      slowerCount: 0,
      beatPercent: 0,
      source: 'error',
      userMinute: minute,
      userSecond: second,
      userTotalSeconds: minute * 60 + second,
      isHistoryRecord: false
    };
  }
}

/**
 * 清除用户排名缓存
 * @param {Number} qnumber 题目编号
 * @param {String} username 用户名
 */
function clearRankingCache(qnumber, username) {
  const cacheKey = `ranking_${qnumber}_${username}`;
  
  try {
    wx.removeStorageSync(cacheKey);
    console.log('已清除排名缓存', cacheKey);
  } catch (e) {
    console.error('清除缓存失败', e);
  }
}

/**
 * 查询用户历史答题记录
 * @param {Number} qnumber 题目编号
 * @param {String} username 用户名
 * @returns {Promise<Object|null>} 历史记录或null
 */
async function getUserHistoryRecord(qnumber, username) {
  console.log('查询用户历史记录:', qnumber, username);
  
  try {
    // 查询数据库
    const db = wx.cloud.database();
    const scoreCollection = db.collection('score1');
    
    const result = await scoreCollection.where({
      qnumber: qnumber,
      username: username
    }).get();
    
    console.log('历史记录查询结果:', result);
    
    // 检查是否找到记录
    if (result.data && result.data.length > 0) {
      console.log('找到历史记录:', result.data[0]);
      return result.data[0];
    } else {
      console.log('未找到历史记录');
      return null;
    }
  } catch (error) {
    console.error('查询历史记录失败:', error);
    return null;
  }
}

/**
 * 保存用户答题记录
 * @param {Object} params 参数对象
 * @param {Number} params.qnumber 题目编号
 * @param {String} params.username 用户名
 * @param {Number} params.minute 用时(分)
 * @param {Number} params.second 用时(秒)
 * @param {Number} params.total_seconds 总用时(秒)
 * @returns {Promise<Boolean>} 是否保存成功
 */
async function saveUserRecord(params) {
  const { qnumber, username, minute, second, total_seconds } = params;
  
  try {
    // 先检查是否有历史记录
    const existingRecord = await getUserHistoryRecord(qnumber, username);
    
    // 如果已有记录，不再添加
    if (existingRecord) {
      console.log('用户已有记录，不再添加', existingRecord);
      return true;
    }
    
    // 没有记录，添加新记录
    const db = wx.cloud.database();
    const scoreCollection = db.collection('score1');
    
    // 创建新记录
    const result = await scoreCollection.add({
      data: {
        qnumber: qnumber,
        username: username,
        minute: minute,
        second: second,
        total_seconds: total_seconds,
        created_at: db.serverDate() // 使用服务器时间
      }
    });
    
    console.log('添加记录成功:', result);
    return true;
  } catch (error) {
    console.error('保存用户记录失败:', error);
    return false;
  }
}

/**
 * 从本地缓存获取排名数据
 * @param {Number} qnumber 题目编号
 * @param {String} username 用户名
 * @returns {Object|null} 缓存的排名数据或null
 */
function getFromLocalCache(qnumber, username) {
  const cacheKey = `ranking_${qnumber}_${username}`;
  
  try {
    // 从本地存储获取数据
    const cachedData = wx.getStorageSync(cacheKey);
    
    // 如果没有缓存数据，返回null
    if (!cachedData) {
      console.log('本地缓存中没有数据:', cacheKey);
      return null;
    }
    
    // 检查缓存是否有效
    if (isCacheValid(cachedData.timestamp, RANKING_CACHE_DURATION)) {
      console.log('使用本地缓存数据:', cacheKey);
      return cachedData.data;
    } else {
      console.log('缓存已过期:', cacheKey);
      return null;
    }
  } catch (error) {
    console.error('读取本地缓存失败:', error);
    return null;
  }
}

/**
 * 保存排名数据到本地缓存
 * @param {Number} qnumber 题目编号
 * @param {String} username 用户名
 * @param {Object} data 要缓存的排名数据
 */
function saveToLocalCache(qnumber, username, data) {
  const cacheKey = `ranking_${qnumber}_${username}`;
  
  try {
    // 添加时间戳用于缓存有效期判断
    const cacheData = {
      data: data,
      timestamp: Date.now() // 当前时间戳
    };
    
    // 存储到本地
    wx.setStorageSync(cacheKey, cacheData);
    console.log('排名数据已保存到本地缓存:', cacheKey);
  } catch (error) {
    console.error('保存到本地缓存失败:', error);
  }
}

/**
 * 检查缓存是否在有效期内
 * @param {Number} timestamp 缓存创建的时间戳
 * @param {Number} duration 缓存有效时长(毫秒)
 * @returns {Boolean} 缓存是否有效
 */
function isCacheValid(timestamp, duration) {
  const now = Date.now();
  const age = now - timestamp;
  
  return age < duration;
}

/**
 * 计算用户的统计排名（高效版）
 * @param {Number} qnumber 题目编号
 * @param {Number} totalSeconds 用户总用时(秒)
 * @returns {Promise<Object>} 排名统计数据
 */
async function calculateStatisticalRanking(qnumber, totalSeconds) {
  console.log('计算统计排名(高效版):', qnumber, totalSeconds);
  
  try {
    // 1. 检查题目统计缓存 - 首先尝试从本地缓存获取题目的总人数信息
    const statsKey = `question_stats_${qnumber}`;
    let questionStats = wx.getStorageSync(statsKey);
    
    // 如果缓存存在且有效期内，直接使用缓存数据
    if (questionStats && isCacheValid(questionStats.timestamp, STATS_CACHE_DURATION)) {
      console.log('使用缓存的题目统计信息:', qnumber);
    } else {
      // 缓存无效或不存在，从数据库重新获取总答题人数
      console.log('获取题目答题人数:', qnumber);
      const db = wx.cloud.database();
      // 直接使用count()操作只获取记录数，不传输记录内容，减少网络流量
      const countResult = await db.collection('score1').where({ qnumber }).count();
      
      // 构造新的统计数据，仅包含总人数信息
      questionStats = {
        data: { totalCount: countResult.total || 0 }, // 防止null值
        timestamp: Date.now() // 记录缓存创建时间
      };
      
      // 将新数据写入缓存，有效期30分钟
      wx.setStorageSync(statsKey, questionStats);
    }
    
    // 从统计数据或缓存中获取总人数
    const totalCount = questionStats.data.totalCount;
    
    // 2. 使用高效的数据库查询获取比用户慢的人数
    // 这比获取所有记录然后在客户端过滤要高效得多
    const db = wx.cloud.database();
    const _ = db.command; // 获取数据库查询指令
    // 只统计比用户用时更长的记录数量，不获取记录内容
    const slowerResult = await db.collection('score1').where({
      qnumber: qnumber,
      total_seconds: _.gt(totalSeconds) // 用时大于用户用时的记录
    }).count();
    
    // 获取比用户慢的人数
    const slowerCount = slowerResult.total || 0;
    
    // 3. 计算用户击败的百分比
    // 四舍五入为整数百分比，防止除以零错误
    const beatPercent = totalCount > 0 ? Math.round(slowerCount / totalCount * 100) : 0;
    
    // 返回排名结果，标记数据来源为优化后的数据库查询
    return {
      totalCount,        // 总答题人数
      slowerCount,       // 比用户慢的人数
      beatPercent,       // 击败百分比
      source: 'db_optimized' // 数据来源标识
    };
  } catch (error) {
    // 出错时记录错误并返回默认值
    console.error('计算统计排名失败:', error);
    return {
      totalCount: 0,     // 默认总人数为0
      slowerCount: 0,    // 默认比用户慢的人数为0
      beatPercent: 0,    // 默认击败百分比为0
      source: 'error'    // 标记为错误来源
    };
  }
}

/**
 * 批量清除题目统计缓存
 * 在题库更新或答题记录有大量变化时调用
 * @param {Number[]} qnumbers 要清除缓存的题目编号数组，不传则清除所有缓存
 * @returns {Number} 清除的缓存数量
 */
function clearStatisticsCache(qnumbers) {
  console.log('清除题目统计缓存');
  
  try {
    let clearedCount = 0;
    
    // 如果指定了题目编号，只清除这些题目的缓存
    if (qnumbers && qnumbers.length > 0) {
      qnumbers.forEach(qnumber => {
        const cacheKey = `question_stats_${qnumber}`;
        wx.removeStorageSync(cacheKey);
        clearedCount++;
      });
      console.log(`已清除${clearedCount}个指定题目的统计缓存`);
    } 
    // 否则清除所有题目统计缓存
    else {
      // 获取所有storage keys
      const keys = wx.getStorageInfoSync().keys || [];
      
      // 筛选出题目统计缓存的keys
      const statsCacheKeys = keys.filter(key => key.startsWith('question_stats_'));
      
      // 清除这些缓存
      statsCacheKeys.forEach(key => {
        wx.removeStorageSync(key);
        clearedCount++;
      });
      
      console.log(`已清除所有题目统计缓存，共${clearedCount}个`);
    }
    
    return clearedCount;
  } catch (error) {
    console.error('清除题目统计缓存失败:', error);
    return 0;
  }
}

/**
 * 获取用户在所有已完成题目中的平均排名百分比
 * @param {String} username 用户名
 * @returns {Promise<Number>} 平均排名百分比
 */
async function getUserAverageRanking(username) {
  console.log('获取用户平均排名:', username);
  
  try {
    // 查询该用户的所有答题记录
    const db = wx.cloud.database();
    const scoreCollection = db.collection('score1');
    
    const result = await scoreCollection.where({
      username: username
    }).get();
    
    const records = result.data || [];
    
    // 如果没有记录，返回0
    if (records.length === 0) {
      return 0;
    }
    
    // 计算每道题的排名
    let totalPercent = 0;
    let validRecordCount = 0;
    
    // 逐个计算每道题的排名并累加
    for (const record of records) {
      // 使用现有的排名计算函数
      const ranking = await getUserRanking({
        qnumber: record.qnumber,
        username: username,
        minute: record.minute,
        second: record.second,
        isNewSubmission: false
      });
      
      // 只累计有效的排名结果
      if (ranking.source !== 'error' && ranking.totalCount > 1) {
        totalPercent += ranking.beatPercent;
        validRecordCount++;
      }
    }
    
    // 计算平均值，如果没有有效记录，返回0
    const averagePercent = validRecordCount > 0 ? 
      Math.round(totalPercent / validRecordCount) : 0;
    
    console.log(`用户${username}的平均排名百分比:`, averagePercent);
    return averagePercent;
  } catch (error) {
    console.error('获取用户平均排名失败:', error);
    return 0;
  }
}

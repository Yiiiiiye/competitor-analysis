const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/competitor-report')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

const Competitor = require('./models/Competitor');

async function testCrawler() {
  try {
    console.log('=== 开始测试爬虫功能 ===\n');
    
    const testCompetitor = new Competitor({
      name: '测试竞品-微博',
      business: '测试业务',
      channels: '微博',
      priority: '高',
      autoFetchEnabled: true,
      socialAccounts: {
        weibo: {
          enabled: true,
          accountId: '1739046297',
          lastFetchTime: null
        },
        douyin: {
          enabled: false,
          accountId: '',
          lastFetchTime: null
        },
        xiaohongshu: {
          enabled: false,
          accountId: '',
          lastFetchTime: null
        },
        bilibili: {
          enabled: false,
          accountId: '',
          lastFetchTime: null
        }
      }
    });
    
    await testCompetitor.save();
    console.log('测试竞品创建成功，ID:', testCompetitor._id);
    console.log('竞品配置:', JSON.stringify(testCompetitor.socialAccounts, null, 2));
    
    console.log('\n开始抓取...');
    
    const response = await axios.post(`http://localhost:5000/api/crawler/fetch/${testCompetitor._id}`);
    console.log('\n抓取结果:', JSON.stringify(response.data, null, 2));
    
    console.log('\n=== 测试完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('\n测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testCrawler();

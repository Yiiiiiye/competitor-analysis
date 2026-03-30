const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/competitor-report')
    .then(() => console.log('MongoDB连接成功'))
    .catch(err => console.error('MongoDB连接失败:', err));

const Competitor = require('./models/Competitor');

async function testCrawler() {
    try {
        console.log('=== 开始测试爬虫功能 ===\n');

        const competitors = await Competitor.find();
        console.log(`找到 ${competitors.length} 个竞品`);

        if (competitors.length === 0) {
            console.log('\n没有竞品数据，创建测试竞品...');

            const testCompetitor = new Competitor({
                name: '测试竞品',
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

            competitors.push(testCompetitor);
        }

        for (const competitor of competitors) {
            console.log(`\n--- 测试竞品: ${competitor.name} ---`);
            console.log('自动抓取:', competitor.autoFetchEnabled);
            console.log('社交媒体配置:', JSON.stringify(competitor.socialAccounts, null, 2));

            if (competitor.autoFetchEnabled) {
                console.log('\n开始抓取...');

                try {
                    const response = await axios.post(`http://localhost:5000/api/crawler/fetch/${competitor._id}`);
                    console.log('抓取结果:', response.data);
                } catch (error) {
                    console.error('抓取失败:', error.message);
                    if (error.response) {
                        console.error('响应状态:', error.response.status);
                        console.error('响应数据:', error.response.data);
                    }
                }
            } else {
                console.log('该竞品未启用自动抓取');
            }
        }

        console.log('\n=== 测试完成 ===');
        process.exit(0);
    } catch (error) {
        console.error('测试失败:', error);
        process.exit(1);
    }
}

testCrawler();

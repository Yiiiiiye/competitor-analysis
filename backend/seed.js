const mongoose = require('mongoose');
const User = require('./models/User');
const Competitor = require('./models/Competitor');
const Dynamic = require('./models/Dynamic');
const Report = require('./models/Report');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/competitor-report';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB连接成功');

    await User.deleteMany({});
    await Competitor.deleteMany({});
    await Dynamic.deleteMany({});
    await Report.deleteMany({});

    const users = [
      { username: 'admin', password: 'admin123' },
      { username: 'testuser', password: 'test123' }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ 用户数据插入成功');

    const competitors = [
      {
        name: '竞品A',
        business: '电商',
        channels: '官网,APP,小程序',
        priority: '高',
        socialAccounts: {
          weibo: { enabled: true, accountId: 'weibo_a' },
          douyin: { enabled: true, accountId: 'douyin_a' },
          xiaohongshu: { enabled: false },
          bilibili: { enabled: true, accountId: 'bilibili_a' }
        },
        autoFetchEnabled: true
      },
      {
        name: '竞品B',
        business: '社交',
        channels: 'APP,官网',
        priority: '中',
        socialAccounts: {
          weibo: { enabled: true, accountId: 'weibo_b' },
          douyin: { enabled: false },
          xiaohongshu: { enabled: true, accountId: 'xhs_b' },
          bilibili: { enabled: false }
        },
        autoFetchEnabled: true
      },
      {
        name: '竞品C',
        business: '内容',
        channels: '网站,APP',
        priority: '低',
        socialAccounts: {
          weibo: { enabled: false },
          douyin: { enabled: true, accountId: 'douyin_c' },
          xiaohongshu: { enabled: true, accountId: 'xhs_c' },
          bilibili: { enabled: true, accountId: 'bilibili_c' }
        },
        autoFetchEnabled: false
      }
    ];

    const createdCompetitors = await Competitor.insertMany(competitors);
    console.log('✅ 竞品数据插入成功');

    const dynamics = [
      {
        competitorId: createdCompetitors[0]._id,
        title: '竞品A发布新版本APP',
        channel: '官网',
        publishTime: new Date('2026-03-10'),
        content: '竞品A发布了全新的APP版本，增加了AI推荐功能，用户体验大幅提升。新版本支持个性化内容推荐，智能搜索等功能。'
      },
      {
        competitorId: createdCompetitors[0]._id,
        title: '竞品A推出会员优惠活动',
        channel: 'APP',
        publishTime: new Date('2026-03-12'),
        content: '竞品A推出限时会员优惠活动，新用户首月仅需9.9元，包含所有高级功能。活动持续到本月底。'
      },
      {
        competitorId: createdCompetitors[0]._id,
        title: '竞品A在微博发布品牌宣传',
        channel: '微博',
        publishTime: new Date('2026-03-14'),
        content: '竞品A在微博发布了新的品牌宣传视频，获得了大量转发和点赞，提升了品牌知名度。'
      },
      {
        competitorId: createdCompetitors[1]._id,
        title: '竞品B上线新社交功能',
        channel: 'APP',
        publishTime: new Date('2026-03-11'),
        content: '竞品B上线了全新的社交功能，支持群聊、语音通话、视频会议等功能，用户活跃度显著提升。'
      },
      {
        competitorId: createdCompetitors[1]._id,
        title: '竞品B获得新一轮融资',
        channel: '官网',
        publishTime: new Date('2026-03-13'),
        content: '竞品B宣布完成C轮融资，融资金额达到5000万美元，将用于产品研发和市场拓展。'
      },
      {
        competitorId: createdCompetitors[1]._id,
        title: '竞品B在小红书推广',
        channel: '小红书',
        publishTime: new Date('2026-03-15'),
        content: '竞品B在小红书平台进行了大规模推广，与多位KOL合作，获得了良好的市场反响。'
      },
      {
        competitorId: createdCompetitors[2]._id,
        title: '竞品C推出付费内容',
        channel: '网站',
        publishTime: new Date('2026-03-09'),
        content: '竞品C开始推出付费内容服务，提供高质量的专业内容，用户需要订阅才能访问。'
      },
      {
        competitorId: createdCompetitors[2]._id,
        title: '竞品C在抖音直播',
        channel: '抖音',
        publishTime: new Date('2026-03-16'),
        content: '竞品C在抖音进行了多场直播活动，吸引了大量观众，提升了用户参与度。'
      }
    ];

    await Dynamic.insertMany(dynamics);
    console.log('✅ 动态数据插入成功');

    const reports = [
      {
        title: '2026年3月第2周竞品动态周报',
        createTime: new Date('2026-03-17'),
        content: {
          summary: '本周竞品动态活跃，竞品A和竞品B都有重要产品更新和融资消息，竞品C在内容付费方面有所突破。整体市场竞争加剧，需要密切关注各竞品的动向。',
          competitorDynamic: '竞品A：发布新版本APP，推出会员优惠活动，在微博进行品牌宣传\n竞品B：上线新社交功能，获得C轮融资，在小红书推广\n竞品C：推出付费内容服务，在抖音进行直播活动',
          riskAnalysis: '1. 竞品A的新版本APP增加了AI功能，可能对用户体验产生较大影响\n2. 竞品B获得大额融资，可能加大市场投入，竞争压力增大\n3. 竞品C的付费内容模式可能影响我们的内容策略\n4. 各竞品都在积极拓展社交媒体渠道，需要加强我们的社交媒体运营',
          suggestion: '1. 加快产品功能迭代，特别是AI相关功能的研发\n2. 准备应对竞品B的市场攻势，制定相应的营销策略\n3. 评估付费内容模式的可行性，考虑是否跟进\n4. 加强在各大社交媒体平台的运营和推广\n5. 建立更完善的竞品监控机制，及时发现和应对竞品动态'
        }
      }
    ];

    await Report.insertMany(reports);
    console.log('✅ 周报数据插入成功');

    console.log('\n🎉 样例数据插入完成！');
    console.log('登录账号：');
    console.log('  用户名：admin，密码：admin123');
    console.log('  用户名：testuser，密码：test123');

  } catch (error) {
    console.error('插入数据失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
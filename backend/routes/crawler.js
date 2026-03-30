const express = require('express');
const router = express.Router();
const Competitor = require('../models/Competitor');
const Dynamic = require('../models/Dynamic');
const axios = require('axios');

const CRAWLER_SERVICE_URL = 'http://127.0.0.1:5001';

router.post('/fetch/:competitorId', async (req, res) => {
  const { competitorId } = req.params;

  try {
    console.log(`[爬虫] 开始抓取竞品，ID: ${competitorId}`);

    const competitor = await Competitor.findById(competitorId);
    if (!competitor) {
      console.log(`[爬虫] 竞品不存在，ID: ${competitorId}`);
      return res.status(404).json({ success: false, message: '竞品不存在' });
    }

    console.log(`[爬虫] 找到竞品: ${competitor.name}`);
    console.log(`[爬虫] 竞品配置:`, JSON.stringify(competitor.socialAccounts, null, 2));

    const response = await axios.post(`${CRAWLER_SERVICE_URL}/api/crawl`, {
      competitor: competitor.toObject()
    });

    console.log(`[爬虫] 爬虫服务响应:`, JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      const dynamics = response.data.data;
      console.log(`[爬虫] 获取到 ${dynamics.length} 条动态`);

      let savedCount = 0;
      let skippedCount = 0;

      for (const dynamicData of dynamics) {
        const existingDynamic = await Dynamic.findOne({
          competitorId: dynamicData.competitorId,
          title: dynamicData.title,
          channel: dynamicData.channel
        });

        if (!existingDynamic) {
          const newDynamic = new Dynamic({
            competitorId: dynamicData.competitorId,
            title: dynamicData.title,
            channel: dynamicData.channel,
            publishTime: dynamicData.publishTime,
            content: dynamicData.content
          });
          await newDynamic.save();
          savedCount++;
          console.log(`[爬虫] 保存动态: ${dynamicData.title.substring(0, 50)}...`);
        } else {
          skippedCount++;
          console.log(`[爬虫] 跳过重复动态: ${dynamicData.title.substring(0, 50)}...`);
        }
      }

      await Competitor.findByIdAndUpdate(competitorId, {
        'socialAccounts.weibo.lastFetchTime': new Date(),
        'socialAccounts.douyin.lastFetchTime': new Date(),
        'socialAccounts.xiaohongshu.lastFetchTime': new Date(),
        'socialAccounts.bilibili.lastFetchTime': new Date()
      });

      console.log(`[爬虫] 抓取完成 - 新增: ${savedCount}, 跳过: ${skippedCount}`);

      res.json({
        success: true,
        message: `成功抓取 ${dynamics.length} 条动态（新增 ${savedCount} 条，跳过 ${skippedCount} 条重复）`,
        data: dynamics,
        savedCount,
        skippedCount
      });
    } else {
      console.log(`[爬虫] 爬虫服务返回错误:`, response.data.message);
      res.status(500).json({ success: false, message: '爬虫服务错误' });
    }
  } catch (error) {
    console.error('[爬虫] 抓取错误:', error.message);
    console.error('[爬虫] 错误详情:', error);
    if (error.response) {
      console.error('[爬虫] 响应状态:', error.response.status);
      console.error('[爬虫] 响应数据:', error.response.data);
    }
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

router.post('/fetch-all', async (req, res) => {
  try {
    console.log('[爬虫] 开始批量抓取所有竞品');

    const competitors = await Competitor.find({ autoFetchEnabled: true });
    console.log(`[爬虫] 找到 ${competitors.length} 个启用自动抓取的竞品`);

    let totalFetched = 0;
    let totalSaved = 0;
    let totalSkipped = 0;
    let errors = [];

    for (const competitor of competitors) {
      try {
        console.log(`[爬虫] 正在抓取竞品: ${competitor.name}`);

        const response = await axios.post(`${CRAWLER_SERVICE_URL}/api/crawl`, {
          competitor: competitor.toObject()
        });

        if (response.data.success) {
          const dynamics = response.data.data;
          console.log(`[爬虫] ${competitor.name} 获取到 ${dynamics.length} 条动态`);

          let savedCount = 0;
          let skippedCount = 0;

          for (const dynamicData of dynamics) {
            const existingDynamic = await Dynamic.findOne({
              competitorId: dynamicData.competitorId,
              title: dynamicData.title,
              channel: dynamicData.channel
            });

            if (!existingDynamic) {
              const newDynamic = new Dynamic({
                competitorId: dynamicData.competitorId,
                title: dynamicData.title,
                channel: dynamicData.channel,
                publishTime: dynamicData.publishTime,
                content: dynamicData.content
              });
              await newDynamic.save();
              savedCount++;
            } else {
              skippedCount++;
            }
          }

          totalFetched += dynamics.length;
          totalSaved += savedCount;
          totalSkipped += skippedCount;

          console.log(`[爬虫] ${competitor.name} 完成 - 新增: ${savedCount}, 跳过: ${skippedCount}`);

          await Competitor.findByIdAndUpdate(competitor._id, {
            'socialAccounts.weibo.lastFetchTime': new Date(),
            'socialAccounts.douyin.lastFetchTime': new Date(),
            'socialAccounts.xiaohongshu.lastFetchTime': new Date(),
            'socialAccounts.bilibili.lastFetchTime': new Date()
          });
        }
      } catch (error) {
        console.error(`[爬虫] ${competitor.name} 抓取失败:`, error.message);
        errors.push({
          competitor: competitor.name,
          error: error.message
        });
      }
    }

    console.log(`[爬虫] 批量抓取完成 - 总获取: ${totalFetched}, 总新增: ${totalSaved}, 总跳过: ${totalSkipped}`);

    res.json({
      success: true,
      message: `成功抓取 ${totalFetched} 条动态（新增 ${totalSaved} 条，跳过 ${totalSkipped} 条重复）`,
      totalFetched,
      totalSaved,
      totalSkipped,
      errors
    });
  } catch (error) {
    console.error('[爬虫] 批量抓取错误:', error.message);
    console.error('[爬虫] 错误详情:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    console.log('[爬虫] 检查爬虫服务状态');
    const response = await axios.get(`${CRAWLER_SERVICE_URL}/api/health`);
    console.log('[爬虫] 爬虫服务状态:', response.data.status);
    res.json({ success: true, status: response.data.status });
  } catch (error) {
    console.error('[爬虫] 爬虫服务离线:', error.message);
    res.json({ success: false, status: 'offline', message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Competitor = require('../models/Competitor');
const Dynamic = require('../models/Dynamic');
const AIReportGenerator = require('../utils/aiReportGenerator');

// 获取所有周报
router.get('/', async (req, res) => {
  const { timeRange } = req.query;

  try {
    let query = {};

    if (timeRange) {
      const now = new Date();
      let timeStart = new Date();

      if (timeRange === 'month') {
        timeStart.setMonth(now.getMonth() - 1);
      } else if (timeRange === 'quarter') {
        timeStart.setMonth(now.getMonth() - 3);
      }

      query.createTime = { $gte: timeStart };
    }

    const reports = await Report.find(query);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加周报
router.post('/', async (req, res) => {
  const { title, content } = req.body;

  try {
    const newReport = new Report({ title, content });
    await newReport.save();
    res.json({ success: true, data: newReport });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新周报
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const report = await Report.findByIdAndUpdate(id, { title, content }, { new: true });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除周报
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Report.findByIdAndDelete(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// AI生成周报
router.post('/ai-generate', async (req, res) => {
  try {
    const { timeRange } = req.body;

    let timeFilter = {};
    if (timeRange) {
      const now = new Date();
      let timeStart = new Date();

      if (timeRange === 'week') {
        timeStart.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        timeStart.setMonth(now.getMonth() - 1);
      } else if (timeRange === 'quarter') {
        timeStart.setMonth(now.getMonth() - 3);
      }

      timeFilter = { publishTime: { $gte: timeStart } };
    } else {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      timeFilter = { publishTime: { $gte: weekAgo } };
    }

    const competitors = await Competitor.find({});
    const dynamics = await Dynamic.find(timeFilter).sort({ publishTime: -1 });

    if (dynamics.length === 0) {
      return res.json({
        success: false,
        message: '当前时间范围内没有竞品动态，无法生成周报'
      });
    }

    const aiGenerator = new AIReportGenerator();
    const reportContent = await aiGenerator.generateReport(competitors, dynamics);

    res.json({
      success: true,
      data: reportContent,
      meta: {
        competitorCount: competitors.length,
        dynamicCount: dynamics.length,
        timeRange: timeRange || 'week'
      }
    });
  } catch (error) {
    console.error('AI生成周报失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI生成周报失败'
    });
  }
});

module.exports = router;

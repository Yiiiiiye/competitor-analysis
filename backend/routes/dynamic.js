const express = require('express');
const router = express.Router();
const Dynamic = require('../models/Dynamic');

// 获取所有动态
router.get('/', async (req, res) => {
  const { competitorId, timeRange } = req.query;
  
  try {
    let query = {};
    
    if (competitorId) {
      query.competitorId = competitorId;
    }
    
    if (timeRange) {
      const now = new Date();
      let timeStart = new Date();
      
      if (timeRange === 'week') {
        timeStart.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        timeStart.setMonth(now.getMonth() - 1);
      }
      
      query.publishTime = { $gte: timeStart };
    }
    
    const dynamics = await Dynamic.find(query).populate('competitorId');
    res.json({ success: true, data: dynamics });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加动态
router.post('/', async (req, res) => {
  const { competitorId, title, channel, publishTime, content } = req.body;
  
  try {
    const newDynamic = new Dynamic({ competitorId, title, channel, publishTime, content });
    await newDynamic.save();
    res.json({ success: true, data: newDynamic });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新动态
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { competitorId, title, channel, publishTime, content } = req.body;
  
  try {
    const dynamic = await Dynamic.findByIdAndUpdate(id, { competitorId, title, channel, publishTime, content }, { new: true });
    res.json({ success: true, data: dynamic });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除动态
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await Dynamic.findByIdAndDelete(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;

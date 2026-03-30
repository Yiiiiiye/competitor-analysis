const express = require('express');
const router = express.Router();
const Competitor = require('../models/Competitor');

// 获取所有竞品
router.get('/', async (req, res) => {
  try {
    const competitors = await Competitor.find();
    res.json({ success: true, data: competitors });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加竞品
router.post('/', async (req, res) => {
  const { name, business, channels, priority } = req.body;
  
  try {
    const newCompetitor = new Competitor({ name, business, channels, priority });
    await newCompetitor.save();
    res.json({ success: true, data: newCompetitor });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新竞品
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, business, channels, priority } = req.body;
  
  try {
    const competitor = await Competitor.findByIdAndUpdate(id, { name, business, channels, priority }, { new: true });
    res.json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除竞品
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await Competitor.findByIdAndDelete(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  business: {
    type: String
  },
  channels: {
    type: String
  },
  priority: {
    type: String,
    enum: ['高', '中', '低'],
    default: '中'
  },
  socialAccounts: {
    weibo: {
      enabled: { type: Boolean, default: false },
      accountId: { type: String },
      lastFetchTime: { type: Date }
    },
    douyin: {
      enabled: { type: Boolean, default: false },
      accountId: { type: String },
      lastFetchTime: { type: Date }
    },
    xiaohongshu: {
      enabled: { type: Boolean, default: false },
      accountId: { type: String },
      lastFetchTime: { type: Date }
    },
    bilibili: {
      enabled: { type: Boolean, default: false },
      accountId: { type: String },
      lastFetchTime: { type: Date }
    }
  },
  autoFetchEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Competitor', competitorSchema);

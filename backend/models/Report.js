const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  content: {
    summary: {
      type: String
    },
    competitorDynamic: {
      type: String
    },
    riskAnalysis: {
      type: String
    },
    suggestion: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);

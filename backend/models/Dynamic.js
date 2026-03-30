const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  competitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competitor',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  publishTime: {
    type: Date,
    required: true
  },
  content: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Dynamic', dynamicSchema);

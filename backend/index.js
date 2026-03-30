const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/competitor-report')
.then(() => {
  console.log('MongoDB连接成功');
}).catch(err => {
  console.error('MongoDB连接失败:', err);
  console.log('服务器将在没有数据库连接的情况下启动，某些功能可能无法正常工作');
});

// 路由
const authRoutes = require('./routes/auth');
const competitorRoutes = require('./routes/competitor');
const dynamicRoutes = require('./routes/dynamic');
const reportRoutes = require('./routes/report');
const crawlerRoutes = require('./routes/crawler');

app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/dynamics', dynamicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/crawler', crawlerRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

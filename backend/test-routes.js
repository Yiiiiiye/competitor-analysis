const express = require('express');
const crawlerRoutes = require('./routes/crawler');

const app = express();
app.use(express.json());
app.use('/api/crawler', crawlerRoutes);

app.listen(5002, () => {
  console.log('测试服务器运行在端口 5002');
  console.log('路由已加载:', app._router.stack.map(layer => layer.name || layer.regexp));
});

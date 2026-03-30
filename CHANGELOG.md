# 更新日志

本文档记录竞品更新轻量聚合周报系统的所有重要变更。
以便agent自己查看

## [1.2.0] - 2026-03-17

### 新增功能
- 添加AI智能生成周报功能
- 支持使用Google Gemini API进行周报自动生成
- 集成多种时间范围选择（最近一周/一月/三月/自定义）
- 新增样例数据生成脚本（backend/seed.js）

### 数据模型变更
- 无变更

### 后端新增
- 创建AI报告生成器（backend/utils/aiReportGenerator.js）
- 实现Google Gemini API集成
- 新增AI生成周报接口 POST /api/reports/ai-generate
- 创建样例数据脚本（backend/seed.js）
- 支持快速生成测试数据（用户、竞品、动态、周报）

### 前端变更
- 更新周报页面时间范围选择器
- 优化AI生成功能的类型安全性
- 改进错误处理和用户提示
- 增强AI生成结果的元信息展示

### 配置文件变更
- backend/.env 新增 Google API 配置项
- 支持配置 GOOGLE_API_KEY 和 GOOGLE_API_BASE

### 技术实现
- AI生成器使用Google Gemini 1.5 Flash模型
- 支持JSON格式响应解析
- 改进错误处理和降级策略
- 样例数据脚本支持完整数据集生成

### 部署说明
- 需要配置Google API密钥才能使用AI生成功能
- Google Gemini API有免费层级，适合个人使用
- 运行样例数据脚本：cd backend && node seed.js

### 注意事项
- AI生成功能需要配置有效的API密钥
- 样例数据会清空现有数据，请谨慎使用
- Google API密钥请妥善保管，不要提交到代码仓库

---

## [1.1.0] - 2026-03-11

### 新增功能
- 实现竞品社交媒体自动抓取功能
- 支持从微博、抖音、小红书、B站自动抓取竞品动态
- 添加竞品社交媒体账号配置功能
- 实现单个竞品自动抓取
- 实现批量竞品自动抓取
- 添加爬虫服务健康检查接口

### 数据模型变更
- Competitor模型新增socialAccounts字段，支持配置多个社交媒体账号
- Competitor模型新增autoFetchEnabled字段，控制是否启用自动抓取
- socialAccounts包含微博、抖音、小红书、B站四个平台的配置
- 每个平台配置包含enabled（是否启用）、accountId（账号ID）、lastFetchTime（最后抓取时间）

### 后端新增
- 创建Python爬虫服务模块（backend/crawler/crawler.py）
- 实现BaseCrawler抽象基类
- 实现WeiboCrawler爬虫类
- 实现DouyinCrawler爬虫类
- 实现XiaohongshuCrawler爬虫类
- 实现BilibiliCrawler爬虫类
- 创建CrawlerFactory工厂类
- 创建CompetitorCrawler竞品爬虫类
- 创建Flask爬虫服务（backend/crawler/server.py）
- 创建爬虫服务依赖文件（backend/crawler/requirements.txt）
- 新增crawler路由（backend/routes/crawler.js）
- 实现单个竞品抓取接口 POST /api/crawler/fetch/:competitorId
- 实现批量竞品抓取接口 POST /api/crawler/fetch-all
- 实现爬虫服务状态检查接口 GET /api/crawler/status
- 后端package.json新增axios依赖

### 前端变更
- CompetitorPage新增批量操作区域，支持一键抓取所有竞品
- 竞品列表新增"自动抓取"状态列
- 竞品列表新增"抓取"操作按钮
- 添加/编辑竞品弹窗新增"启用自动抓取"选项
- 添加/编辑竞品弹窗新增社交媒体账号配置区域
- 社交媒体账号配置支持微博、抖音、小红书、B站四个平台
- 每个平台支持单独启用/禁用和配置账号ID
- 新增fetchCompetitor方法，实现单个竞品抓取
- 新增fetchAllCompetitors方法，实现批量竞品抓取
- 新增fetching状态，控制抓取操作按钮状态
- 新增badge样式，显示自动抓取状态
- 新增social-accounts-section样式，美化社交媒体配置区域

### 部署说明
- 需要启动Python爬虫服务：cd backend/crawler && pip install -r requirements.txt && python server.py
- 爬虫服务默认运行在端口5001
- 后端服务需要访问爬虫服务（http://127.0.0.1:5001）
- 前端需要访问后端爬虫接口（http://localhost:5000/api/crawler/*）

### 技术实现
- 爬虫服务使用Flask框架
- 爬虫服务使用requests库进行HTTP请求
- 爬虫服务支持跨域请求（CORS）
- 后端使用axios调用爬虫服务
- 前端使用axios调用后端爬虫接口
- 爬虫数据自动去重，避免重复保存动态

### 注意事项
- 爬虫功能需要配置竞品的社交媒体账号ID
- 爬虫服务需要单独启动
- 爬虫功能依赖网络环境，可能需要配置代理
- 爬虫功能可能受目标平台反爬策略影响
- 建议定期更新爬虫逻辑以适应平台变化

---

## [1.0.0] - 2026-03-11

### 新增功能
- 项目初始化，创建基础架构
- 实现用户认证系统（注册、登录、微信登录）
- 实现竞品管理功能（添加、编辑、删除竞品）
- 实现动态管理功能（添加、编辑、删除竞品动态）
- 实现周报生成功能（自动生成周报）
- 实现仪表盘功能（本周概览、高优先级动态展示）
- 实现历史记录功能（查看历史周报）
- 实现设置功能
- 配置MongoDB数据库连接
- 创建完整的API文档
- 创建详细的项目README文档

### 技术实现
- 前端使用Vue 3 + TypeScript + Vite
- 后端使用Express.js + MongoDB
- 状态管理使用Pinia
- 路由使用Vue Router
- 认证使用JWT
- 数据库使用Mongoose

### 配置文件
- 创建backend/.env环境变量配置文件
- 配置MongoDB连接字符串
- 配置服务器端口和JWT密钥

### 数据模型
- User模型：用户信息
- Competitor模型：竞品信息
- Dynamic模型：竞品动态
- Report模型：周报信息

### API接口
- 认证接口：/api/auth/*
- 竞品接口：/api/competitors/*
- 动态接口：/api/dynamics/*
- 周报接口：/api/reports/*

### 前端页面
- LoginPage：登录页面
- DashboardPage：仪表盘
- CompetitorPage：竞品管理
- DynamicPage：动态管理
- ReportPage：周报生成
- HistoryPage：历史记录
- SettingPage：设置

### 部署
- 配置开发环境
- 测试MongoDB连接
- 启动后端服务器（端口5000）
- 测试API健康检查端点

---

## 版本说明

版本号格式：主版本号.次版本号.修订号

- **主版本号**：重大架构变更或不兼容的API修改
- **次版本号**：新功能添加，向后兼容
- **修订号**：bug修复和小改进

## 更新类型标签

- **新增**：新功能
- **改进**：现有功能的改进
- **修复**：bug修复
- **移除**：功能移除
- **安全**：安全相关的修复
- **文档**：文档更新

## 变更记录

每次更新都会在此文档中记录详细的变更内容，包括：
- 新增的功能
- 改进的功能
- 修复的bug
- 技术架构的调整
- 配置文件的变更
- API接口的变更
- 数据模型的变更
- 部署相关的变更

---

*最后更新时间：2026-03-11*
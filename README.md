# 竞品更新轻量聚合周报系统

一个用于跟踪、分析竞品动态并自动生成周报的系统，帮助企业及时了解市场竞争情况。

## 项目简介

本系统提供了一个完整的竞品分析解决方案，包括竞品管理、动态录入、数据分析和周报生成等功能。通过系统化的数据收集和智能分析，帮助企业及时掌握竞品动态，发现市场机会和潜在风险。

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios

### 后端
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JSON Web Token (JWT)
- **其他**: CORS, Dotenv

## 功能特性

### 1. 用户认证
- 用户注册和登录
- 微信登录支持
- JWT令牌认证
- 路由守卫保护

### 2. 竞品管理
- 添加、编辑、删除竞品
- 设置竞品优先级（高、中、低）
- 管理竞品的业务和渠道信息

### 3. 动态管理
- 添加、编辑、删除竞品动态
- 记录动态标题、渠道、发布时间、内容
- 按竞品和时间范围筛选动态

### 4. 周报生成
- 自动生成周报
- 周报内容包括：摘要、竞品动态、风险分析、建议
- 管理历史周报

### 5. 仪表盘
- 本周概览（新增功能、重大改动、关键机会/风险）
- 高优先级竞品动态展示
- 一键生成周报入口

## 项目结构

```
竞品更新轻量聚合周报/
├── backend/                    # 后端目录
│   ├── models/                # 数据模型
│   │   ├── User.js           # 用户模型
│   │   ├── Competitor.js     # 竞品模型
│   │   ├── Dynamic.js        # 动态模型
│   │   └── Report.js         # 周报模型
│   ├── routes/               # API路由
│   │   ├── auth.js           # 认证路由
│   │   ├── competitor.js     # 竞品路由
│   │   ├── dynamic.js        # 动态路由
│   │   └── report.js         # 周报路由
│   ├── index.js              # 后端入口文件
│   ├── package.json          # 后端依赖配置
│   └── .env                  # 环境变量配置
├── src/                       # 前端源码目录
│   ├── views/                # 页面组件
│   │   ├── LoginPage.vue     # 登录页面
│   │   ├── DashboardPage.vue # 仪表盘
│   │   ├── CompetitorPage.vue # 竞品管理
│   │   ├── DynamicPage.vue   # 动态管理
│   │   ├── ReportPage.vue    # 周报生成
│   │   ├── HistoryPage.vue   # 历史记录
│   │   └── SettingPage.vue   # 设置
│   ├── router/               # 路由配置
│   │   └── index.ts          # 路由定义
│   ├── stores/               # 状态管理
│   │   └── index.ts          # Pinia状态定义
│   ├── App.vue               # 根组件
│   └── main.ts               # 前端入口文件
├── public/                    # 静态资源
├── dist/                      # 构建输出目录
├── package.json               # 前端依赖配置
├── tsconfig.json             # TypeScript配置
├── vite.config.ts            # Vite配置
└── README.md                 # 项目说明文档
```

## 安装和运行

### 前置要求
- Node.js (推荐 v16 或更高版本)
- MongoDB (推荐 v5 或更高版本)
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd 竞品更新轻量聚合周报
```

### 2. 安装前端依赖
```bash
npm install
```

### 3. 安装后端依赖
```bash
cd backend
npm install
```

### 4. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：
```env
# MongoDB连接配置
MONGO_URI=mongodb://localhost:27017/competitor-report

# 服务器端口
PORT=5000

# JWT密钥
JWT_SECRET=your-secret-key-here
```

### 5. 启动MongoDB
确保MongoDB服务正在运行：
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongodb
```

### 6. 启动后端服务器
```bash
cd backend
npm start
```

后端服务器将在 `http://localhost:5000` 启动

### 7. 启动前端开发服务器
```bash
# 在项目根目录
npm run dev
```

前端开发服务器将在 `http://localhost:5173` 启动

## 使用指南

### 1. 用户注册和登录
- 访问 `http://localhost:5173`
- 点击注册按钮创建新账户
- 使用用户名和密码登录

### 2. 添加竞品
- 进入竞品管理页面
- 点击"添加竞品"按钮
- 填写竞品信息（名称、业务、渠道、优先级）
- 保存竞品信息

### 3. 录入动态
- 进入动态管理页面
- 点击"添加动态"按钮
- 选择竞品、填写动态信息
- 保存动态信息

### 4. 生成周报
- 进入仪表盘查看本周概览
- 点击"一键生成周报"按钮
- 查看生成的周报内容
- 保存或导出周报

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/wechat` - 微信登录

### 竞品接口
- `GET /api/competitors` - 获取竞品列表
- `POST /api/competitors` - 添加竞品
- `PUT /api/competitors/:id` - 更新竞品
- `DELETE /api/competitors/:id` - 删除竞品

### 动态接口
- `GET /api/dynamics` - 获取动态列表
- `POST /api/dynamics` - 添加动态
- `PUT /api/dynamics/:id` - 更新动态
- `DELETE /api/dynamics/:id` - 删除动态

### 周报接口
- `GET /api/reports` - 获取周报列表
- `POST /api/reports` - 生成周报
- `PUT /api/reports/:id` - 更新周报
- `DELETE /api/reports/:id` - 删除周报

## 数据模型

### User（用户）
```javascript
{
  username: String,    // 用户名
  password: String,    // 密码
  createdAt: Date      // 创建时间
}
```

### Competitor（竞品）
```javascript
{
  name: String,        // 竞品名称
  business: String,    // 业务领域
  channels: String,    // 渠道
  priority: String,    // 优先级（高、中、低）
  createdAt: Date      // 创建时间
}
```

### Dynamic（动态）
```javascript
{
  competitorId: ObjectId, // 关联的竞品ID
  title: String,          // 动态标题
  channel: String,        // 渠道
  publishTime: Date,      // 发布时间
  content: String,        // 内容
  createdAt: Date         // 创建时间
}
```

### Report（周报）
```javascript
{
  title: String,           // 周报标题
  createTime: Date,        // 创建时间
  content: {
    summary: String,       // 摘要
    competitorDynamic: String, // 竞品动态
    riskAnalysis: String,  // 风险分析
    suggestion: String     // 建议
  },
  createdAt: Date          // 创建时间
}
```

## 开发说明

### 前端开发
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 使用 TypeScript 进行类型检查
- 使用 Pinia 进行状态管理
- 使用 Vue Router 进行路由管理

### 后端开发
- 使用 Express.js 框架
- 使用 Mongoose 进行数据库操作
- 使用 JWT 进行身份认证
- 使用 CORS 处理跨域请求

### 代码规范
- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 类型定义
- 编写清晰的注释
- 保持代码简洁和可维护性

## 部署说明

### 前端部署
```bash
npm run build
```
构建完成后，将 `dist` 目录部署到静态文件服务器。

### 后端部署
```bash
cd backend
npm start
```
确保在生产环境中配置正确的环境变量和数据库连接。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

ISC License

## 联系方式

如有问题或建议，请联系项目维护者。

## 更新日志

详细的更新日志请查看 [CHANGELOG.md](./CHANGELOG.md)
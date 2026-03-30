# 数据库连接和项目运行指南

## 一、启动 MongoDB 数据库

### 方式一：使用命令行启动（推荐）

```bash
# 启动 MongoDB 服务
mongod --dbpath "D:\mongoDB\mongodb-windows-x86_64-8.0.4\mongodb-win32-x86_64-windows-8.0.4\data\db"
```

**说明：**
- 此命令会启动 MongoDB 数据库服务
- 数据库将运行在默认端口 27017
- 数据库路径为：`D:\mongoDB\mongodb-windows-x86_64-8.0.4\mongodb-win32-x86_64-windows-8.0.4\data\db`
- 保持此终端窗口打开，数据库将持续运行

### 方式二：使用 Windows 服务启动

```bash
# 如果 MongoDB 已安装为 Windows 服务
net start MongoDB
```

### 验证数据库连接

```bash
# 在新的终端窗口中连接到 MongoDB
mongosh mongodb://localhost:27017/competitor-report
```

**说明：**
- 连接到名为 `competitor-report` 的数据库
- 如果连接成功，说明 MongoDB 正常运行

---

## 二、安装项目依赖

### 1. 安装前端依赖

```bash
# 在项目根目录下
cd "d:\TraeProject\竞品更新轻量聚合周报"
npm install
```

### 2. 安装后端依赖

```bash
# 进入后端目录
cd backend
npm install
```

---

## 三、环境变量配置

环境变量文件已存在于 `backend/.env`，配置如下：

```env
# MongoDB连接配置
MONGO_URI=mongodb://localhost:27017/competitor-report

# 服务器端口
PORT=5000

# JWT密钥
JWT_SECRET=your-secret-key-here

# Google Gemini API配置
GOOGLE_API_KEY=AIzaSyBEFCjPt7hC7wJ8GxZ-yTDjYySB46bar_0
GOOGLE_API_BASE=https://generativelanguage.googleapis.com/v1beta
```

**说明：**
- 无需修改，配置已就绪
- MongoDB 连接地址：`mongodb://localhost:27017/competitor-report`
- 后端服务端口：`5000`

---

## 四、启动后端服务

### 方式一：普通启动（推荐生产环境）

```bash
# 在 backend 目录下
cd backend
npm start
```

### 方式二：开发模式（支持热重载）

```bash
# 在 backend 目录下
cd backend
npm run dev
```

**启动成功标志：**
```
MongoDB连接成功
服务器运行在端口 5000
```

**说明：**
- 后端服务将运行在 `http://localhost:5000`
- 保持此终端窗口打开，后端将持续运行

---

## 五、启动前端服务

```bash
# 在项目根目录下
cd "d:\TraeProject\竞品更新轻量聚合周报"
npm run dev
```

**启动成功标志：**
```
VITE v7.3.1  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**说明：**
- 前端服务将运行在 `http://localhost:5173`
- 在浏览器中访问 `http://localhost:5173` 即可使用系统

---

## 六、完整启动流程（按顺序执行）

### 终端 1：启动 MongoDB
```bash
mongod --dbpath "D:\mongoDB\mongodb-windows-x86_64-8.0.4\mongodb-win32-x86_64-windows-8.0.4\data\db"
```

### 终端 2：启动后端服务
```bash
cd "d:\TraeProject\竞品更新轻量聚合周报\backend"
npm start
```

### 终端 3：启动前端服务
```bash
cd "d:\TraeProject\竞品更新轻量聚合周报"
npm run dev
```

---

## 七、验证系统运行

### 1. 检查后端健康状态
```bash
# 在浏览器或使用 curl 访问
http://localhost:5000/health
```

**预期响应：**
```json
{
  "status": "ok"
}
```

### 2. 访问前端页面
```bash
# 在浏览器中打开
http://localhost:5173
```

---

## 八、常见问题排查

### 问题 1：MongoDB 连接失败
**错误信息：** `MongoDB连接失败`

**解决方案：**
1. 确认 MongoDB 已启动（终端 1）
2. 检查数据库路径是否正确
3. 确认端口 27017 未被占用

### 问题 2：后端启动失败
**错误信息：** `EADDRINUSE: address already in use :::5000`

**解决方案：**
1. 端口 5000 被占用，关闭占用进程或修改 `backend/.env` 中的 `PORT`
2. 使用 `netstat -ano | findstr :5000` 查找占用进程

### 问题 3：前端无法连接后端
**错误信息：** `Network Error`

**解决方案：**
1. 确认后端服务已启动（终端 2）
2. 检查后端是否显示 "MongoDB连接成功"
3. 确认前端 API 配置正确（默认连接 `http://localhost:5000`）

### 问题 4：依赖安装失败
**错误信息：** `npm ERR!`

**解决方案：**
1. 清除 npm 缓存：`npm cache clean --force`
2. 删除 `node_modules` 文件夹
3. 重新安装：`npm install`

---

## 九、停止服务

### 停止 MongoDB
- 在终端 1 中按 `Ctrl + C`

### 停止后端服务
- 在终端 2 中按 `Ctrl + C`

### 停止前端服务
- 在终端 3 中按 `Ctrl + C`

---

## 十、项目访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:5173 | 用户界面 |
| 后端 API | http://localhost:5000 | API 服务 |
| 健康检查 | http://localhost:5000/health | 服务状态 |
| MongoDB | mongodb://localhost:27017 | 数据库 |

---

## 十一、快速启动脚本（可选）

创建 `start.bat` 文件（Windows 批处理文件）：

```batch
@echo off
echo 正在启动 MongoDB...
start "MongoDB" mongod --dbpath "D:\mongoDB\mongodb-windows-x86_64-8.0.4\mongodb-win32-x86_64-windows-8.0.4\data\db"

timeout /t 3 /nobreak > nul

echo 正在启动后端服务...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo 正在启动前端服务...
start "Frontend" cmd /k "npm run dev"

echo 所有服务已启动！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:5000
pause
```

**使用方法：**
1. 将上述内容保存为 `start.bat`
2. 双击运行即可自动启动所有服务

---

## 注意事项

1. **首次运行**：确保已安装 Node.js (v16+) 和 MongoDB (v5+)
2. **端口占用**：确保端口 27017、5000、5173 未被占用
3. **终端管理**：建议使用 3 个独立的终端窗口分别运行 MongoDB、后端和前端
4. **数据持久化**：MongoDB 数据存储在指定路径，重启后数据不会丢失
5. **开发模式**：开发时建议使用 `npm run dev` 启动后端，支持热重载

---

## 技术支持

如遇到问题，请检查：
1. MongoDB 是否正常运行
2. 后端是否显示 "MongoDB连接成功"
3. 前端是否能访问 `http://localhost:5173`
4. 浏览器控制台是否有错误信息

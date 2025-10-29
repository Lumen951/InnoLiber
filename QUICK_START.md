# InnoLiber 开发环境启动指南

## 🚀 快速启动

### 前置要求
- Python 3.11+
- Node.js 18+
- Docker Desktop

### 一键启动
```bash
# Windows用户
start-dev.bat

# 或者手动启动
docker-compose up -d
```

## 📋 启动步骤

### 1. 启动数据库服务
```bash
docker-compose up -d
```

### 2. 启动后端服务
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 启动前端服务
```bash
cd frontend
npm run dev
```

## 🔗 访问地址

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050
  - 用户名: admin@innolibr.com
  - 密码: admin

## 🗄️ 数据库连接信息

- **主机**: localhost
- **端口**: 5432
- **数据库**: innolibr
- **用户名**: innolibr
- **密码**: innolibr_dev_password

## 📝 开发状态

当前阶段：阶段0 - 基础设施搭建 ✅

### 已完成
- [x] 项目结构搭建
- [x] Docker环境配置
- [x] 后端FastAPI框架
- [x] 前端React+Ant Design
- [x] 首页实现（包含标书列表、统计信息）

### 下一步
- [ ] 后端API实现
- [ ] 用户认证系统
- [ ] 标书编辑页面
- [ ] AI助手集成

---

**最后更新**: 2025-10-28
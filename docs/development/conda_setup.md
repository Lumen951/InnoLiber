# Conda 开发环境配置指南

本文档提供基于Conda的InnoLiber开发环境完整配置指南，支持Windows、Linux和macOS。

## 环境要求

### 必需软件
- **Anaconda/Miniconda**: 用于Python环境管理
- **Node.js 18+**: 前端开发环境
- **Docker Desktop**: 数据库服务容器化
- **Git**: 版本控制

### 可选但推荐
- **NVIDIA GPU**: RTX 20系列及以上，带CUDA支持
- **CUDA Toolkit 12.6+**: GPU加速计算
- **8GB+ RAM**: 推荐16GB以上

## 系统环境信息

根据当前检测，您的系统配置为：
- Python: 3.13.5
- CUDA Driver: 560.78
- CUDA Runtime: 12.6
- GPU: NVIDIA GeForce RTX 4060 Laptop (8GB)

PyTorch将自动适配CUDA 12.6环境。

---

## Windows 快速启动

### 1. 一键启动（推荐）

直接运行项目根目录下的启动脚本：

```cmd
start-dev.bat
```

该脚本会自动：
- 检查并创建Conda环境
- 检查Node.js和GPU环境
- 启动Docker数据库服务
- 显示后续启动命令

### 2. 手动配置步骤

如果需要手动配置或遇到问题，按以下步骤操作：

#### 步骤1: 创建Conda环境

```cmd
conda env create -f environment.yml
```

#### 步骤2: 激活环境

```cmd
conda activate innoliber-dev
```

#### 步骤3: 验证PyTorch CUDA支持

```cmd
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA可用: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"N/A\"}')"
```

应该看到类似输出：
```
PyTorch: 2.5.1+cu126
CUDA可用: True
GPU: NVIDIA GeForce RTX 4060 Laptop GPU
```

#### 步骤4: 启动数据库服务

```cmd
docker-compose -f docker-compose.local-dev.yml up -d
```

#### 步骤5: 启动后端服务

```cmd
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 步骤6: 启动前端服务（新终端）

```cmd
cd frontend
npm install
npm run dev
```

---

## Linux/macOS 配置

### 1. 创建Conda环境

```bash
conda env create -f environment.yml
```

### 2. 激活环境

```bash
conda activate innoliber-dev
```

### 3. 验证环境

```bash
# 检查Python版本
python --version

# 检查PyTorch和CUDA
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"

# 检查GPU（如果有NVIDIA GPU）
nvidia-smi
```

### 4. 启动数据库服务

```bash
docker-compose -f docker-compose.local-dev.yml up -d
```

### 5. 启动后端服务

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. 启动前端服务（新终端）

```bash
cd frontend
npm install
npm run dev
```

---

## 服务访问地址

配置完成后，可以访问以下服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:5173 | Vite开发服务器 |
| 后端API | http://localhost:8000 | FastAPI应用 |
| API文档 | http://localhost:8000/docs | Swagger UI |
| PostgreSQL | localhost:5432 | 数据库连接 |
| Redis | localhost:6379 | 缓存服务 |
| pgAdmin | http://localhost:5050 | 数据库管理工具 |

### pgAdmin登录信息
- Email: `admin@innoliber.com`
- Password: `admin`

---

## 常用Conda命令

### 环境管理

```bash
# 查看所有环境
conda env list

# 激活环境
conda activate innoliber-dev

# 退出环境
conda deactivate

# 删除环境
conda env remove -n innoliber-dev

# 更新环境（根据environment.yml）
conda env update -f environment.yml --prune
```

### 包管理

```bash
# 列出已安装的包
conda list

# 在当前环境安装新包
conda install package_name

# 使用pip安装（在Conda环境内）
pip install package_name

# 更新包
conda update package_name
```

---

## Docker服务管理

### 基本操作

```bash
# 启动所有服务
docker-compose -f docker-compose.local-dev.yml up -d

# 停止所有服务
docker-compose -f docker-compose.local-dev.yml down

# 查看服务状态
docker-compose -f docker-compose.local-dev.yml ps

# 查看服务日志
docker-compose -f docker-compose.local-dev.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.local-dev.yml logs -f postgres
```

### 数据清理

```bash
# 停止服务并删除数据卷（危险操作！）
docker-compose -f docker-compose.local-dev.yml down -v

# 清理未使用的Docker资源
docker system prune -a
```

---

## 故障排除

### 问题1: Conda环境创建失败

**症状**: `conda env create` 报错

**解决方案**:
```bash
# 更新conda
conda update -n base conda

# 清理缓存
conda clean --all

# 重新创建环境
conda env create -f environment.yml
```

### 问题2: PyTorch无法使用GPU

**症状**: `torch.cuda.is_available()` 返回 `False`

**解决方案**:
1. 检查NVIDIA驱动是否正确安装：
   ```bash
   nvidia-smi
   ```

2. 验证CUDA版本匹配：
   ```bash
   nvcc --version
   ```

3. 重新安装PyTorch（指定CUDA版本）：
   ```bash
   conda activate innoliber-dev
   pip uninstall torch torchvision torchaudio
   pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu126
   ```

### 问题3: Docker服务启动失败

**症状**: `docker-compose up` 失败

**解决方案**:
1. 确保Docker Desktop正在运行
2. 检查端口是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr "5432"
   netstat -ano | findstr "6379"

   # Linux/macOS
   lsof -i :5432
   lsof -i :6379
   ```

3. 查看详细错误日志：
   ```bash
   docker-compose -f docker-compose.local-dev.yml logs
   ```

### 问题4: Poetry安装依赖失败

**症状**: `poetry install` 报错

**解决方案**:
```bash
# 清理Poetry缓存
poetry cache clear pypi --all

# 更新Poetry
pip install --upgrade poetry

# 使用详细模式重新安装
poetry install -vvv
```

### 问题5: 前端npm安装慢

**症状**: `npm install` 非常慢或失败

**解决方案**:
```bash
# 使用国内镜像（淘宝镜像）
npm config set registry https://registry.npmmirror.com

# 或使用pnpm替代npm
npm install -g pnpm
pnpm install
```

---

## 性能优化建议

### 1. Conda性能优化

在 `~/.condarc` 或 `C:\Users\<用户名>\.condarc` 添加：

```yaml
channels:
  - pytorch
  - nvidia
  - conda-forge
  - defaults

channel_priority: flexible
show_channel_urls: true

# 使用libmamba求解器（更快）
solver: libmamba
```

安装libmamba：
```bash
conda install -n base conda-libmamba-solver
```

### 2. GPU内存优化

如果遇到GPU内存不足，可以在代码中添加：

```python
import torch

# 启用内存优化
torch.cuda.empty_cache()

# 使用混合精度训练
from torch.cuda.amp import autocast, GradScaler
```

### 3. 开发环境建议

- 使用SSD存储项目文件
- 推荐16GB+内存
- 使用VSCode + Python扩展进行开发
- 启用Windows Terminal获得更好的终端体验

---

## 环境变量配置

创建 `.env` 文件（从 `.env.template` 复制）：

```bash
# Windows
copy .env.template .env

# Linux/macOS
cp .env.template .env
```

关键环境变量：

```env
# 数据库配置
DATABASE_URL=postgresql+asyncpg://innoliber:innoliber_dev_password@localhost:5432/innoliber

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# DeepSeek API（需要申请）
DEEPSEEK_API_KEY=your_api_key_here

# JWT密钥（生产环境必须修改）
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
```

---

## 开发工作流

### 日常开发流程

1. **启动开发环境**
   ```bash
   # Windows: 运行 start-dev.bat
   # Linux/macOS: 手动启动服务
   ```

2. **激活Conda环境**
   ```bash
   conda activate innoliber-dev
   ```

3. **启动后端**（终端1）
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

4. **启动前端**（终端2）
   ```bash
   cd frontend
   npm run dev
   ```

5. **代码修改后自动重载**
   - 后端：FastAPI的`--reload`参数会自动重载
   - 前端：Vite HMR会自动更新

### 代码质量检查

```bash
# 进入后端目录
cd backend

# 代码格式化
poetry run black .
poetry run isort .

# 代码检查
poetry run flake8 .
poetry run mypy .

# 运行测试
poetry run pytest
poetry run pytest --cov=app
```

---

## 其他参考文档

- [项目技术架构](../technical/01_architecture.md)
- [数据库设计](../technical/02_database_design.md)
- [API规范](../technical/03_api_specification.md)
- [开发计划](../technical/00_development_plan.md)

---

## 获取帮助

如果遇到问题：

1. 查看本文档的故障排除章节
2. 检查项目Issues: https://github.com/your-repo/InnoLiber/issues
3. 查看相关文档和日志

**祝开发愉快！** 🚀

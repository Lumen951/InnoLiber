# Docker Deployment Guide for InnoLiber

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Environment Configuration](#environment-configuration)
4. [Development Deployment](#development-deployment)
5. [Production Deployment](#production-deployment)
6. [Common Operations](#common-operations)
7. [Troubleshooting](#troubleshooting)
8. [Performance Tuning](#performance-tuning)

---

## Quick Start

### Prerequisites
- Docker Engine 20.10+ & Docker Compose 2.0+
- At least 8GB RAM (16GB+ recommended for production)
- 20GB+ free disk space

### Minimum Viable Deployment (3 steps)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env and set DEEPSEEK_API_KEY
nano .env  # or any text editor

# 3. Start all services
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@innoliber.com / admin)

---

## Architecture Overview

### Services

| Service | Image | Purpose | Port |
|---------|-------|---------|------|
| **postgres** | pgvector/pgvector:pg16 | Database + vector storage | 5432 |
| **redis** | redis:7-alpine | Cache & message broker | 6379 |
| **backend** | Custom (Python 3.11) | FastAPI + PyTorch API | 8000 |
| **celery-worker** | Custom (Python 3.11) | Background task processor | - |
| **frontend** | Custom (Node 20 + Nginx) | React SPA | 3000 |
| **pgadmin** | dpage/pgadmin4 | Database management UI | 5050 |

### Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (bridge)                  │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Frontend │───▶│ Backend  │───▶│PostgreSQL│             │
│  │  (Nginx) │    │ (FastAPI)│    │+pgvector │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │                 │                                    │
│       │                 └────────▶┌──────────┐             │
│       │                           │  Redis   │             │
│       │                           └──────────┘             │
│       │                                 ▲                   │
│       │                                 │                   │
│       │                           ┌──────────┐             │
│       └──────────────────────────▶│  Celery  │             │
│                                   │  Worker  │             │
│                                   └──────────┘             │
└─────────────────────────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
   Host:3000                                 Host:8000
```

### Docker Images

**Backend Image** (multi-stage):
- **Stage 1 (Builder)**: python:3.11-slim + Poetry → Install dependencies
- **Stage 2 (Runtime)**: python:3.11-slim + Virtual env → Run application
- **Size**: ~2GB (includes PyTorch)
- **User**: Non-root (appuser, UID 1000)

**Frontend Image** (multi-stage):
- **Stage 1 (Builder)**: node:20-alpine → npm ci + vite build
- **Stage 2 (Runtime)**: nginx:1.25-alpine → Serve static files
- **Size**: ~50MB
- **User**: nginx (non-root)

---

## Environment Configuration

### Required Variables

```bash
# Minimum required for development
DEEPSEEK_API_KEY=your_api_key_here
JWT_SECRET_KEY=change_this_in_production

# Database
POSTGRES_PASSWORD=secure_password

# Production
ENVIRONMENT=production
REDIS_PASSWORD=secure_redis_password
```

### Full Configuration

See `.env.example` for all available options:

```bash
cp .env.example .env
```

**Security Best Practices**:
1. ✅ Generate secure JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. ✅ Use strong database passwords (16+ characters)
3. ✅ Enable Redis password in production
4. ✅ Set proper CORS origins
5. ✅ Never commit `.env` to version control

---

## Development Deployment

### Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Check service status
docker-compose ps
```

### Hot Reload for Development

The development configuration mounts source code as volumes:

```yaml
volumes:
  - ./backend/app:/app/app:ro  # Backend hot reload
```

**To rebuild after dependency changes**:

```bash
# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build backend
```

### Access Development Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API Docs | http://localhost:8000/docs | - |
| pgAdmin | http://localhost:5050 | admin@innoliber.com / admin |
| Redis Commander | (Add if needed) | - |

---

## Production Deployment

### Build Production Images

```bash
# Build all images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Tag images for registry (optional)
docker tag innoliber_backend:latest your-registry/innoliber-backend:1.0.0
docker tag innoliber_frontend:latest your-registry/innoliber-frontend:1.0.0
```

### Deploy to Production

```bash
# Start with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3 --scale celery-worker=2
```

### Production Configuration Highlights

**Backend**:
- 4 Uvicorn workers per container
- Resource limits: 2 CPU, 4GB RAM
- No source code mounts
- Access logs disabled for performance

**Redis**:
- Password protection enabled
- Max memory: 1GB with LRU eviction
- AOF persistence enabled

**Celery Worker**:
- Concurrency: 4 workers
- Max tasks per child: 1000 (prevents memory leaks)
- Log level: WARNING

**Frontend**:
- Static files served by Nginx
- Gzip compression enabled
- Cache headers optimized

### Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/health
curl http://localhost:3000/health
```

---

## Common Operations

### Database Management

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Access PostgreSQL CLI
docker-compose exec postgres psql -U innoliber -d innoliber

# Backup database
docker-compose exec postgres pg_dump -U innoliber innoliber > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U innoliber -d innoliber
```

### Redis Operations

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Check Redis info
docker-compose exec redis redis-cli info

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Celery Management

```bash
# View Celery worker status
docker-compose exec celery-worker celery -A app.celery inspect active

# Purge all tasks
docker-compose exec celery-worker celery -A app.celery purge

# View registered tasks
docker-compose exec celery-worker celery -A app.celery inspect registered
```

### Logs and Debugging

```bash
# View logs (last 100 lines)
docker-compose logs --tail=100 backend

# Follow logs in real-time
docker-compose logs -f backend celery-worker

# Export logs to file
docker-compose logs > logs.txt

# Enter container shell
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh  # Alpine uses sh
```

### Update and Restart

```bash
# Pull latest code
git pull

# Rebuild and restart changed services
docker-compose up -d --build

# Restart specific service
docker-compose restart backend

# Recreate containers (preserves volumes)
docker-compose up -d --force-recreate
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**:
```bash
# Change port in .env
BACKEND_PORT=8001

# Or stop conflicting service
lsof -ti:8000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8000  # Windows
```

#### 2. Database Connection Failed

**Error**: `FATAL: password authentication failed`

**Solution**:
```bash
# 1. Check PostgreSQL is running
docker-compose ps postgres

# 2. Verify connection string in .env
DATABASE_URL=postgresql+asyncpg://innoliber:password@postgres:5432/innoliber

# 3. Restart database
docker-compose restart postgres
```

#### 3. Out of Memory

**Error**: `Cannot allocate memory`

**Solution**:
```bash
# 1. Check Docker memory limits
docker stats

# 2. Increase Docker Desktop memory (Settings → Resources)
# 3. Reduce workers in production config
```

#### 4. PyTorch Not Found

**Error**: `ModuleNotFoundError: No module named 'torch'`

**Solution**:
```bash
# Rebuild backend image
docker-compose build --no-cache backend
```

#### 5. Frontend 404 on Refresh

**Issue**: SPA routes return 404 on page refresh

**Solution**: Ensure `nginx.conf` has `try_files` directive:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Debug Mode

```bash
# Enable debug logging
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# Restart with debug
docker-compose up -d backend

# View detailed logs
docker-compose logs -f backend | grep DEBUG
```

---

## Performance Tuning

### Backend Optimization

```yaml
# docker-compose.prod.yml
backend:
  command: >
    uvicorn app.main:app
    --host 0.0.0.0
    --port 8000
    --workers 4              # Adjust based on CPU cores
    --worker-class uvicorn.workers.UvicornWorker
    --limit-concurrency 1000
    --backlog 2048
```

### Redis Tuning

```yaml
redis:
  command: >
    redis-server
    --maxmemory 2gb            # Increase for large cache
    --maxmemory-policy allkeys-lru
    --save 900 1               # Persistence settings
    --save 300 10
    --save 60 10000
```

### PostgreSQL Tuning

```sql
-- Access PostgreSQL and run
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
```

### Monitoring

```bash
# Install monitoring stack (optional)
# Add Prometheus, Grafana, and exporters

# View container stats
docker stats --no-stream

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

---

## Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Technical Docs**: `docs/technical/`
- **Architecture Diagram**: `docs/design/`
- **Development Plan**: `docs/technical/00_development_plan.md`

---

**Created**: 2025-11-14
**Version**: 1.0
**Author**: Claude Code

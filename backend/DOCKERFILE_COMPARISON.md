# =============================================================================
# Comparison: Poetry vs Conda Dockerfiles
# =============================================================================

## Two Dockerfile Options for InnoLiber Backend

We provide **two Dockerfile implementations**:

### Option 1: Poetry-based (Dockerfile)
**File**: `backend/Dockerfile`
**Pros**:
- ✅ Smaller image size (~1.8GB)
- ✅ Faster build time (better caching)
- ✅ Deterministic builds (poetry.lock)
- ✅ Industry standard for Python deployment

**Cons**:
- ⚠️ Different from development environment (conda)
- ⚠️ May have version conflicts if not tested

**Use When**:
- Deploying to production
- Want smaller images
- Using CI/CD pipelines

---

### Option 2: Conda-based (Dockerfile.conda)
**File**: `backend/Dockerfile.conda`
**Pros**:
- ✅ **Matches development environment exactly** (environment.yml)
- ✅ Same dependencies as local conda environment
- ✅ Better for scientific packages (PyTorch, NumPy)
- ✅ Guaranteed compatibility

**Cons**:
- ⚠️ Larger image size (~2.5GB)
- ⚠️ Slower build time
- ⚠️ Conda in Docker is less common

**Use When**:
- **Want exact parity with development**
- Testing before production
- Having dependency issues with Poetry

---

## Quick Comparison

| Aspect | Poetry (Dockerfile) | Conda (Dockerfile.conda) |
|--------|-------------------|------------------------|
| **Image Size** | ~1.8GB | ~2.5GB |
| **Build Time** | 5-8 min | 8-12 min |
| **Dev Parity** | ⚠️ Different | ✅ Exact Match |
| **Production Ready** | ✅ Yes | ⚠️ Less common |
| **PyTorch Version** | 2.7.1 (Poetry) | 2.5.1 (environment.yml) |

---

## How to Use Each Version

### Using Poetry Dockerfile (Default)
```bash
# Build
docker-compose build backend

# Or directly
cd backend
docker build -t innoliber-backend .
```

### Using Conda Dockerfile
```bash
# Update docker-compose.yml:
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.conda  # Change this line

# Build
docker-compose build backend
```

---

## Recommendation

### For Your Case (Development + Testing):
**Use Dockerfile.conda** - Because you're using conda locally, this ensures:
- ✅ Exact same Python 3.11.14
- ✅ Exact same PyTorch 2.5.1 (CUDA 12.6)
- ✅ Same numpy, pandas versions
- ✅ No surprises when moving from dev to Docker

### For Production Deployment:
**Use Dockerfile (Poetry)** - After testing with conda, use Poetry for:
- ✅ Smaller images
- ✅ Faster deployments
- ✅ Better CI/CD integration

---

## Testing Strategy

1. **Development**: Use local conda environment
2. **Docker Testing**: Use `Dockerfile.conda` to verify in container
3. **Production**: Switch to `Dockerfile` (Poetry) for optimized deployment

---

## Fixing the Default Configuration

To use Conda Dockerfile by default, update `docker-compose.yml`:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.conda  # Use conda version
  # ... rest of config
```

Or keep both and test:
```bash
# Test with conda
docker build -f backend/Dockerfile.conda -t innoliber-backend:conda backend/

# Test with poetry
docker build -f backend/Dockerfile -t innoliber-backend:poetry backend/
```

---

**Recommendation**: Start with `Dockerfile.conda` for development, then switch to `Dockerfile` for production after verification.

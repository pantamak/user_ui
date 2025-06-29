# Pantamak Marketplace UI - Docker Setup

This document provides instructions for running the Pantamak Marketplace UI using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Production Build

1. **Build and run the production container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

### Development Build

1. **Run the development container:**
   ```bash
   docker-compose --profile dev up --build pantamak-ui-dev
   ```

2. **Access the development server:**
   Open your browser and navigate to `http://localhost:3001`

## Docker Commands

### Building the Image

```bash
# Build production image
docker build -t pantamak-ui .

# Build development image
docker build -f Dockerfile.dev -t pantamak-ui-dev .
```

### Running Containers

```bash
# Run production container
docker run -p 3000:3000 pantamak-ui

# Run development container with volume mounting
docker run -p 3001:3000 -v $(pwd):/app -v /app/node_modules pantamak-ui-dev
```

### Using Docker Compose

```bash
# Start production services
docker-compose up

# Start development services
docker-compose --profile dev up

# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Docker Image Details

### Production Image (Dockerfile)

- **Base Image:** `node:18-alpine`
- **Multi-stage build** for optimized size
- **Security:** Runs as non-root user
- **Health Check:** Built-in health monitoring
- **Size:** ~150MB (approximate)

### Development Image (Dockerfile.dev)

- **Base Image:** `node:18-alpine`
- **Hot Reload:** Supports file watching
- **Volume Mounting:** Source code is mounted for development
- **Size:** ~400MB (approximate)

## Environment Variables

The following environment variables can be configured:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `3000` | Port the application runs on |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |

## Health Check

The production container includes a health check that:
- Runs every 30 seconds
- Checks the `/api/health` endpoint
- Times out after 10 seconds
- Retries 3 times before marking as unhealthy

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000

   # Use a different port
   docker run -p 3001:3000 pantamak-ui
   ```

2. **Build fails due to memory:**
   ```bash
   # Increase Docker memory limit or use
   docker build --memory=4g -t pantamak-ui .
   ```

3. **Permission issues (Linux):**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Debugging

```bash
# Access container shell
docker exec -it <container_name> sh

# View container logs
docker logs <container_name>

# Inspect container
docker inspect <container_name>
```

## Performance Optimization

### Production Optimizations

- Multi-stage build reduces image size
- Alpine Linux base for minimal footprint
- Standalone Next.js output for faster startup
- Non-root user for security
- Health checks for monitoring

### Development Optimizations

- Volume mounting for hot reload
- Shared node_modules to speed up container start
- Development-specific environment variables

## Security Considerations

- Containers run as non-root user (`nextjs:nodejs`)
- Sensitive files excluded via `.dockerignore`
- Health checks monitor application status
- Image uses minimal Alpine Linux base
- No sensitive data in environment variables

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t pantamak-ui .

      - name: Run tests
        run: docker run --rm pantamak-ui npm test
```

### Docker Registry

```bash
# Tag for registry
docker tag pantamak-ui your-registry.com/pantamak-ui:latest

# Push to registry
docker push your-registry.com/pantamak-ui:latest
```

## Monitoring

The application exposes metrics at:
- Health: `GET /api/health`
- Status: Check container health with `docker ps`

## Support

For issues related to Docker setup, please check:
1. Docker and Docker Compose versions
2. Available system resources (RAM, disk space)
3. Network connectivity
4. File permissions

---

**Note:** Make sure you have sufficient disk space (at least 2GB) and RAM (at least 2GB) available for Docker operations.

#!/bin/bash

# Pantamak UI Docker Build Script
# This script helps build and run the Pantamak marketplace UI using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "  - Ubuntu/Debian: apt-get install docker.io"
        echo "  - macOS: Install Docker Desktop"
        echo "  - Windows: Install Docker Desktop"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_warning "Docker Compose is not available. Some features may not work."
        return 1
    fi
    print_success "Docker Compose is available"
    return 0
}

# Build production image
build_production() {
    print_status "Building production Docker image..."
    docker build -t pantamak-ui:latest .
    print_success "Production image built successfully"
}

# Build development image
build_development() {
    print_status "Building development Docker image..."
    docker build -f Dockerfile.dev -t pantamak-ui:dev .
    print_success "Development image built successfully"
}

# Run production container
run_production() {
    print_status "Starting production container..."
    docker run -d \
        --name pantamak-ui-prod \
        -p 3000:3000 \
        --restart unless-stopped \
        pantamak-ui:latest
    print_success "Production container started on http://localhost:3000"
}

# Run development container
run_development() {
    print_status "Starting development container..."
    docker run -d \
        --name pantamak-ui-dev \
        -p 3001:3000 \
        -v "$(pwd):/app" \
        -v /app/node_modules \
        -v /app/.next \
        pantamak-ui:dev
    print_success "Development container started on http://localhost:3001"
}

# Stop and remove containers
cleanup() {
    print_status "Cleaning up containers..."
    docker stop pantamak-ui-prod pantamak-ui-dev 2>/dev/null || true
    docker rm pantamak-ui-prod pantamak-ui-dev 2>/dev/null || true
    print_success "Cleanup completed"
}

# Show usage
usage() {
    echo "Pantamak UI Docker Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build-prod     Build production Docker image"
    echo "  build-dev      Build development Docker image"
    echo "  run-prod       Run production container"
    echo "  run-dev        Run development container"
    echo "  stop           Stop all containers"
    echo "  cleanup        Stop and remove all containers"
    echo "  logs           Show container logs"
    echo "  shell          Open shell in running container"
    echo "  help           Show this help message"
    echo ""
    echo "Docker Compose commands (if available):"
    echo "  compose-up     Start services with docker-compose"
    echo "  compose-dev    Start development services"
    echo "  compose-down   Stop docker-compose services"
    echo ""
}

# Show container logs
show_logs() {
    if docker ps --format "table {{.Names}}" | grep -q "pantamak-ui"; then
        print_status "Showing container logs..."
        docker logs -f $(docker ps --filter "name=pantamak-ui" --format "{{.Names}}" | head -1)
    else
        print_error "No running Pantamak UI containers found"
    fi
}

# Open shell in container
open_shell() {
    if docker ps --format "table {{.Names}}" | grep -q "pantamak-ui"; then
        container=$(docker ps --filter "name=pantamak-ui" --format "{{.Names}}" | head -1)
        print_status "Opening shell in container: $container"
        docker exec -it "$container" sh
    else
        print_error "No running Pantamak UI containers found"
    fi
}

# Docker Compose commands
compose_up() {
    if check_docker_compose; then
        print_status "Starting services with docker-compose..."
        docker-compose up --build -d
        print_success "Services started. Check http://localhost:3000"
    fi
}

compose_dev() {
    if check_docker_compose; then
        print_status "Starting development services..."
        docker-compose --profile dev up --build -d
        print_success "Development services started. Check http://localhost:3001"
    fi
}

compose_down() {
    if check_docker_compose; then
        print_status "Stopping docker-compose services..."
        docker-compose down
        print_success "Services stopped"
    fi
}

# Main script logic
main() {
    case "${1:-help}" in
        "build-prod")
            check_docker
            build_production
            ;;
        "build-dev")
            check_docker
            build_development
            ;;
        "run-prod")
            check_docker
            cleanup
            build_production
            run_production
            ;;
        "run-dev")
            check_docker
            cleanup
            build_development
            run_development
            ;;
        "stop")
            docker stop pantamak-ui-prod pantamak-ui-dev 2>/dev/null || true
            print_success "Containers stopped"
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            show_logs
            ;;
        "shell")
            open_shell
            ;;
        "compose-up")
            check_docker
            compose_up
            ;;
        "compose-dev")
            check_docker
            compose_dev
            ;;
        "compose-down")
            compose_down
            ;;
        "help"|*)
            usage
            ;;
    esac
}

# Run main function
main "$@"

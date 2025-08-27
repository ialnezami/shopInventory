#!/bin/bash

# Production Deployment Script for Shop Inventory Backend
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 Starting deployment for environment: ${ENVIRONMENT}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${YELLOW}📁 Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    echo -e "${YELLOW}📁 Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No environment file found. Using system environment variables.${NC}"
fi

# Validate required environment variables
REQUIRED_VARS=("JWT_SECRET" "JWT_REFRESH_SECRET" "MONGODB_URI")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable ${var} is not set.${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "${YELLOW}⏳ Health check failed (attempt ${RETRY_COUNT}/${MAX_RETRIES}). Retrying in 10 seconds...${NC}"
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Health check failed after ${MAX_RETRIES} attempts.${NC}"
    echo -e "${YELLOW}📋 Checking container logs...${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Show service status
echo -e "${GREEN}📊 Service status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show container logs
echo -e "${GREEN}📋 Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application is available at: https://localhost${NC}"
echo -e "${BLUE}📚 API Documentation: https://localhost/api${NC}"
echo -e "${BLUE}🏥 Health Check: https://localhost/health${NC}"

# Optional: Open browser
if command -v open &> /dev/null; then
    echo -e "${YELLOW}🌐 Opening application in browser...${NC}"
    open https://localhost
fi

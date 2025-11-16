#!/bin/bash

# Docker Build Script with Better Error Handling
# Usage: ./docker-build.sh [service_name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   MedConnect Docker Build Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

SERVICE=$1

if [ -n "$SERVICE" ]; then
    echo -e "${GREEN}Building service: ${SERVICE}${NC}"
    docker compose build --no-cache "$SERVICE"
else
    echo -e "${GREEN}Building all services...${NC}"
    
    # Build backend first (usually faster)
    echo -e "${YELLOW}[1/2] Building Backend...${NC}"
    if docker compose build --no-cache be; then
        echo -e "${GREEN}✅ Backend build completed${NC}"
    else
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    fi
    
    echo ""
    
    # Build frontend (might take longer due to npm/yarn)
    echo -e "${YELLOW}[2/2] Building Frontend...${NC}"
    if docker compose build --no-cache fe; then
        echo -e "${GREEN}✅ Frontend build completed${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
        echo -e "${YELLOW}💡 Tip: Network issues? Try running again:${NC}"
        echo -e "   docker compose build --no-cache fe"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✅ Build completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Start services: ${YELLOW}docker compose up -d${NC}"
echo -e "  2. Check status:   ${YELLOW}docker compose ps${NC}"
echo -e "  3. View logs:      ${YELLOW}docker compose logs -f${NC}"
echo ""

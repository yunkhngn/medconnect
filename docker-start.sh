#!/bin/bash

# MedConnect Docker Start Script
# Khởi động services theo đúng thứ tự

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   MedConnect Docker Startup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Stop any running containers
echo -e "${YELLOW}Dừng containers cũ (nếu có)...${NC}"
docker compose down 2>/dev/null || true
echo ""

# Start database first
echo -e "${GREEN}[1/3] Khởi động Database...${NC}"
docker compose up -d db

# Wait for database to be healthy
echo -e "${YELLOW}Đợi Database sẵn sàng...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose ps db | grep -q "healthy"; then
        echo -e "${GREEN}✅ Database đã sẵn sàng!${NC}"
        break
    fi
    
    attempt=$((attempt + 1))
    echo -ne "${YELLOW}Đợi... ($attempt/$max_attempts)\r${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Database không khởi động được sau 60 giây${NC}"
    echo -e "${YELLOW}Xem logs:${NC} docker compose logs db"
    exit 1
fi

echo ""

# Start backend
echo -e "${GREEN}[2/3] Khởi động Backend...${NC}"
docker compose up -d be

echo -e "${YELLOW}Đợi Backend sẵn sàng...${NC}"
sleep 10

# Check backend health
if docker compose ps be | grep -q "Up"; then
    echo -e "${GREEN}✅ Backend đã khởi động!${NC}"
else
    echo -e "${RED}❌ Backend có vấn đề${NC}"
    echo -e "${YELLOW}Xem logs:${NC} docker compose logs be"
fi

echo ""

# Start frontend
echo -e "${GREEN}[3/3] Khởi động Frontend...${NC}"
docker compose up -d fe

echo -e "${YELLOW}Đợi Frontend sẵn sàng...${NC}"
sleep 5

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✅ Tất cả services đã khởi động!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Show status
echo -e "${BLUE}Trạng thái services:${NC}"
docker compose ps
echo ""

echo -e "${BLUE}Truy cập ứng dụng:${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:8080${NC}"
echo -e "  Database: ${YELLOW}localhost:1433${NC}"
echo ""

echo -e "${BLUE}Xem logs:${NC}"
echo -e "  Tất cả:   ${YELLOW}docker compose logs -f${NC}"
echo -e "  Backend:  ${YELLOW}docker compose logs -f be${NC}"
echo -e "  Frontend: ${YELLOW}docker compose logs -f fe${NC}"
echo -e "  Database: ${YELLOW}docker compose logs -f db${NC}"
echo ""

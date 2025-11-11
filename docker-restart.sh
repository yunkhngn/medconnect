#!/bin/bash

# Restart Docker services with proper order
# Usage: ./docker-restart.sh

set -e

echo "🔄 Restarting MedConnect services..."
echo ""

# Stop all services
echo "⏹️  Stopping all services..."
docker compose down

echo ""
echo "🗑️  Cleaning up..."
# Optional: Remove volumes (uncomment if needed)
# docker compose down -v

echo ""
echo "🚀 Starting services in order..."

# Start database first
echo "1️⃣  Starting database..."
docker compose up -d db

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker compose ps db | grep -q "healthy"; then
        echo "✅ Database is ready!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Start backend
echo ""
echo "2️⃣  Starting backend..."
docker compose up -d be

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 10

# Start frontend
echo ""
echo "3️⃣  Starting frontend..."
docker compose up -d fe

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Checking status..."
docker compose ps

echo ""
echo "📝 View logs:"
echo "  Backend:  docker compose logs -f be"
echo "  Frontend: docker compose logs -f fe"
echo "  Database: docker compose logs -f db"

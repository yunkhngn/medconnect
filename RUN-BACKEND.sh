#!/bin/bash

echo "========================================="
echo "🚀 STARTING MEDCONNECT BACKEND"
echo "========================================="
echo ""

# Kill old processes
echo "1. Killing old Java processes..."
pkill -9 java 2>/dev/null
sleep 1
echo "   ✅ Done"
echo ""

# Go to backend directory
cd "$(dirname "$0")/medconnect-be" || exit

# Clean and run
echo "2. Starting Spring Boot..."
echo "   (Backend will start on http://localhost:8080)"
echo ""
echo "========================================="
echo "📋 WATCH FOR THESE LOGS:"
echo "========================================="
echo "✅ 'Started MedConnectApplication' - Backend ready"
echo "✅ '[getWeeklySchedule] ========== START ==========' - Doctor viewing schedule"
echo "✅ '[createAppointment] ========== START ==========' - Patient booking"
echo "✅ '[getWeeklySchedule] Found X appointments' - MUST > 0 after booking!"
echo ""
echo "Press Ctrl+C to stop"
echo "========================================="
echo ""

mvn spring-boot:run


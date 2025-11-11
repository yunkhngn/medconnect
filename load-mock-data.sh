#!/bin/bash
# Script to load mock data after backend has created tables via Hibernate

echo "=========================================="
echo "Loading Mock Data into MedConnect Database"
echo "=========================================="

# Wait for backend to be fully ready and create tables
echo "⏳ Waiting for backend to start and create tables (60 seconds)..."
sleep 60

# Run mock data script
echo "📊 Loading mock data..."
docker exec -it medconnect-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "${DB_SA_PASSWORD:-MedConnect@2025}" \
    -d MedConnect \
    -i /scripts/mock-data.sql \
    -C

if [ $? -eq 0 ]; then
    echo "✅ Mock data loaded successfully!"
    echo ""
    echo "📋 Available test accounts:"
    echo "   Admin:   admin.system@medconnect.vn"
    echo "   Doctor:  doctor.an@medconnect.vn"
    echo "   Patient: patient.mai@gmail.com"
    echo ""
else
    echo "❌ Failed to load mock data"
    exit 1
fi

#!/bin/bash

# ========================================
# Force rebuild Spring Boot application
# This ensures Hibernate uses latest entity definitions
# ========================================

echo "🧹 Cleaning old compiled files..."
mvn clean

echo ""
echo "🔨 Compiling with latest entity definitions..."
mvn compile

echo ""
echo "📦 Packaging application..."
mvn package -DskipTests

echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Drop database (if exists)"
echo "   2. mvn spring-boot:run"
echo "   3. Hibernate will create Medical_Record with NVARCHAR(MAX)"
echo ""


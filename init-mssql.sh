#!/bin/bash
# Script to initialize SQL Server database with schema and mock data

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
sleep 30s

# Run the initialization scripts
echo "Running database initialization scripts..."

# 1. Create database
echo "Step 1: Creating database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i /scripts/createdb.sql -C

# 2. Create tables
echo "Step 2: Creating tables..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d MedConnect -i /scripts/init-db.sql -C

# 3. Insert mock data
echo "Step 3: Inserting mock data..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d MedConnect -i /scripts/mock-data.sql -C

echo "Database initialization complete!"

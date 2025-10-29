#!/bin/bash

# Test script for Slot 5 issue
echo "Testing Slot 5 API endpoint..."

# Test with different slots
echo "Testing SLOT_1..."
curl -X POST http://localhost:8080/api/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"date":"2025-10-29","slot":"SLOT_1","status":"RESERVED"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "Testing SLOT_5..."
curl -X POST http://localhost:8080/api/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"date":"2025-10-29","slot":"SLOT_5","status":"RESERVED"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "Testing SLOT_12..."
curl -X POST http://localhost:8080/api/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"date":"2025-10-29","slot":"SLOT_12","status":"RESERVED"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

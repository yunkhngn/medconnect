#!/bin/sh
# Wait for SQL Server to be ready using nc (netcat)
echo "Waiting for SQL Server to be ready..."

# Wait for port 1433 to be open
for i in $(seq 1 60); do
  nc -z db 1433 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "SQL Server port is open, waiting additional 5 seconds for initialization..."
    sleep 5
    echo "SQL Server is ready!"
    exit 0
  fi
  echo "Waiting for SQL Server... ($i/60)"
  sleep 2
done

echo "SQL Server is not ready after 120 seconds"
exit 1


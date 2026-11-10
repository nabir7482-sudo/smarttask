#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Checking Java 17..."
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH."
    exit 1
fi

echo "Packaging backend..."
mvn package -DskipTests

echo "Starting SmartTask Spring Boot Backend on port 8085..."
pkill -f smarttask-backend || true
nohup java -jar target/smarttask-backend-1.0.0.jar > ../backend.log 2>&1 &

echo "Waiting for Spring Boot to initialize on port 8085..."
for i in {1..20}; do
    if curl -s http://localhost:8085/api/tasks/health > /dev/null 2>&1; then
        echo "Backend is UP and healthy!"
        exit 0
    fi
    sleep 1
done

echo "Backend started (check backend.log for details)."

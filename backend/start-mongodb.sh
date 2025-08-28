#!/bin/bash

echo "Starting MongoDB with Docker Compose..."

# Navigate to the backend directory
cd "$(dirname "$0")"

# Start MongoDB and Mongo Express
docker-compose -f docker-compose.dev.yml up -d

echo "MongoDB is starting up..."
echo "MongoDB will be available at: localhost:27017"
echo "Mongo Express (web interface) will be available at: http://localhost:8081"
echo ""
echo "Default credentials:"
echo "Username: admin"
echo "Password: password123"
echo ""
echo "To stop MongoDB, run: docker-compose -f docker-compose.dev.yml down"
echo "To view logs, run: docker-compose -f docker-compose.dev.yml logs -f"

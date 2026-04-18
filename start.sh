#!/bin/bash

echo "🚀 Starting Vastgoedbeheer Application..."

# Maak directories aan als ze niet bestaan
mkdir -p backend/logs

# Start alle services
docker-compose up -d

echo "⏳ Wachten tot alle services opstarten..."
sleep 30

echo "✅ Application started!"
echo "📊 Frontend: https://localhost:4200"
echo "🔧 API: https://localhost:7289/swagger"
echo "🗄️ Database: localhost:1433"
echo ""
echo "🔍 Bekijk logs met: docker-compose logs -f [service-name]"
echo "🛑 Stop met: docker-compose down"
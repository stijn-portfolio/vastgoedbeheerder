#!/bin/bash

echo "🔧 Starting in development mode..."

# Start alleen database
docker-compose up -d db

echo "⏳ Wachten tot database gereed is..."
sleep 30

echo "✅ Database gestart!"
echo "🗄️ Database: localhost:1433"
echo "👨‍💻 Start nu je API en Frontend lokaal voor development"
echo ""
echo "API Command: cd backend && dotnet run"
echo "Frontend Command: cd frontend && ng serve"
echo ""
echo "💡 Als je de API lokaal start, gebruik dan poort 7289 voor consistentie"
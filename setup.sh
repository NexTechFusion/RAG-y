#!/bin/bash

# AI Chat Backend Setup Script
echo "🚀 Setting up AI Chat Backend..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found: $(bun --version)"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the application"
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
    echo "💡 Make sure PostgreSQL server is running and create the database:"
    echo "   createdb ai_chat_db"
else
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL"
fi

# Check if Redis is available
echo "🔍 Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis client found"
    echo "💡 Make sure Redis server is running"
else
    echo "⚠️  Redis client not found. Redis is optional but recommended for caching"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials and JWT secrets"
echo "2. Start PostgreSQL and Redis services"
echo "3. Run migrations: bun run migrate"
echo "4. Run seeds: bun run seed"
echo "5. Start development server: bun run dev"
echo ""
echo "For Docker deployment:"
echo "1. docker-compose up -d"
echo ""
echo "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: Admin123!"
echo "⚠️  Change these credentials immediately in production!" 
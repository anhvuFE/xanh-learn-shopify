#!/bin/bash

echo "🚀 PostgreSQL & Prisma Setup Demo"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Start PostgreSQL with Docker${NC}"
echo "docker-compose up -d"
echo ""

echo -e "${YELLOW}Step 2: Install dependencies${NC}"
echo "npm install @prisma/client"
echo "npm install -D prisma tsx"
echo ""

echo -e "${YELLOW}Step 3: Generate Prisma Client${NC}"
echo "npx prisma generate"
echo ""

echo -e "${YELLOW}Step 4: Create & Run Migration${NC}"
echo "npx prisma migrate dev --name init"
echo ""

echo -e "${YELLOW}Step 5: Seed Database (Optional)${NC}"
echo "npx prisma db seed"
echo ""

echo -e "${YELLOW}Step 6: Open Prisma Studio${NC}"
echo "npx prisma studio"
echo ""

echo -e "${GREEN}✅ Database Ready!${NC}"
echo ""
echo -e "${YELLOW}Connect with DBeaver:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: xanh_shopify_db"
echo "  User: postgres"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}PgAdmin Web UI:${NC}"
echo "  URL: http://localhost:5050"
echo "  Email: admin@admin.com"
echo "  Password: admin"
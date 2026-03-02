# Database Setup Guide

## 1. PostgreSQL Setup Options

### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Database will be available at:
# - Host: localhost
# - Port: 5432
# - Database: xanh_shopify_db
# - User: postgres
# - Password: password123

# PgAdmin available at: http://localhost:5050
# - Email: admin@admin.com
# - Password: admin
```

### Option B: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
psql -U postgres
CREATE DATABASE xanh_shopify_db;
\q
```

### Option C: Using Existing Database
Update `.env` file with your database connection:
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

## 2. Prisma Setup

### Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

### Initialize Prisma (if needed)
```bash
npx prisma init
```

### Generate Prisma Client
```bash
npx prisma generate
```

## 3. Database Migration

### Create and Apply Migrations
```bash
# Create migration from schema
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy
```

### Pull from Existing Database
```bash
# If you have an existing database
npx prisma db pull
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

## 4. Database Management

### Prisma Studio (GUI)
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Seed Database
```bash
# Create seed file: prisma/seed.ts
npx prisma db seed
```

### Check Database Status
```bash
npx prisma migrate status
```

## 5. Connect with DBeaver

1. Open DBeaver
2. New Connection → PostgreSQL
3. Connection Settings:
   - Host: `localhost`
   - Port: `5432`
   - Database: `xanh_shopify_db`
   - Username: `postgres`
   - Password: `password123`
4. Test Connection → OK

## 6. Environment Variables

Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://postgres:password123@localhost:5432/xanh_shopify_db?schema=public"

# Shopify (update with your values)
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
```

## 7. Common Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it xanh_postgres psql -U postgres -d xanh_shopify_db

# Backup database
docker exec xanh_postgres pg_dump -U postgres xanh_shopify_db > backup.sql

# Restore database
docker exec -i xanh_postgres psql -U postgres xanh_shopify_db < backup.sql
```

## 8. Troubleshooting

### Port already in use
```bash
# Check what's using port 5432
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "5433:5432"
```

### Connection refused
```bash
# Check if PostgreSQL is running
docker ps

# Restart containers
docker-compose restart
```

### Migration errors
```bash
# Check migration status
npx prisma migrate status

# Force resolve
npx prisma migrate resolve --applied <migration_name>
```

## Models Created

- **Session**: Shopify session management
- **Product**: Product catalog
- **Customer**: Customer data
- **Address**: Customer addresses
- **Order**: Order management
- **OrderItem**: Order line items
- **Review**: Customer reviews
- **InventoryAlert**: Stock alerts
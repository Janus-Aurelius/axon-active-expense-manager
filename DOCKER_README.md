# Docker Setup for Expense Manager

This project includes Docker configuration with environment variables and database migrations for easy deployment and development.

## Services

- **PostgreSQL Database**: Port 5432 (with persistent volume & init scripts)
- **Spring Boot Backend**: Port 8080 (configurable via .env)
- **Nginx Frontend**: Port 80 (configurable via .env)

## Prerequisites

1. **Setup Environment Variables**:

   ```bash
   # Copy the example environment file
   Copy-Item .env.example .env

   # Edit .env file with your preferred settings
   notepad .env
   ```

2. **Review Database Schema**: Check `database/init/` folder for SQL migration scripts

## Quick Start

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Individual Service Commands

### Backend Only

```bash
cd backend/expensemanagerbackend
docker build -t expense-manager-backend .
docker run -p 8080:8080 expense-manager-backend
```

### Frontend Only

```bash
cd frontend
docker build -t expense-manager-frontend .
docker run -p 80:80 expense-manager-frontend
```

### Database Only

```bash
docker run -d \
  --name postgres-expense-manager \
  -e POSTGRES_DB=expense_manager_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

## Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Remove all containers and volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend

# View service logs
docker-compose logs backend
docker-compose logs postgres
docker-compose logs frontend

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d expense_manager_db

# Restart specific service
docker-compose restart backend
```

## Volumes

- `postgres_data`: Persistent PostgreSQL data storage
- `postgres_prod_data`: Production PostgreSQL data storage (when using prod config)

## Networks

All services communicate through the `expense-manager-network` bridge network.

## Configuration

Configuration is managed through the `.env` file:

- **POSTGRES_DB**: Database name (default: expense_manager_db)
- **POSTGRES_USER**: Database user (default: postgres)
- **POSTGRES_PASSWORD**: Database password (default: your_secure_password_here)
- **SERVER_PORT**: Backend port (default: 8080)
- **FRONTEND_PORT**: Frontend port (default: 80)
- **SPRING_PROFILES_ACTIVE**: Spring profile (default: docker)

## Database Migrations

Database schema is managed through SQL scripts in `database/init/`:

- `01-schema.sql`: Creates tables, indexes, and constraints
- `02-seed-data.sql`: Inserts sample data for demo

**Adding New Tables**:

1. Create new SQL script: `03-your-feature.sql`
2. Add your CREATE TABLE statements
3. Rebuild containers: `docker-compose down -v && docker-compose up --build`

**Note**: Init scripts only run on fresh database. To apply changes to existing data, remove the volume: `docker-compose down -v`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 8080, and 5432 are not in use
2. **Permission issues**: On Windows, make sure Docker Desktop is running
3. **Build failures**: Try `docker-compose build --no-cache`

### Health Checks

The PostgreSQL service includes health checks. The backend will wait for the database to be ready before starting.

### Accessing Services

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Database: localhost:5432

## Development Tips

1. **Environment Setup**: Always copy `.env.example` to `.env` before first run
2. **Backend Changes**: Rebuild container after code changes: `docker-compose build backend`
3. **Frontend Changes**: Rebuild container after changes: `docker-compose build frontend`
4. **Database Schema Changes**: Add new SQL files to `database/init/` and restart with fresh volume
5. **Fresh Start**: Remove all data and restart: `docker-compose down -v && docker-compose up --build`
6. **View Sample Data**: Demo user credentials - Username: `demo_user`, Password: `demo123`

## Demo Features

The setup includes:

- ✅ **Pre-configured expense categories** (Food, Transportation, Shopping, etc.)
- ✅ **Sample demo user** with test expenses
- ✅ **Proper database relationships** with foreign keys
- ✅ **Indexed tables** for better performance
- ✅ **Environment-based configuration**

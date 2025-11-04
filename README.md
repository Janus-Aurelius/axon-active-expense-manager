# Expense Manager Monorepo

A full-stack expense management application with a Spring Boot backend and vanilla HTML/CSS/JavaScript frontend.

## Project Structure

```
axon-active-expense-manager/
├── backend/
│   └── expensemanagerbackend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/em/expensemanagerbackend/
│       │   │   │       ├── ExpensemanagerbackendApplication.java
│       │   │   │       ├── config/
│       │   │   │       │   ├── SecurityConfig.java
│       │   │   │       │   └── WebConfig.java
│       │   │   │       └── controller/
│       │   │   │           └── HealthController.java
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       ├── pom.xml
│       ├── mvnw
│       └── mvnw.cmd
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── assets/
├── .gitignore
└── README.md
```

## Technologies Used

### Backend

- **Java 21**
- **Spring Boot 3.5.7**
- **Spring Security**
- **Spring Data JPA**
- **PostgreSQL** (configured)
- **Maven** (build tool)

### Frontend

- **HTML5**
- **CSS3** (with modern features)
- **Vanilla JavaScript** (ES6+)

## Prerequisites

1. **Java 21** or higher
2. **PostgreSQL** (optional - configured but not required for basic functionality)
3. **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd axon-active-expense-manager
```

### 2. Database Setup (Optional)

If you want to use PostgreSQL:

```sql
-- Create database
CREATE DATABASE expense_manager_db;

-- Create user (or use existing postgres user)
CREATE USER expense_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE expense_manager_db TO expense_user;
```

Update the database configuration in `backend/expensemanagerbackend/src/main/resources/application.properties` if needed.

### 3. Run the Application

#### Option 1: Using Maven Wrapper (Recommended)

```bash
# Navigate to backend directory
cd backend/expensemanagerbackend

# Run the application
./mvnw.cmd spring-boot:run
```

#### Option 2: Using Maven (if installed globally)

```bash
cd backend/expensemanagerbackend
mvn spring-boot:run
```

### 4. Access the Application

Once the backend is running:

- **Frontend**: http://localhost:8080
- **API Health Check**: http://localhost:8080/api/health
- **API Test Endpoint**: http://localhost:8080/api/test

## Features

### Current Features

- ✅ Monorepo setup with comprehensive .gitignore
- ✅ Spring Boot backend with CORS configuration
- ✅ Static file serving for frontend
- ✅ Health check endpoints
- ✅ Modern responsive frontend with connection testing
- ✅ Security configuration (development-friendly)

### Planned Features

- 🚧 User authentication and authorization
- 🚧 Expense CRUD operations
- 🚧 Category management
- 🚧 Expense reporting and analytics
- 🚧 Data export functionality

## Development

### Backend Development

- Main application: `backend/expensemanagerbackend/src/main/java/com/em/expensemanagerbackend/`
- Configuration: `backend/expensemanagerbackend/src/main/resources/application.properties`
- Tests: `backend/expensemanagerbackend/src/test/`

### Frontend Development

- HTML: `frontend/index.html`
- Styles: `frontend/css/style.css`
- JavaScript: `frontend/js/app.js`
- Assets: `frontend/assets/`

### Building for Production

```bash
cd backend/expensemanagerbackend
./mvnw.cmd clean package -DskipTests
```

The JAR file will be created in `backend/expensemanagerbackend/target/`.

## Configuration

### Application Properties

Key configuration options in `application.properties`:

- Server port: `server.port=8080`
- Database URL: `spring.datasource.url=jdbc:postgresql://localhost:5432/expense_manager_db`
- Static resources: `spring.web.resources.static-locations=file:./../../frontend/,classpath:/static/`

### CORS Configuration

CORS is configured in `WebConfig.java` to allow frontend-backend communication.

### Security Configuration

Security is configured in `SecurityConfig.java` with development-friendly settings.

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**

   - Change the port in `application.properties`: `server.port=8081`
   - Update frontend JavaScript accordingly

2. **Database connection issues**

   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`
   - The application will start without database for basic functionality

3. **Frontend not loading**

   - Ensure you're accessing `http://localhost:8080` (not just the frontend folder)
   - Check browser console for errors
   - Verify static resource configuration

4. **API endpoints not working**
   - Check if Spring Boot application started successfully
   - Verify CORS configuration
   - Check browser network tab for request details

## Git Workflow

This is set up as a monorepo with a comprehensive `.gitignore` file that handles:

- IDE files (.idea/, .vscode/)
- Build artifacts (target/, node_modules/)
- OS-specific files (.DS_Store, Thumbs.db)
- Environment and database files
- Logs and temporary files

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Add your license information here]

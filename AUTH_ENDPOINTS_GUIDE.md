# Authentication Endpoints Test Guide

## Login/Logout Controller Documentation

The authentication system has been successfully implemented with the following endpoints:

### 1. Login Endpoint

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "fullName": "John Doe",
  "email": "user@example.com",
  "role": "EMPLOYEE"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Error: Invalid email or password!"
}
```

### 2. Logout Endpoint

**POST** `/api/auth/logout`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Success Response (200 OK):**

```json
{
  "message": "Logout successful!"
}
```

### 3. Token Verification Endpoint

**GET** `/api/auth/verify`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Success Response (200 OK):**

```json
{
  "message": "Token is valid!"
}
```

### 4. Current User Endpoint

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Success Response (200 OK):**

```json
{
  "token": null,
  "tokenType": "Bearer",
  "userId": 1,
  "fullName": "John Doe",
  "email": "user@example.com",
  "role": "EMPLOYEE"
}
```

## Testing with curl:

### 1. Login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Access Protected Endpoint:

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3. Logout:

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Features Implemented:

1. **JWT-based Authentication**: Stateless authentication using JSON Web Tokens
2. **Password Storage**: Plaintext password storage for development/testing
3. **Role-based Access**: Support for different user roles (EMPLOYEE, MANAGER, FINANCE)
4. **Token Validation**: Automatic token validation for protected endpoints
5. **CORS Support**: Cross-origin requests enabled
6. **Error Handling**: Comprehensive error handling with meaningful messages
7. **Validation**: Input validation for login requests

## Security Configuration:

- All `/api/auth/**` endpoints are publicly accessible
- All other `/api/**` endpoints require authentication
- JWT tokens expire after 24 hours (configurable)
- Passwords are stored in plaintext for development/testing purposes
- CORS is configured to allow cross-origin requests

## Next Steps:

1. Ensure you have users in your database for testing
2. Consider implementing password reset functionality
3. Add rate limiting for login attempts
4. Implement token refresh mechanism
5. Add user registration endpoint if needed

# Task Tracking System - API Documentation

This project provides a backend system for user authentication and profile management with centralized error handling and session tracking.

## Base URL
`http://localhost:3000`

---

## Authentication Endpoints

### 1. Register User
Creates a new user account.

*   **URL**: `/api/users/register`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "name": "Kiran Kumar",
      "email": "kiran@example.com",
      "password": "password123",
      "bio": "Software Engineer",
      "profilePicture": "https://example.com/photo.jpg"
    }
    ```
*   **Responses**:
    *   **201 Created**:
        ```json
        {
          "status": "success",
          "token": "eyJhbG...",
          "data": {
            "user": {
              "_id": "65d...",
              "name": "Kiran Kumar",
              "email": "kiran@example.com",
              "role": "user",
              "isLoggedin": true
            }
          }
        }
        ```
    *   **400 Bad Request (Duplicate Email)**:
        ```json
        {
          "status": "fail",
          "message": "Email 'kiran@example.com' already exists. Please use another one."
        }
        ```

*   **CURL**:
    ```bash
    curl -X POST http://localhost:3000/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"name": "Kiran Kumar", "email": "kiran@example.com", "password": "password123"}'
    ```

---

### 2. Login User
Authenticates a user and returns a JWT in an HTTP-only cookie.

*   **URL**: `/api/users/login`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "email": "kiran@example.com",
      "password": "password123"
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "status": "success",
          "token": "eyJhbG...",
          "data": {
            "user": { ... }
          }
        }
        ```
    *   **401 Unauthorized (Wrong Password)**:
        ```json
        {
          "status": "fail",
          "message": "Incorrect email or password"
        }
        ```

*   **CURL**:
    ```bash
    curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email": "kiran@example.com", "password": "password123"}'
    ```

---

### 3. Logout User
Invalidates the user session and clears the JWT cookie.

*   **URL**: `/api/users/logout`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <TOKEN>` (or via cookie)
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "status": "success",
          "message": "Successfully logged out"
        }
        ```

*   **CURL**:
    ```bash
    curl -X POST http://localhost:3000/api/users/logout \
    -H "Authorization: Bearer your_token_here"
    ```

---

## User Profile Endpoints (Protected)

### 1. Get My Profile
Retrieves the currently logged-in user's profile.

*   **URL**: `/api/users/me`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <TOKEN>`
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "status": "success",
          "data": {
            "user": { ... }
          }
        }
        ```
    *   **401 Unauthorized (Logged Out/Invalid Token)**:
        ```json
        {
          "status": "fail",
          "message": "Invalid token. Please log in again!"
        }
        ```

---

### 2. Update My Profile
Updates the user's name, bio, or profile picture.

*   **URL**: `/api/users/updateMe`
*   **Method**: `PATCH`
*   **Headers**: `Authorization: Bearer <TOKEN>`
*   **Body**:
    ```json
    {
      "name": "Updated Name",
      "bio": "Updated bio details"
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "status": "success",
          "data": {
            "user": { ... }
          }
        }
        ```
    *   **400 Bad Request (Invalid Fields)**:
        ```json
        {
          "status": "fail",
          "message": "No valid fields provided for update. Allowed fields are: name, profilePicture, bio"
        }
        ```

*   **CURL**:
    ```bash
    curl -X PATCH http://localhost:3000/api/users/updateMe \
    -H "Authorization: Bearer your_token_here" \
    -H "Content-Type: application/json" \
    -d '{"name": "Updated Name"}'
    ```

---

## Error Handling
The system uses centralized error handling for consistency.

| Status Code | Error Status | Description |
| :--- | :--- | :--- |
| **400** | `fail` | Operational error (Validator, Duplicate Key, etc.) |
| **401** | `fail` | Authentication error (Invalid Token, Expired, Logged Out) |
| **404** | `fail` | Route not found |
| **500** | `error` | Unexpected programming error |

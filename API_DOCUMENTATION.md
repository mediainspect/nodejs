# API Documentation

## Authentication Endpoints

### Register User
- **URL**: `/register`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**: 
  - **Code**: 201
  - **Content**: `{ "message": "User registered successfully" }`

### Login User
- **URL**: `/login`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**: 
  - **Code**: 200
  - **Content**: `{ "auth": true, "token": "JWT_TOKEN" }`

## Media Endpoints

### Get Media Items
- **URL**: `/media`
- **Method**: `GET`
- **Headers**: `x-access-token: JWT_TOKEN`
- **Query Parameters**: 
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Success Response**: 
  - **Code**: 200
  - **Content**: `{ "results": [...], "next": {...}, "previous": {...} }`

### Create Media Item
- **URL**: `/media`
- **Method**: `POST`
- **Headers**: `x-access-token: JWT_TOKEN`
- **Body**: 
  ```json
  {
    "title": "string",
    "type": "audio|video",
    "url": "string"
  }
  ```
- **Success Response**: 
  - **Code**: 201
  - **Content**: `{ "message": "Media item created successfully" }`

### Delete Media Item (Admin only)
- **URL**: `/media/:id`
- **Method**: `DELETE`
- **Headers**: `x-access-token: JWT_TOKEN`
- **Success Response**: 
  - **Code**: 200
  - **Content**: `{ "message": "Media item deleted successfully" }`

... (continue with other endpoints)

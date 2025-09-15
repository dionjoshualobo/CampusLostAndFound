# API Documentation

This document provides a comprehensive reference for all API endpoints in the Campus Lost and Found application.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.vercel.app/api`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string (if applicable)
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "123-456-7890",
  "student_id": "STU001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "123-456-7890",
      "student_id": "STU001"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/me
Get current user information. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "123-456-7890",
    "student_id": "STU001",
    "profile_completed": true
  }
}
```

## Items Endpoints

### GET /items
Get all items with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category ID
- `type` (optional): Filter by type ('lost' or 'found')
- `search` (optional): Search in title and description
- `status` (optional): Filter by status ('active', 'claimed', 'resolved')
- `limit` (optional): Number of items per page (default: 20)
- `offset` (optional): Number of items to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Lost iPhone 13",
      "description": "Black iPhone 13 with clear case",
      "type": "lost",
      "category": "Electronics",
      "location": "Library",
      "date_lost_found": "2023-12-01",
      "status": "active",
      "user_name": "John Doe",
      "images": ["image_url_1.jpg"],
      "created_at": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### GET /items/stats
Get item statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 150,
    "lost_items": 80,
    "found_items": 70,
    "resolved_items": 25,
    "active_items": 125
  }
}
```

### GET /items/:id
Get specific item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Lost iPhone 13",
    "description": "Black iPhone 13 with clear case",
    "type": "lost",
    "category_id": 1,
    "category_name": "Electronics",
    "location": "Library",
    "date_lost_found": "2023-12-01",
    "contact_info": "Call 123-456-7890",
    "reward": 50.00,
    "status": "active",
    "resolved": false,
    "user_id": 1,
    "user_name": "John Doe",
    "images": [
      {
        "id": 1,
        "image_url": "image_url_1.jpg",
        "is_primary": true
      }
    ],
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z"
  }
}
```

### POST /items
Create a new item. Requires authentication.

**Request Body:**
```json
{
  "title": "Lost iPhone 13",
  "description": "Black iPhone 13 with clear case",
  "type": "lost",
  "category_id": 1,
  "location": "Library",
  "date_lost_found": "2023-12-01",
  "contact_info": "Call 123-456-7890",
  "reward": 50.00,
  "images": ["base64_image_1", "base64_image_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Lost iPhone 13",
    "description": "Black iPhone 13 with clear case",
    "type": "lost",
    "status": "active"
  }
}
```

### PUT /items/:id
Update an item. Requires authentication and ownership.

**Request Body:** Same as POST /items

### PUT /items/:id/claim
Claim or resolve an item. Requires authentication.

**Request Body:**
```json
{
  "action": "claim",  // or "resolve"
  "message": "I found this item"
}
```

### DELETE /items/:id
Delete an item. Requires authentication and ownership.

## Categories Endpoints

### GET /categories
Get all categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories"
    },
    {
      "id": 2,
      "name": "Clothing",
      "description": "Clothes, shoes, and accessories"
    }
  ]
}
```

### POST /categories
Create a new category. Requires authentication.

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

## Comments Endpoints

### GET /items/:id/comments
Get comments for a specific item.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "I think I saw this in the cafeteria",
      "user_name": "Jane Smith",
      "created_at": "2023-12-01T11:00:00Z"
    }
  ]
}
```

### POST /items/:id/comments
Add a comment to an item. Requires authentication.

**Request Body:**
```json
{
  "content": "I think I saw this in the cafeteria"
}
```

## Notifications Endpoints

### GET /notifications
Get user notifications. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "Someone commented on your lost item",
      "type": "comment",
      "is_read": false,
      "item_id": 1,
      "item_title": "Lost iPhone 13",
      "created_at": "2023-12-01T12:00:00Z"
    }
  ]
}
```

### PUT /notifications/:id/read
Mark a notification as read. Requires authentication.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Users Endpoints

### GET /users/:id
Get user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "student_id": "STU001",
    "created_at": "2023-12-01T09:00:00Z"
  }
}
```

### PUT /users/:id
Update user profile. Requires authentication and ownership.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "123-456-7890",
  "student_id": "STU001"
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "message": "User-friendly error message"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Exceeded rate limits return HTTP 429 status code.

## Image Upload

Images are uploaded as base64 encoded strings in item creation/update requests. The server handles:
- Image validation and processing
- Storage in Supabase Storage
- Thumbnail generation
- URL generation for client access

Maximum image size: 5MB per image
Supported formats: JPEG, PNG, WebP
Maximum images per item: 5
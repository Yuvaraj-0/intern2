# Intern Project - Task Manager API

A full-stack task management application with JWT authentication, role-based access control, product CRUD, and Redis caching.

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Cache** | Redis Cloud |
| **Auth** | JWT (Access + Refresh Tokens) |
| **Frontend** | React.js, Tailwind CSS |
| **Container** | Docker, Docker Compose |

## ✨ Features

### Backend
- ✅ User Registration & Login with JWT
- ✅ Refresh Token mechanism (7 days expiry)
- ✅ Role-Based Access Control (User/Admin)
- ✅ Product CRUD Operations (Admin only)
- ✅ Redis Caching for GET endpoints
- ✅ API Versioning (`/api/v1`)
- ✅ Swagger API Documentation
- ✅ Input Validation & Error Handling

### Frontend
- ✅ Login/Register Pages
- ✅ Product Listing with Search & Filters
- ✅ Product Detail Page
- ✅ Admin Dashboard
- ✅ Admin Product Management (Add/Edit/Delete)
- ✅ Protected Routes
- ✅ Responsive Design

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account
- Redis Cloud account

- ## 🐳 Run with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/intern-project.git
cd intern-project

# Create .env file with your secrets
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secrets

# Build and run all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d

# View logs in real-time
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://...
NODE_ENV=development

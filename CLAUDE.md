# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Node.js/Express)
- Start backend server: `cd backend && npm start`
- Backend runs on port 3030 (or PORT env variable)

### Frontend (React/Vite) 
- Start development server: `cd frontend && npm run dev`
- Build for production: `cd frontend && npm run build`
- Run linter: `cd frontend && npm run lint`
- Preview production build: `cd frontend && npm run preview`

## Architecture Overview

This is a full-stack web application with separate backend and frontend folders:

### Backend Architecture
- **Framework**: Express.js with CORS enabled
- **Database**: MySQL with custom singleton connection pattern (`dbSingleton.js`)
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API Structure**: RESTful routes organized by domain:
  - `/api/auth/` - Authentication (login/register)
  - `/api/users/` - User management
  - `/api/businesses/` - Business operations
  - `/api/search/` - Search functionality

### Frontend Architecture  
- **Framework**: React 19 with Vite build tool
- **Routing**: React Router DOM v7 with protected routes
- **State Management**: Local state + UserContext for authentication
- **Styling**: CSS modules for component-specific styles
- **HTTP Client**: Axios with configured base instance

### Key Patterns
- **Database Connection**: Uses singleton pattern in `dbSingleton.js` with automatic reconnection
- **Authentication Flow**: JWT tokens stored in localStorage with user data
- **Protected Routes**: Route-level protection based on authentication state
- **Component Structure**: Organized by feature with co-located CSS modules

### Database Integration
- Uses MySQL2 with promise interface for async/await patterns
- Connection singleton handles reconnection on connection loss
- Environment variables for database configuration (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)

### User Roles
The application supports role-based functionality with users having roles like 'customer' and 'business_owner'.
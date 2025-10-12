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

### Project Management
- Start both servers with logging: `./start.sh`
- Watch logs in real-time: `./watch-logs.sh`
- Clear logs: `./clear-logs.sh`

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
  - `/api/appointments/` - Appointment booking system

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

## Component Architecture Patterns

### Dashboard Components
- **Business Dashboard**: Located in `components/BusinessDashboard/` with hooks, views, and components
- **User Dashboard**: Located in `components/UserDashboard/` with similar structure
- Both use custom hooks (`useDashboardData.js`) for API integration with fallback to mock data

### Booking Flow
- **BookingPage**: Multi-step appointment booking process with state management
- **Components**: ServiceSummary, CalendarPicker, TimeSlotPicker, BookingForm, BookingConfirmation
- **Auto-fill**: User data automatically pre-filled from database in booking forms

### Form Patterns
- CSS modules for styling with design system variables
- Controlled components with validation
- Error handling with user-friendly messages
- Loading states for async operations

## Database Schema Key Tables

### Core Tables
- `users` - User accounts (customers, business owners, admins)
- `businesses` - Business listings with details
- `services` - Services offered by businesses  
- `appointments` - Appointment bookings with customer_id, business_id, service_id
- `user_favorites` - User-business relationships

### API Endpoints Design
- Dashboard endpoints return comprehensive data in single calls
- Real-time updates through efficient JOIN queries
- Graceful error handling with fallback mechanisms

## Design System Integration

### CSS Architecture
- Design system variables in `styles/design-system-variables.css`
- CSS modules for component isolation
- Mobile-first responsive design
- RTL support for Hebrew/Arabic text
- Accessibility compliance (WCAG 2.1 AA)

### Component Patterns
- Touch-friendly interfaces (44px minimum)
- Consistent spacing using 8px grid system
- Animation and transition system
- Color palette for different user roles and states

## Development Workflow

### Error Handling Strategy
- Frontend: Custom `useErrorHandler` hook for consistent error management
- Backend: Try-catch blocks with detailed error responses
- Database: Connection retry logic with fallback mechanisms
- User Experience: Loading states and fallback data when APIs fail

### API Integration Pattern
- `axiosInstance.js` for centralized HTTP configuration
- Custom hooks for data fetching with caching
- Real database integration with mock data fallbacks
- Response transformation layers for API compatibility

### Authentication Flow
- localStorage for token and user data persistence
- Protected route components based on user roles
- Automatic token injection in API requests
- Login/logout state management through UserContext

## Important Implementation Notes

### Booking System
- Multi-step booking process with state preservation
- Automatic user data pre-filling from database
- Real-time availability checking
- Appointment creation with customer auto-creation

### Database Operations
- Connection singleton prevents multiple connections
- Promise-based queries using mysql2
- Automatic customer creation in appointment booking
- Comprehensive JOIN queries for dashboard data

### File Upload Handling
- Multer integration for file uploads
- Image handling for business profiles
- Upload route available at `/api/upload`

### Logging System
- Structured logging to files (`logs/backend.log`, `logs/frontend.log`)
- Real-time log viewing with provided scripts
- Log rotation and cleanup in start script
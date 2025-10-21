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
- **Entry Point**: `backend/src/app.js` - Main application file that mounts all routes
- **Database**: MySQL with custom singleton connection pattern (`dbSingleton.js`)
  - Provides both callback-based and promise-based connections via `getPromise()` method
  - Automatic reconnection on connection loss
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API Structure**: RESTful routes organized by domain:
  - `/api/auth/` - Authentication (login/register)
  - `/api/users/` - User management
  - `/api/businesses/` - Business operations
  - `/api/search/` - Search functionality
  - `/api/appointments/` - Appointment booking system
  - `/api/admin/` - Admin panel operations
  - `/api/reviews/` - Review system
  - `/api/reports/` - Report generation
  - `/api/upload` - File upload handling (via Multer)
  - `/api/cleanup` - File cleanup operations

### Backend Services Layer
- **reportService.js**: Aggregates business data and generates reports
- **pdfService.js**: Renders HTML templates to PDF using Puppeteer
- **Templates**: HTML report templates in `backend/templates/reports/` (day, month, year reports)

### Backend Controllers
- **adminController.js**: Admin stats, user management, business approval, analytics
- **appointmentController.js**: Appointment CRUD operations (note: contains duplicate code)
- **businessController.js**: Business management, services, dashboard data (note: `getBusinessById` defined twice)
- **reportController.js**: Report generation, preview, available dates
- **reviewController.js**: Empty placeholder (frontend uses `/api/reviews` but will get 404/501)

### Frontend Architecture
- **Framework**: React 19 with Vite build tool
- **Entry Point**: `frontend/src/main.jsx` - Mounts app with providers
- **Routing**: React Router DOM v7 with protected routes in `App.jsx`
- **State Management**:
  - Local component state
  - `UserContext` for authentication state
  - `ToastContext` for notifications
- **Styling**: CSS modules for component isolation + global design system
- **HTTP Client**: Axios with configured base instance (`axiosInstance.js`)

### Key Patterns
- **Database Connection**: Singleton pattern in `dbSingleton.js` with automatic reconnection
- **Authentication Flow**: JWT tokens stored in localStorage with user data
- **Protected Routes**: Route-level protection based on authentication state
- **Component Structure**: Organized by feature with co-located CSS modules
- **Custom Hooks**:
  - `useErrorHandler` - Consistent error management
  - `useImageUpload` - Image upload functionality
  - `usePullToRefresh` - Mobile pull-to-refresh
  - `useSwipeGestures` - Swipe navigation

### Database Integration
- Uses MySQL2 with promise interface for async/await patterns
- Connection singleton handles reconnection on connection loss
- Environment variables for database configuration (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Most routes call `dbSingleton.getPromise()` to access promise-based connection

### User Roles
The application supports role-based functionality with users having roles like 'customer', 'business_owner', and 'admin'.

## Component Architecture Patterns

### Dashboard Components
- **Business Dashboard** (`components/BusinessDashboard/`):
  - `NewBusinessDashboard.jsx` - Main dashboard component
  - `KpiCards.jsx` - Key performance indicators
  - `PerformanceChart.jsx` - Visual analytics
  - `PopularServices.jsx` - Service statistics
  - `ActivityFeed.jsx` - Recent activity stream
  - `ReportGenerator/` - PDF report generation interface
- **User Dashboard** (`components/UserDashboard/`):
  - Main dashboard with appointments and profile
  - `ProfileModal/` - User profile editing
  - `ReviewableAppointments/` - Completed appointments for review
  - `ReviewModal/` - Review submission interface

### Booking Flow
- **BookingPage**: Multi-step appointment booking process with state management
- **Components**: ServiceSummary, CalendarPicker, TimeSlotPicker, BookingForm, BookingConfirmation
- **Auto-fill**: User data automatically pre-filled from database in booking forms
- **Flow**: Service selection → Date selection → Time slot → Contact form → Confirmation

### Business Profile Components
- **BusinessProfile** (`components/BusinessProfile/`):
  - Main profile page with tabs (Calendar, Gallery)
  - **Sidebar Components**: BusinessDetailsForm, ServicesModal, GalleryEdit, ExistingAppointments, RequestsTab
  - **Tab Components**: Calendar, GalleryView
  - **Mobile Features**: MobileNavigation, FloatingActionButton, PullToRefresh, LazyImage
  - **Hooks**: useSwipeGestures, usePullToRefresh

### Admin Panel Components
- **AdminPanel** (`components/AdminPanel/`):
  - `AdminStats.jsx` - System-wide statistics and analytics
  - `AdminUsers.jsx` - User management
  - `AdminBusinesses.jsx` - Business management and approval
  - `AdminAppointments.jsx` - Appointment oversight

### Public Business Profile
- **BusinessPublicProfile** (`components/BusinessPublicProfile/`):
  - `ProfileHeader` - Business header with favorite button
  - `ContactInfo` - Business contact details
  - `About` - Business description
  - `ImageGallery` - Business photos
  - `ServiceList` - Available services with booking
  - `ReviewsList` - Customer reviews with report functionality
  - `SkeletonLoader` - Loading states for better UX

### Shared Components
- **Error Handling**: `ErrorMessage` component for consistent error display
- **Loading States**: `LoadingSpinner` component
- **File Upload**: `DragDropUpload` component with image upload hook
- **Notifications**: Toast system via `ToastContext`

### Form Patterns
- CSS modules for styling with design system variables
- Controlled components with validation
- Error handling with user-friendly messages
- Loading states for async operations
- Consistent form styling in `Forms/Form.module.css`

## Data Flow and Interactions

### Authentication and Authorization Flow
- `backend/routes/auth.js` handles registration and login, accessing DB via `dbSingleton`
- Generated JWT token is used on frontend
- `axiosInstance` automatically injects `Authorization` header in all requests
- `UserContext` stores token and role, determining access to React Router routes
- Protected routes in `App.jsx` check authentication state

### Business Management Flow
- Frontend components (BusinessProfile, BusinessEditPage, BusinessDashboard) call `/api/businesses/*`
- Routes forward to `businessController` methods
- Controller uses `dbSingleton` for CRUD operations and dashboard assembly
- Dashboard aggregates: business info, services, appointments, reviews, analytics

### Booking Flow
- `frontend/src/components/BookingPage/*` components interact with `/api/appointments`
- Backend logic split between `routes/appointments.js` (validation, aggregation) and `controllers/appointmentController.js`
- Process: Service selection → Availability check → Appointment creation → Customer auto-creation if needed

### Reporting Flow
- Business dashboard calls `reportService` via `routes/reports.js`
- `reportService` generates data queries, `pdfService` renders HTML templates to PDF using Puppeteer
- Templates located in `backend/templates/reports/` (day, month, year variants)

### Admin Operations
- `AdminPanel` components call `/api/admin/*`, `/api/users`, `/api/businesses`
- `adminController` aggregates statistics using SQL queries
- User role updates, business management, system analytics

### Media Upload and Cleanup
- File uploads via `routes/upload.js` using Multer
- Images saved with thumbnail generation using Sharp
- Cleanup service (`routes/cleanup.js`) scans `uploads/` and `uploads/thumbnails/` for orphaned files

### Review System
- Frontend components submit reviews via `/api/reviews`
- Review display, reporting, and management
- Business ratings calculated from review data

## Database Schema Key Tables

### Core Tables
- `users` - User accounts (customers, business owners, admins)
- `businesses` - Business listings with details
- `services` - Services offered by businesses
- `appointments` - Appointment bookings with customer_id, business_id, service_id
- `user_favorites` - User-business relationships
- `reviews` - Customer reviews for businesses
- `categories` - Business categories

### API Endpoints Design
- Dashboard endpoints return comprehensive data in single calls
- Real-time updates through efficient JOIN queries
- Graceful error handling with fallback mechanisms
- Most queries use promise-based async/await pattern

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

## Known Issues and Risk Areas

### Backend Code Quality Issues

#### Duplicate Code in Controllers
- **appointmentController.js**: Contains duplicate function definitions and repeated `require('../dbSingleton')` inside function bodies
  - Second half of file uses `db.execute` which doesn't exist on exported object
  - May cause inconsistent responses (`status: 'scheduled'` vs `status: 'pending'`)
  - Routes may get different behaviors depending on which implementation is called

- **businessController.js**: `getBusinessById` is defined twice
  - Second definition overwrites the first
  - Can cause confusion and inconsistent API responses

#### Missing Implementations
- **reviewController.js**: Completely empty
  - Frontend imports and uses `/api/reviews` endpoints
  - These requests will return 404/501 errors
  - Review functionality exists in routes but not in dedicated controller

#### Database Schema Mismatches
- **adminController.js**: References non-existent columns
  - `status`, `approved_at`, `rejection_reason` fields don't exist in current schema
  - Code silently ignores status updates or returns placeholder data
  - Needs schema updates or code refactoring when database changes

#### Security Concerns
- **routes/cleanup.js** and parts of **routes/admin.js**: No authorization checks
  - Perform dangerous operations (file deletion) synchronously
  - Missing authentication/authorization middleware
  - Could allow unauthorized access to admin functions

### Frontend Issues

#### API Integration Problems
- **BusinessProfile/api/appointments.js**: Uses `fetch` instead of `axiosInstance`
  - Bypasses global error handlers
  - Doesn't include JWT tokens automatically
  - May cause CORS or 401 errors in production

#### Invalid Code
- **BookingConfirmation.jsx**: Incomplete import statement
  - `import {` without specifying imported symbols
  - Code is invalid and won't compile
  - Needs to be fixed with proper import list

#### SSR/Testing Issues
- **usePullToRefresh.js** and other hooks: Direct `window`/`document` usage
  - No checks for environment
  - Will fail in SSR or test environments
  - Need conditional checks or mocks

### Testing Gaps
- **Cleanup service**: No tests in `backend/tests/`
- File upload functionality: Limited test coverage
- Admin operations: Minimal testing
- Mobile-specific features: No automated tests for pull-to-refresh, swipe gestures

### Architectural Concerns
- Route logic sometimes duplicated between routes and controllers
- Some routes have inline logic instead of delegating to controllers
- Inconsistent error handling patterns across different endpoints
- Missing validation middleware on some critical endpoints

## Best Practices When Working on This Codebase

### Before Making Changes
1. Check for duplicate function definitions in controller files
2. Verify database schema matches controller expectations
3. Test both route implementations if duplicates exist
4. Check if endpoint has proper authentication/authorization

### When Adding New Features
1. Use `axiosInstance` for all API calls (not raw `fetch`)
2. Add proper authentication middleware to protected routes
3. Implement corresponding controller methods, not just routes
4. Test with both authenticated and unauthenticated users
5. Handle loading and error states consistently

### When Fixing Bugs
1. Check if issue exists in multiple places due to code duplication
2. Verify database schema before accessing fields
3. Test error handling paths, not just happy paths
4. Consider mobile and desktop views
5. Check for SSR/testing compatibility if using browser APIs

### Code Organization
1. Keep route logic minimal - delegate to controllers
2. Use services layer for complex business logic
3. Maintain consistent error response format
4. Document any known limitations or workarounds
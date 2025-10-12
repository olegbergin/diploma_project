1# GEMINI.md

This document provides a comprehensive overview of the diploma project, a full-stack business directory application. It is intended to be used as a guide for developers working on the project.

## Project Overview

This project is a full-stack business directory application built with a React frontend and a Node.js/Express backend. It allows users to search for businesses, book appointments, and leave reviews. Business owners can manage their profiles, services, and appointments. The application also includes an admin panel for managing users and businesses.

### Key Technologies

*   **Frontend:** React, Vite, React Router, Axios, CSS Modules
*   **Backend:** Node.js, Express, MySQL2, JWT
*   **Database:** MySQL

### Architecture

The project is structured as a monorepo with separate `frontend` and `backend` directories. The frontend is a single-page application (SPA) that communicates with the backend via a RESTful API. The backend is an Express.js application that connects to a MySQL database.

## Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   npm (v8 or higher)
*   MySQL (v8.0 or higher)

### Setup and Running the Project

1.  **Clone the repository.**
2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```
4.  **Set up the database:**
    *   Create a MySQL database named `project_db`.
    *   Import the database schema and data from `project_db_dump.sql` or `beauty_db_setup.sql`.
5.  **Create a `.env` file in the `backend` directory** with the following variables:
    ```
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_NAME=project_db
    JWT_SECRET=your_jwt_secret
    ```
6.  **Start the backend server:**
    ```bash
    cd backend
    npm start
    ```
7.  **Start the frontend development server:**
    ```bash
    cd frontend
    npm run dev
    ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3030`.

## Project Structure

```
diploma_project/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Request handlers
│   ├── routes/              # API routes
│   ├── src/app.js           # Application entry point
│   ├── dbSingleton.js       # Database connection
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── api/             # API client
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   └── main.jsx         # Main application
│   └── package.json
├── beauty_db_setup.sql      # Database schema and data
├── project_db_dump.sql      # Database schema and data
├── DESIGN_SYSTEM.md         # Design system documentation
└── README.md
```

## Backend

The backend is a Node.js/Express application that provides a RESTful API for the frontend.

### API Endpoints

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user.
*   `GET /api/users`: Get all users (admin only).
*   `GET /api/users/:id`: Get a user by ID.
*   `PUT /api/users/:id`: Update a user.
*   `DELETE /api/users/:id`: Delete a user.
*   `GET /api/businesses`: Get all businesses.
*   `GET /api/businesses/:id`: Get a business by ID.
*   `POST /api/businesses`: Create a new business.
*   `PUT /api/businesses/:id`: Update a business.
*   `DELETE /api/businesses/:id`: Delete a business.
*   `GET /api/appointments`: Get all appointments.
*   `POST /api/appointments`: Create a new appointment.
*   `GET /api/search?q=<query>`: Search for businesses.

### Database

The backend uses a MySQL database with the following main tables:

*   `users`: Stores user information.
*   `businesses`: Stores business information.
*   `services`: Stores information about services offered by businesses.
*   `appointments`: Stores appointment information.
*   `reviews`: Stores user reviews of businesses.

The database connection is managed by a singleton in `dbSingleton.js`.

## Frontend

The frontend is a React application built with Vite.

### Component Architecture

Components are organized by feature in the `src/components` directory. Each component has its own CSS module for styling.

### State Management

The application uses a combination of local component state and React Context for global state management. The `UserContext` stores information about the currently logged-in user.

### Routing

Routing is handled by React Router. Protected routes are used to restrict access to certain pages based on user authentication and roles.

## Design System

The project has a design system documented in `DESIGN_SYSTEM.md`. It defines the color palette, typography, spacing, and component styles used throughout the application. All new components should adhere to this design system.

## Development Conventions

### Coding Style

The project uses ESLint to enforce a consistent coding style. Please run the linter before committing any changes.

### Testing

The project does not currently have a testing suite. However, it is a goal to add unit and integration tests in the future.

### Commits

Commit messages should be clear and concise, and should describe the changes made.

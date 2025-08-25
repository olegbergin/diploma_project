
# Code Review and Refactoring Plan

This document provides a comprehensive analysis of the project and a plan for refactoring and improving the codebase.

## 1. Project Overview

The project is a full-stack business directory application with a React frontend and a Node.js/Express backend. The overall structure is a monorepo, which is a good choice for this type of project. The technology stack is modern and appropriate.

**Strengths:**
- Clear separation of frontend and backend concerns.
- Use of modern technologies like React, Node.js, and Express.
- RESTful API design is a good approach for communication.
- Use of CSS Modules in the frontend helps in scoping styles.

**Areas for Improvement:**
- Lack of a testing suite is a major risk.
- Inconsistent coding styles and practices.
- Potential security vulnerabilities (SQL injection).
- Complex components that could be simplified.
- No centralized state management on the frontend.

## 2. Backend Analysis

The backend is built with Node.js and Express, connecting to a MySQL database.

### 2.1. File-by-File Analysis

- **`dbSingleton.js`**:
    - **Purpose:** Manages the MySQL database connection.
    - **Review:** The singleton pattern is used, but the implementation can be improved. The `handleConnect` function is a good attempt at handling reconnections, but it can lead to unhandled promise rejections if not used carefully with the promise-based wrapper. The `getPromise()` method is a good addition for `async/await` support.
- **`routes/`**:
    - **Purpose:** Defines the API endpoints.
    - **Review:** The routes are generally well-structured. However, there's a mix of `async/await` and callback-based approaches. There's also a lack of consistent error handling and validation. Some routes have duplicated logic for finding or creating customers.
- **`controllers/`**:
    - **Purpose:** Contains the business logic for the API endpoints.
    - **Review:** The controllers are where the main logic resides. There's a mix of logic directly in the route handlers (`routes/*.js`) and in the controllers. This should be consistent. The `businessController.js` has placeholder functions that need to be implemented.
- **`src/app.js`**:
    - **Purpose:** The main application entry point.
    - **Review:** This file is simple and sets up the Express application, which is good.
- **`utils/caseTransform.js`**:
    - **Purpose:** Utility functions to convert between snake_case and camelCase.
    - **Review:** This is a good utility to have for maintaining consistent casing between the database and the frontend.

### 2.2. General Backend Review

- **Security:** The biggest concern is the potential for SQL injection. While `mysql2` supports prepared statements, they are not used consistently. All user-provided input in SQL queries must be parameterized.
- **Error Handling:** There is no centralized error handling middleware. Each route handles errors individually, leading to code duplication.
- **Validation:** Input validation is present in some routes but not all. It should be consistently applied to all incoming data. Using a library like `joi` or `express-validator` would be beneficial.
- **Code Consistency:** There's a mix of `async/await` and callbacks. The project should standardize on `async/await` for all asynchronous operations.

## 3. Frontend Analysis

The frontend is a React application built with Vite.

### 3.1. Component-by-Component Analysis

- **`App.jsx`**:
    - **Purpose:** The main application component, handling routing and authentication.
    - **Review:** The routing logic is complex and can be simplified. The authentication state is managed with `useState` and `localStorage`, which is acceptable for a small application but can become difficult to manage as the application grows.
- **`components/`**:
    - **Purpose:** Contains all the React components.
    - **Review:** The component structure is organized by feature, which is good. However, many components are large and handle too many responsibilities (e.g., `BusinessProfile.jsx`, `NewBusinessDashboard.jsx`). There's a lot of duplicated code, especially in the admin panel components.
- **`api/axiosInstance.js`**:
    - **Purpose:** A centralized place for configuring Axios.
    - **Review:** This is a good practice. The interceptors for adding the auth token are commented out but should be implemented.
- **`context/UserContext.jsx`**:
    - **Purpose:** Provides user information to the application.
    - **Review:** This is a good start for state management, but it's not fully utilized. The `App.jsx` component still manages its own `currentUser` state.
- **`hooks/useErrorHandler.js`**:
    - **Purpose:** A custom hook for handling errors.
    - **Review:** This is a great idea, but it's not used consistently throughout the application.

### 3.2. General Frontend Review

- **State Management:** The application relies heavily on local component state and prop drilling. For a more complex application, a centralized state management library like Redux or Zustand would be beneficial to manage global state like user authentication and business data.
- **Component Complexity:** Many components are doing too much. They fetch data, manage state, and render complex UI. These should be broken down into smaller, more focused components.
- **Styling:** The use of CSS Modules is good for preventing style conflicts. However, there are also global CSS files, which can lead to inconsistencies. The design system mentioned in `GEMINI.md` should be strictly enforced.
- **Code Duplication:** There is significant code duplication, especially in the admin panel components (`AdminAppointments.jsx`, `AdminBusinesses.jsx`, `AdminUsers.jsx`). This can be addressed by creating reusable components for tables, filters, and search bars.

## 4. Refactoring Plan

Here is a prioritized plan for refactoring the codebase.

### 4.1. High Priority (Security and Stability)

1.  **Backend: Prevent SQL Injection:**
    - **Action:** Refactor all database queries to use prepared statements with `?` placeholders for all user-provided input.
    - **Files to change:** All files in `routes/` and `controllers/` that interact with the database.
2.  **Backend: Centralized Error Handling:**
    - **Action:** Implement a centralized error handling middleware in `app.js` to catch and handle all errors consistently.
    - **Files to change:** `src/app.js`, and all files in `routes/`.
3.  **Frontend: Consistent Authentication Management:**
    - **Action:** Fully utilize the `UserContext` for managing user authentication state. Remove the local `currentUser` state from `App.jsx` and rely on the context.
    - **Files to change:** `App.jsx`, `context/UserContext.jsx`, and any component that uses the `currentUser` state.

### 4.2. Medium Priority (Code Quality and Readability)

1.  **Backend: Standardize on `async/await`:**
    - **Action:** Refactor all asynchronous operations to use `async/await` instead of callbacks.
    - **Files to change:** All files in `routes/` and `controllers/`.
2.  **Frontend: Simplify `App.jsx` Routing:**
    - **Action:** Create protected route components for different user roles (`CustomerRoute`, `BusinessRoute`, `AdminRoute`) to simplify the routing logic in `App.jsx`.
    - **Files to change:** `App.jsx`.
3.  **Frontend: Refactor Large Components:**
    - **Action:** Break down large components like `NewBusinessDashboard.jsx` and `BusinessProfile.jsx` into smaller, more manageable components.
    - **Files to change:** `components/BusinessDashboard/NewBusinessDashboard.jsx`, `components/BusinessProfile/BusinessProfile.jsx`.
4.  **Frontend: Reduce Code Duplication in Admin Panel:**
    - **Action:** Create reusable components for the table, search, and filter functionality in the admin panel.
    - **Files to change:** `components/AdminPanel/`.

### 4.3. Low Priority (Best Practices and Future-proofing)

1.  **Backend: Add Input Validation:**
    - **Action:** Use a library like `joi` or `express-validator` to add robust input validation to all API endpoints.
    - **Files to change:** All files in `routes/`.
2.  **Frontend: Introduce a State Management Library:**
    - **Action:** Consider introducing a state management library like Zustand or Redux Toolkit to manage global application state.
    - **Files to change:** This would be a larger refactoring effort affecting many components.
3.  **Project: Add a Testing Suite:**
    - **Action:** Introduce a testing framework like Jest for both frontend and backend. Add unit and integration tests for critical parts of the application.
    - **Files to change:** This would involve adding new test files throughout the project.

This refactoring plan will help improve the quality, security, and maintainability of the project. I recommend starting with the high-priority items to address the most critical issues first.

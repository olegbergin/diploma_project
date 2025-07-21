# Final Project Requirements: Full Stack with Node.js


### 2.3. Coding Standards & Structure
*   **Project Structure:** The project must be organized into logical files and folders as taught in the course. The frontend and backend must be in separate parent folders.
*   **Comments:** Comments only in english are mandatory. Every file should be commented, and every function should have a comment block explaining its purpose.
*   **Code Style:** Maintain proper code indentation and readability.
*   **Functions:** Functions should be used extensively. Each function should be short and have a single, clear purpose.
*   **File Size:** Keep your files short and focused.

## 3. Project Description

This is a full-stack project consisting of a **Backend (BE)**, a **Frontend (FE)**, and a **Database (DB)**. The project theme should be based on your diploma project. The application will manage data stored in a database, allowing users to view, add, and delete information, with all changes reflected in the database.

## 4. Technical Stack Requirements

*   **Backend:** You **must** use the **Express.js** framework.
*   **Database:** You **must** use **MySQL**. Do not store data in local files (e.g., `.json` files).
*   **Routing:** The backend must use the Express `Router` to separate logic into different files.


## 6. Frontend (FE) Application

The frontend will consist of 3-4 pages with a consistent, aesthetic, and responsive design. Effort must be invested in the UI/UX. You are not required to use React, but if you do, you must follow modern practices.

**Important:** You are **not allowed** to use a frontend routing library (like `react-router-dom`).

### 6.1. Login Page
*   This is the first page the user sees.
*   It must contain `username` and `password` input fields.
*   On "Login" button click, the input data must be validated and then sent to the server.
*   **Validation Rules:**
    *   **Password:** Must be 3-8 characters long, alphanumeric, and contain at least one letter and one number.
*   **Server Communication:**
    *   If the server returns an error (e.g., "User not found"), display a user-friendly message on the screen. **Using `alert()` is forbidden.**
    *   If the server confirms the user exists, navigate to the Main Page.
*   This page must also contain a "Register" button for new users.

### 6.2. Registration Page
*   This page can be combined with the Login page into a single component. If you do this, additional registration fields should be hidden when the component is in "login" mode (hint: use dynamic styles).
*   It must include the same fields and validations as the Login page.
*   **Server Communication:**
    *   If the server returns an error (e.g., "User already exists"), display a message and remain on the registration page.
    *   On successful registration, navigate the user to the Login page.

### 6.3. Main Page
*   This page will be displayed after a successful login.
*   It must include a consistent `header` and `footer`.
*   It must include navigation to other project pages (but not the Login/Registration pages).
*   It should contain a brief description of the project or information about the developers.

### 6.4. Data Management Page (search list)
*   This page must also include the `header`, `footer`, and navigation.
*   It will display a **list of items** related to your project's theme (e.g., a list of game characters).
*   This list must be fetched from the server when the page loads and should be sorted by a field of your choice.
*   Each item in the list must display at least 3 fields (including at least one string and one number).
*   The page must include a **form to add a new item** to the list, with at least 3 input fields corresponding to the list items.
*   The page must include a way to **delete or update** an existing record, based on a field of your choice.
*   When a form is submitted, the data is sent to the server. The data should also be updated on the frontend (not from `localStorage`) and displayed in its sorted order.

---

## 7. Backend (BE) API

The backend server will handle all requests from the frontend.

*   **Login Endpoint:**
    *   Receive `username` and `password`.
    *   Check the database to see if the user exists.
    *   Return a success message if the user exists and credentials are valid.
    *   Return an error message if the user does not exist.
*   **Registration Endpoint:**
    *   Receive new user data.
    *   Check the database to ensure the user does not already exist.
    *   If the user exists, return an error message.
    *   If the user does not exist, insert the new user into the database and return a success message.
*   **Data List Endpoint:**
    *   Handle a request from the frontend to fetch the list of project-specific data from the database.
*   **Add Record Endpoint:**
    *   Receive data for a new record from the frontend.
    *   Insert the new record into the appropriate database table.
*   **Update/Delete Record Endpoint:**
    *   Receive a request to update or delete a specific record.
    *   Perform the corresponding update or delete operation in the database.

**Good luck with your project!**
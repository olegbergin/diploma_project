# Refactoring Plan for Customer Dashboard

This document outlines the plan for refactoring the customer dashboard based on the user's request.

## 1. Fix `undefined` in URL

*   **Problem:** The customer dashboard URL appears as `http://localhost:3000/user/undefined/dashboard`.
*   **Reasoning:** The issue is in `frontend/src/components/UserDashboard/UserDashboard.jsx`. The component uses `user.userId` to fetch data, but the `user` object passed from `App.jsx` contains `user.id`. This discrepancy leads to an `undefined` value in the API request URL.
*   **Solution:** In `frontend/src/components/UserDashboard/UserDashboard.jsx`, change all instances of `user.userId` to `user.id`.

## 2. UI Cleanup

*   **Problem:** The user wants to remove the "Recent Activities" section and the "Book an Appointment" (קבע תור) button from the dashboard.
*   **Reasoning:** These elements are considered unnecessary and clutter the UI.
*   **Solution:** In `frontend/src/components/UserDashboard/UserDashboard.jsx`:
    *   Locate the JSX block for "פעילות אחרונה" (Recent Activities) and delete it.
    *   Locate the "קבע תור" button within the "פעולות מהירות" (Quick Actions) and delete it.

## 3. Favorites Page

*   **Problem:** The "Favorites" button on the dashboard should lead to a page listing the user's favorite businesses.
*   **Reasoning:** The dashboard currently has a "Favorites" button that links to `/favorites`, but the page itself doesn't exist. The backend seems to provide the necessary data, so a new frontend component is needed.
*   **Solution:**
    1.  **Create `FavoritesPage.jsx`:**
        *   Create a new component at `frontend/src/components/FavoritesPage/FavoritesPage.jsx`.
        *   This component will fetch the user's favorite businesses from the `/api/users/:id/favorites` endpoint (assuming this endpoint exists or can be created).
        *   It will display the list of favorite businesses, reusing the `BusinessCard` component for consistency.
    2.  **Create `FavoritesPage.module.css`:**
        *   Create a corresponding CSS module for styling the `FavoritesPage` component.
    3.  **Add Route in `App.jsx`:**
        *   In `frontend/src/App.jsx`, add a new route:
            ```jsx
            <Route
              path="/favorites"
              element={
                currentUser ? (
                  <FavoritesPage user={currentUser} />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            ```

## Summary of File Changes

*   **`frontend/src/components/UserDashboard/UserDashboard.jsx`:**
    *   Replace `user.userId` with `user.id`.
    *   Remove "Recent Activities" section.
    *   Remove "Book an Appointment" button.
*   **`frontend/src/components/FavoritesPage/FavoritesPage.jsx`:** (New file)
    *   Create component to display favorite businesses.
*   **`frontend/src/components/FavoritesPage/FavoritesPage.module.css`:** (New file)
    *   Add styles for the `FavoritesPage` component.
*   **`frontend/src/App.jsx`:**
    *   Add a new route for `/favorites`.

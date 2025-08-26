# Public Business Profile Page Development Plan

This document outlines the plan for creating a public-facing business profile page.

## 1. The `undefined` URL Problem

*   **Problem:** The URL for the business profile often contains `undefined` (e.g., `http://localhost:3000/business/undefined/profile`).
*   **Reasoning:** This happens when the business ID is not correctly passed to the component that renders the profile. The current routing setup in `App.jsx` for `/business-profile/:id` renders the `BusinessProfile` component without passing the `id` from the URL as a prop. The component likely tries to get the business ID from the logged-in user's context, which is incorrect for a public page that anyone can view.
*   **Solution:**
    1.  We will create a new, dedicated component called `BusinessPublicProfile.jsx` for the public view.
    2.  In `App.jsx`, we will create a new route `path="/business/:id"` that renders this new component.
    3.  The `BusinessPublicProfile.jsx` component will use the `useParams` hook from `react-router-dom` to get the business ID from the URL.

## 2. New Component: `BusinessPublicProfile.jsx`

*   **Task:** Create a new component to display all public information for a business.
*   **File:** `frontend/src/components/BusinessPublicProfile/BusinessPublicProfile.jsx` (new file)
*   **Implementation:**
    1.  Use `useParams` to get the business ID.
    2.  Use `useEffect` to fetch the business data from the API endpoint `GET /api/businesses/:id`.
    3.  The component will be structured into several sub-components for clarity.

## 3. Content and Structure of the Profile Page

The profile page will be composed of the following sections:

### 3.1. Profile Header
*   **Content:**
    *   Business Name (large heading)
    *   Business Category
    *   Average Rating (stars)
    *   "Add to Favorites" button (a heart icon)
*   **Component:** A new `ProfileHeader.jsx` component.

### 3.2. Contact Information & Actions
*   **Content:**
    *   Address (clickable, opens Google Maps)
    *   Phone Number (clickable, starts a call)
    *   Website (if available)
    *   "Book an Appointment" button (navigates to the booking page)
*   **Component:** A new `ContactInfo.jsx` component.

### 3.3. Image Gallery
*   **Task:** Display a gallery of portfolio images.
*   **Implementation:**
    *   For now, we will use placeholder images.
    *   The gallery will be a responsive grid of images.
    *   Clicking on an image could open it in a larger view (a feature for later).
    *   The API response for `GET /api/businesses/:id` should ideally include a list of image URLs. If not, we'll need a separate endpoint like `GET /api/businesses/:id/gallery`.

### 3.4. About Section
*   **Content:** The detailed business description.
*   **Implementation:** A simple section with a heading and a paragraph.

### 3.5. Services List
*   **Task:** Display the services offered by the business.
*   **Implementation:**
    1.  We will create a reusable `ServiceList.jsx` component.
    2.  This component will fetch services from `GET /api/businesses/:id/services`.
    3.  Each service item will display the service name, description, duration, and price.
    4.  Each service will have a "Book Now" button that navigates to the booking page for that specific service (`/booking/:businessId/:serviceId`).

### 3.6. Reviews Section
*   **Task:** Display user reviews.
*   **Implementation:**
    1.  We will create a `ReviewsList.jsx` component.
    2.  It will fetch reviews from a new API endpoint `GET /api/businesses/:id/reviews`. If this endpoint doesn't exist, we will need to create it in the backend.
    3.  Each review will show the user's name, rating, and comment.

## 4. API Interaction

*   **Primary Endpoint:** `GET /api/businesses/:id` - This should return the main business details (name, description, contact info, etc.) and preferably a list of image URLs for the gallery.
*   **Secondary Endpoints:**
    *   `GET /api/businesses/:id/services` - To get the list of services.
    *   `GET /api/businesses/:id/reviews` - To get user reviews. (Needs to be verified/created).
    *   `POST /api/users/:userId/favorites` - To add/remove a business from favorites. (Needs to be verified/created).

## 5. Routing

*   **File:** `frontend/src/App.jsx`
*   **Implementation:**
    *   A new route will be added to handle the public business profile:
      ```jsx
      <Route
        path="/business/:id"
        element={<BusinessPublicProfile user={currentUser} />}
      />
      ```
    *   The old `/business-profile/:id` route should be re-evaluated. It seems to be for the business owner to manage their profile. We should keep it for that purpose, but ensure it gets the business ID correctly. For now, the focus is on the new public page.

This plan provides a clear path to implementing a robust and user-friendly public business profile page.

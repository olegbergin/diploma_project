# Business Dashboard Refactoring Plan

This document outlines the plan for redesigning the business dashboard to better serve the needs of a business owner.

## 1. Core Principles

The new dashboard design will be based on the following priorities for a business owner:
1.  **Immediate Actions:** What needs my attention right now? (e.g., pending requests).
2.  **Today's Schedule:** What does my day look like?
3.  **Performance Overview:** How is my business doing? (KPIs).
4.  **Quick Access:** Can I easily perform my most common tasks?

## 2. Proposed Layout Redesign

The dashboard will be restructured into a more intuitive layout:

*   **Page Header:** Will contain the business name and the primary action buttons.
*   **KPIs Row:** A row of prominent cards displaying the most important Key Performance Indicators.
*   **Two-Column Layout:**
    *   **Left Column (Main Content):** Will focus on immediate and upcoming operational details (pending requests, today's schedule).
    *   **Right Column (Sidebar):** Will provide an overview of business performance and recent activity.

## 3. Detailed Component Breakdown

### 3.1. Header
*   **Content:**
    *   Welcome message: "שלום, {Business Name}"
    *   Primary Action Buttons:
        *   "➕ יצירת תור חדש" (Create New Appointment) - Opens a modal for manual booking.
        *   "📅 הצג לוח שנה" (View Calendar) - Navigates to the full calendar page.
        *   "✏️ עריכת פרופיל" (Edit Profile) - Navigates to the business profile management page.

### 3.2. KPI Cards
*   **Task:** Display high-level, crucial metrics.
*   **Implementation:** This will be a new component `KpiCards.jsx`.
*   **KPIs to display:**
    1.  **הכנסה החודש (Monthly Revenue):** Fetched from a new analytics endpoint.
    2.  **הכנסה השבוע (Weekly Revenue):** Calculated from appointment data.
    3.  **תורים ממתינים (Pending Appointments):** Count of appointments with 'pending' status.
    4.  **לקוחות חדשים (New Clients this Month):** Fetched from a new analytics endpoint.

### 3.3. Left Column (Operational View)

#### 3.3.1. Pending Requests
*   **Task:** Make pending requests the most prominent element.
*   **Implementation:**
    *   The existing logic for displaying pending appointments will be used.
    *   The UI will be enhanced to be more eye-catching.
    *   It will be placed at the top of the main content column.

#### 3.3.2. Today's Appointments
*   **Task:** Show a clear schedule for the current day.
*   **Implementation:**
    *   Use the existing logic for "Today's Appointments".
    *   The UI will be improved to look more like a timeline or a clear, ordered list.
    *   Each appointment will show: Time, Client Name, Service, Price, and Status.

### 3.4. Right Column (Performance & Activity)

#### 3.4.1. Performance Snapshot
*   **Task:** Show a simple chart of business performance.
*   **Implementation:**
    *   A new component `PerformanceChart.jsx`.
    *   It will display a bar chart of revenue for the last 7 days.
    *   This will require a new API endpoint to provide daily revenue data.
    *   I will use a simple CSS-based bar chart to avoid adding new library dependencies.

#### 3.4.2. Most Popular Services
*   **Task:** List the top-performing services.
*   **Implementation:**
    *   A new component `PopularServices.jsx`.
    *   It will display the top 3-5 services based on revenue or number of bookings.
    *   This data should be provided by the dashboard API endpoint.

#### 3.4.3. Recent Activity
*   **Task:** A feed of recent events.
*   **Implementation:**
    *   A new component `ActivityFeed.jsx`.
    *   The feed will show not just new appointments, but also cancellations and new reviews.
    *   This requires the dashboard API to provide a more comprehensive activity log.

## 4. API Requirements

The existing `GET /businesses/:businessId/dashboard` endpoint needs to be enhanced to provide the following additional data:

*   **`analytics` object:**
    *   `monthlyRevenue`
    *   `weeklyRevenue`
    *   `newClientsThisMonth`
    *   `dailyRevenueLast7Days`: An array of objects `{date, revenue}`.
    *   `servicePerformance`: An array of objects `{serviceName, revenue, bookingCount}`, sorted by revenue.
*   **`activityFeed` array:** A list of recent events (new appointment, cancellation, new review) with timestamps.

## 5. File Changes Summary

*   **`frontend/src/components/BusinessDashboard/NewBusinessDashboard.jsx`:**
    *   Major refactoring to implement the new two-column layout.
    *   Integrate the new sub-components (`KpiCards`, `PerformanceChart`, etc.).
    *   Update data fetching to use the enhanced API response.
*   **New Files:**
    *   `frontend/src/components/BusinessDashboard/KpiCards.jsx`
    *   `frontend/src/components/BusinessDashboard/PerformanceChart.jsx`
    *   `frontend/src/components/BusinessDashboard/PopularServices.jsx`
    *   `frontend/src/components/BusinessDashboard/ActivityFeed.jsx`
*   **`frontend/src/components/BusinessDashboard/NewBusinessDashboard.module.css`:**
    *   Significant changes to support the new layout and components.

This plan provides a clear roadmap for creating a more powerful and intuitive business dashboard.

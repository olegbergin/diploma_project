### Admin Dashboard Plan

#### **Goal:**
To provide administrators with the tools to monitor, manage, and maintain the health and integrity of the business directory platform.

---

### **P1: The Main Dashboard View (Highest Priority)**

This is the landing page for the admin. It should provide an "at-a-glance" overview of the entire system.

*   **1. Key Performance Indicator (KPI) Cards:**
    *   **Total Users:** A simple count of all registered users.
    *   **Total Businesses:** A count of all businesses in the system.
    *   **Pending Business Approvals:** The number of businesses awaiting admin approval. This is a critical action item.
    *   **Total Appointments:** A count of all appointments booked through the platform.
    *   **(Future) Total Revenue:** If the platform processes payments, this would show total revenue.

*   **2. Recent Activity Feed:**
    *   A live-updating or frequently refreshed list of the latest significant events.
    *   Examples: "New user registered: [username]", "New business submitted for approval: [business name]", "New review posted on [business name]".

*   **3. Quick Access / Action Queues:**
    *   A prominent section showing items that require immediate admin attention.
    *   **"Businesses Pending Approval":** A list of the 5 most recent businesses awaiting review, with a button to "View All".
    *   **"Recently Flagged Reviews":** If a flagging system is implemented, this would show reviews that users have marked as inappropriate.

---

### **P2: Core Management Sections (High Priority)**

These are the dedicated pages for managing the core entities of the platform. Each should be a separate tab or link from the main dashboard.

*   **1. User Management:**
    *   **View:** A searchable and filterable table of all users.
    *   **Columns:** User ID, Name, Email, Role (e.g., 'user', 'business_owner', 'admin'), Join Date.
    *   **Actions:**
        *   View user profile details.
        *   Edit user role.
        *   Suspend or delete a user.

*   **2. Business Management:**
    *   **View:** A searchable and filterable table of all businesses.
    *   **Tabs:** "All", "Approved", "Pending", "Rejected".
    *   **Columns:** Business ID, Business Name, Owner Name, Status (Approved, Pending, etc.), Creation Date.
    *   **Actions:**
        *   View business profile.
        *   Approve or reject a new business submission.
        *   Edit business details.
        *   Delete a business.

---

### **P3: Content & Analytics (Medium Priority)**

Tools for managing user-generated content and understanding platform trends.

*   **1. Review Management:**
    *   A searchable list of all reviews.
    *   Ability to filter by business, user, or rating.
    *   **Actions:** View review in context, delete inappropriate reviews.

*   **2. Analytics & Reporting:**
    *   **User Growth:** A chart showing new user registrations over time (e.g., last 30 days).
    *   **Business Growth:** A chart showing new business registrations over time.
    *   **Appointment Trends:** A chart showing the number of appointments booked daily or weekly.
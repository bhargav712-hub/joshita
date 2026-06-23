# ARIVA Platform 🚀

ARIVA is a comprehensive, multi-role web application built for a high-end, hyper-personalized private catering business. It manages everything from customer bookings and dietary tracking to live kitchen prep queues and on-site cart logistics.

The platform is designed around a single "Front Door" authentication system powered by **Supabase Role-Based Access Control (RBAC)**. Depending on who logs in, the application dynamically routes them to one of four highly specialized, secure portals.

## 🌟 The Four Portals

### 1. Admin Command Center (The Core)
Designed for central operations.
- **CRM:** VIP repeat customer tracking and global dietary/allergy notes management.
- **Team & Roles:** Instant user role upgrading (Customer -> Chef / Staff) without database interaction.
- **Logistics Board:** Live tracking of dispatched delivery carts and active cooking statuses.
- **Menu Management:** Dynamic CRUD operations for Intimate, Curated, and Signature package tiers.

### 2. Customer Dashboard
Designed for hosts to manage their events and grow into loyal customers.
- **My Bookings:** Beautiful tracking of upcoming and past private catering events.
- **BYOR (Bring Your Own Recipe):** A form for customers to submit cherished family recipes for chefs to review and recreate.
- **Loyalty & Profile:** Tracks Bronze/Silver/Gold tier status and permanently stores host dietary quirks.
- **Memory Gallery:** A beautiful masonry grid that instantly receives high-quality photos uploaded by the staff during the event.

### 3. Chef Dashboard
Designed for extreme back-of-house efficiency.
- **My Events:** Color-coded event queues with critical "Dietary Alerts" automatically pulled from the CRM.
- **Prep Queue:** Automated mise-en-place checklists and station assignments (Wok, Plating).
- **BYOR Trial Queue:** System for reviewing customer-submitted recipes, logging trial cook notes, scaling risks, and taste profiles for admin approval.
- **Signature Recipe Library:** A strictly locked-down, read-only vault of ARIVA's intellectual property, protected by a massive "CONFIDENTIAL" watermark.

### 4. Cart-Staff Dashboard
A mobile-first Web App specifically designed for one-thumb use by the delivery and on-site setup teams.
- **Active Dispatch:** Live mission target details, host contact info, and one-tap Google Maps navigation.
- **Checklists:** Standard operating procedures for "Loading Dock Pack-Out" and "Venue Setup Protocol".
- **Event Camera:** Enforces staff to capture 5+ high-quality photos of the food/setup, which instantly beam to the Customer's Memory Gallery.
- **Issue Reporting:** Giant one-tap buttons to ping the Admin Command Center during active emergencies (e.g., broken equipment, host escalation).

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email/Password)
- **Styling:** Custom CSS (The "ARIVA Design System" - utilizing dynamic Terracotta/Ink color palettes, glassmorphism, and responsive CSS Grid)
- **Icons:** Lucide React

---

## 🎨 The ARIVA Design System
We completely avoided generic UI libraries in favor of a bespoke, premium aesthetic tailored for a high-end catering brand:
- **Colors:** Deep Terracotta (`#b5532d`), rich Ink (`#1a1614`), and warm Bone (`#f4f1eb`).
- **Typography:** A sophisticated mix of elegant Serif for headers and clean Sans-serif for data.
- **Components:** Custom CSS classes (`dash-card`, `form-input`, `submit-btn`) built for immediate reuse across all 4 portals.

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhargav712-hub/joshita.git
   cd joshita
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Ensure your `.env` file is set up with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Test Accounts:**
   The application relies on Supabase Auth and the `profiles` table for RBAC. To access different portals, create an account, then manually update the `role` column in the Supabase `profiles` table to either `admin`, `chef`, or `cart_staff` (or use the Admin Team tab if you are already an admin).

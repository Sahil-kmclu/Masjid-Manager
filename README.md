# Masjid Manager - The Complete Digital Mosque Management Solution 🕌

**Version**: 2.0  
**Status**: Production Ready  
**Platform**: Web Application (React.js)

---

## 📋 Table of Contents

1.  [Executive Summary](#-executive-summary)
2.  [Why Masjid Manager?](#-why-masjid-manager)
3.  [Core Features & Modules](#-core-features--modules)
    *   [Real-time Dashboard Analytics](#1-real-time-dashboard-analytics)
    *   [Member Management System](#2-member-management-system)
    *   [Imam Salary & Payroll](#3-imam-salary--payroll)
    *   [Financial Accounting (Income & Expenses)](#4-financial-accounting-income--expenses)
    *   [Security & Administration](#5-security--administration)
4.  [Operational Workflows (User Manual)](#-operational-workflows-user-manual)
    *   [Managing Members & Collections](#scenario-1-managing-members--monthly-collections)
    *   [Processing Imam Salaries](#scenario-2-processing-imam-salaries)
    *   [Handling Security & Deletions](#scenario-3-handling-security--deletions)
5.  [Technical Architecture](#-technical-architecture)
6.  [Installation & Setup](#-installation--setup)
7.  [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)

---

## 🚀 Executive Summary

**Masjid Manager** is a sophisticated, purpose-built software solution designed to modernize the administrative and financial operations of Mosques (Masjids). In an era where transparency and efficiency are paramount, relying on paper registers and manual receipts is no longer sufficient.

This application bridges the gap by providing a **digital, secure, and Offline-first** platform. It allows Mosque committees to track every rupee collected, manage member subscriptions, ensure timely salary payments to Imams, and maintain a crystal-clear record of all expenses. Built with modern web technologies, it offers the power of an enterprise ERP system with the simplicity required for daily use by volunteers and staff.

---

## 💡 Why Masjid Manager?

Traditional management methods often suffer from:
*   **Loss of Data**: Physical registers can be lost, damaged, or degraded over time.
*   **Calculation Errors**: Manual totaling of monthly collections is prone to human error.
*   **Lack of Transparency**: It is difficult to instantly generate reports for the community.
*   **Communication Gaps**: Members often forget to pay dues, and sending manual reminders is tedious.

**Masjid Manager solves these problems by offering:**
1.  **Zero-Calculation Errors**: Automated totaling of all income, expenses, and pending dues.
2.  **Instant Receipts**: Generate professional PDF receipts instantly for every transaction.
3.  **WhatsApp Integration**: Send receipts and polite payment reminders directly to members' phones.
4.  **Data Privacy**: All data is stored locally on your device. No cloud servers, no data leaks.
5.  **Multi-Language Support**: Fully accessible in **English, Hindi, and Urdu** to serve diverse committees.

---

## 🌟 Core Features & Modules

### 1. Real-time Dashboard Analytics
The Dashboard is the command center of the application. It provides an immediate health check of the Mosque's finances.
*   **Financial Overview Cards**: Instantly see Total Collection vs. Expected Collection for the current month.
*   **Member Statistics**: Visual breakdown of Total Members, Paid Members, and Pending Members.
*   **Recent Activity Feed**: A live ticker showing the most recent transactions (payments, expenses, new members) to help administrators catch up quickly.
*   **Fiscal Year Tracking**: Keeps data organized by month and year for accurate historical reporting.

### 2. Member Management System
A complete CRM (Customer Relationship Management) system tailored for Mosque members.
*   **Digital Directory**: Store comprehensive details: Name, Phone, Address, Joining Date, and Monthly Commitment Amount.
*   **Smart Search**: Instantly find any member by typing part of their name or phone number.
*   **Payment History**: Click on any member to view their entire financial history since joining.
*   **Auto-Pending Calculation**: The system automatically calculates how many months a member is behind on payments based on their joining date and monthly commitment.
*   **One-Click Reminders**: Send a pre-formatted WhatsApp message to members with pending dues directly from their profile.

### 3. Imam Salary & Payroll
A dedicated module to ensure the Imam is paid on time and transparently.
*   **Salary Fund Collection**: Track specific contributions made by members towards the Imam's salary (separate from general maintenance funds).
*   **Imam Profiles**: Manage profiles for multiple Imams (e.g., Head Imam, Assistant Imam, Muezzin) with their specific salary structures.
*   **Payroll Processing**:
    *   Select the Imam and the Month (e.g., "Ramadan 2024").
    *   System records the payout and deducts it from the available funds.
    *   **PDF Receipts**: Generates a specialized "Salary Payment Receipt" that can be signed and stored digitally or physically.
    *   **WhatsApp Sharing**: Send the digital receipt directly to the Imam's phone for their records.

### 4. Financial Accounting (Income & Expenses)
Beyond member fees, a Mosque has dynamic financial flows.
*   **Mosque Income**: Record generic donations, Friday (Jumu'ah) collections, event fundraisers, or donation box openings.
*   **Expense Tracking**: detailed logging of operational costs:
    *   Electricity & Water Bills.
    *   Maintenance & Repairs.
    *   Cleaning Supplies.
    *   Event Costs.
*   **Balance Sheet**: The system maintains a running total of all inflows and outflows to show the current "Cash in Hand".

### 5. Security & Administration
Security is built into the workflow to prevent accidents and unauthorized changes.
*   **Simulated OTP Verification**: 
    *   **The Problem**: Accidental deletion of payment records can cause financial discrepancies.
    *   **The Solution**: Critical actions (Deleting a payment, Editing a member profile, Removing an expense) trigger an OTP challenge.
    *   **The Mechanism**: The system simulates an SMS sent to the registered mobile number of the entity (Member/Imam). The admin must enter this 4-digit code to proceed. This enforces a "Think Twice" policy.
*   **Recycle Bin**: Deleted items are not gone forever. They move to a holding area where they can be **Restored** if deleted by mistake, or **Permanently Deleted** for cleanup.
*   **Super Admin Settings**:
    *   Set the Admin Password.
    *   Customize Mosque Name and Address (for receipts).
    *   Switch Themes (Dark/Light Mode).

---

## 📖 Operational Workflows (User Manual)

### Scenario 1: Managing Members & Monthly Collections
**Goal**: Record a monthly fee from a member.
1.  Navigate to the **"Record Payment"** or **"Members"** tab.
2.  Search for the member.
3.  Click the **"View/Pay"** icon.
4.  Select the Month(s) they are paying for.
5.  Enter the Amount (System suggests the amount based on their commitment).
6.  Click **"Save"**.
7.  *Optional*: Click the **WhatsApp** icon to send them the receipt immediately.

### Scenario 2: Processing Imam Salaries
**Goal**: Pay the Imam for the month of October.
1.  Go to **"Pay Imam"**.
2.  Select the Imam from the dropdown.
3.  Select "October" from the month picker.
4.  Enter the Salary Amount.
5.  Click **"Save Payment"**.
6.  The system generates a **Salary Receipt**.
7.  Click **"Download PDF"** to save a copy for the audit file.
8.  Click **"Share"** to WhatsApp the receipt to the Imam.

### Scenario 3: Handling Security & Deletions
**Goal**: A payment was recorded on the wrong member and needs deletion.
1.  Locate the payment in the member's history.
2.  Click the **Delete (Trash)** icon.
3.  **Security Trigger**: A popup appears: *"Sending OTP to +91 98765xxxxx"*.
4.  An alert displays the code (e.g., "1234").
5.  Enter "1234" into the verification box.
6.  Confirm.
7.  The record is moved to the **Recycle Bin** (it can still be recovered if needed).

---

## 🏗 Technical Architecture

*   **Frontend Framework**: React.js (Vite) for lightning-fast performance.
*   **State Management**: React Hooks (useState, useEffect, useMemo) for responsive data handling.
*   **Data Persistence**: **LocalStorage API**.
    *   *Note*: The application runs entirely in the browser. It does not require a backend server or database connection. This ensures that the application can run **Offline** and is extremely fast.
    *   *Data Safety*: Since data is stored in the browser, clearing the browser cache will remove the data. Regular backups (coming soon) are recommended.
*   **PDF Generation**: `jsPDF` library for client-side rendering of high-quality receipts.
*   **Styling**: Custom CSS with CSS Variables for seamless Dark/Light mode switching.

---

## 💻 Installation & Setup

Since this is a web-based application, it can be hosted on any static file server or run locally.

### Prerequisites
*   Node.js (v14 or higher)
*   npm (Node Package Manager)

### Steps to Run Locally
1.  **Clone/Download the Repository**:
    ```bash
    git clone https://github.com/your-repo/masjid-manager.git
    cd masjid-manager
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**:
    Navigate to - https://masjid-manager.vercel.app/

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Do I need the internet to use this app?**  
A: No! Once the app is loaded, it works entirely offline. Internet is only required if you want to send WhatsApp messages.

**Q: Where is my data stored?**  
A: All data is stored securely in your browser's Local Storage on your specific device. We do not see or store your data on any cloud server.

**Q: What happens if I accidentally delete a member?**  
A: Don't panic! Go to the **Recycle Bin** tab. You will find the deleted member there and can restore them with one click.

**Q: Can I use this on my mobile phone?**  
A: Yes, the application is fully responsive and works perfectly on mobile browsers (Chrome, Safari, etc.).

**Q: How does the OTP work if I don't have an SMS plan?**  
A: The OTP is a "Simulated" security feature. It does not send a real SMS through a telecom network. It generates a code and displays it on the screen to ensure the user is physically present and confirming the action consciously.

---

**Developed with ❤️ to serve the Community.**


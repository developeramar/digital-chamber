# DIGITAL CHAMBER — COMPLETE SYSTEM DOCUMENTATION
**Project Name:** Digital Chamber (Advocate Case & Fee Management System)  
**Developer:** Google AI Studio Build (Gemini 3.5 Flash)  
**Date of Documentation:** July 10, 2026  

---

## 1. TECH STACK & SYSTEM ARCHITECTURE
Yeh application ek **Modern Full-Stack Client-Side Architecture** par aadharit hai jo real-time Cloud databases aur scalable authentication systems ka upyog karti hai.

| Component | Technology Used | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** with **TypeScript (TS)** | Modularity, high speed, strictly typed code safety, and single-page rendering. |
| **Build Tool / Bundler** | **Vite 6** | Ultra-fast development server (HMR) and optimized production compilation. |
| **Styling Engine** | **Tailwind CSS v4** | Rapid UI development with responsive utility classes and optimized css variables. |
| **Database** | **Google Cloud Firestore** | NoSQL Document Database supporting sub-second sync, offline capabilities, and high-performance querying. |
| **Authentication** | **Firebase Authentication** | Secure password hashing, token generation, session persistence, and user profiles. |
| **Animations** | **Motion (formerly Framer Motion)** | Fluid state transitions, modal fades, card slides, and micro-interactions. |
| **Iconography** | **Lucide React** | Consistent, modern, and lightweight vector vector icons. |

---

## 2. DATABASE SCHEMA (FIRESTORE)
Firestore mein user data security aur separation maintain karne ke liye **User-Based Isolation Pattern** follow kiya gaya hai. Har document mein ek `lawyerId` fields hai jo logged-in user ki `uid` ko target karti hai.

### A. Users Collection (`/users/{userId}`)
*Aapke advocates profiles details:*
* `userId` (String, Document ID): Unique ID from Firebase Auth.
* `email` (String): Logged in email.
* `displayName` (String): Advocate's full name.
* `createdAt` (Timestamp): Profile creation time.

### B. Clients Collection (`/clients/{clientId}`)
*Clients details registers:*
* `id` (String): Document auto ID.
* `lawyerId` (String): Owner Advocate's UID (Rules-secured).
* `name` (String): Client's Full Name.
* `phone` (String): Contact Number.
* `email` (String): Email address.
* `caseTitle` (String): Active court case topic.
* `caseNumber` (String): Legal case number (e.g., CN-2026/04).
* `courtName` (String): High Court, Session Court, etc.
* `caseType` (String): Civil, Criminal, Corporate, etc.
* `caseStatus` (String): "Active", "Pending", "Closed".
* `nextHearingDate` (String): Target date for next court appearance.
* `createdAt` (Timestamp): Client record registration timestamp.

### C. Hearings Collection (`/hearings/{hearingId}`)
*Case progress/hearings log:*
* `id` (String): Document ID.
* `lawyerId` (String): Owner Advocate's UID.
* `clientId` (String): Associated Client reference ID.
* `clientName` (String): Redundant name cache for fast rendering.
* `hearingDate` (String): Hearing date calendar.
* `purpose` (String): Argument, Evidence, Admission, etc.
* `status` (String): "Scheduled", "Completed", "Adjourned".
* `notes` (String): Judicial notes and task updates.

### D. Fee Payments Collection (`/feePayments/{paymentId}`)
*Financial management:*
* `id` (String): Document ID.
* `lawyerId` (String): Owner Advocate's UID.
* `clientId` (String): Associated Client reference ID.
* `clientName` (String): Client name for quick logs.
* `amount` (Number): Transacted amount in INR / local currency.
* `date` (String): Transaction execution date.
* `type` (String): "Advance", "Milestone Fee", "Retainer", "Final Settled".
* `paymentMethod` (String): Cash, UPI, Bank Transfer, Cheque.
* `notes` (String): Receipts and billing comments.

---

## 3. SECURITY ARCHITECTURE (`firestore.rules`)
Aapke data ko secure rakhne ke liye Firebase Security Rules ko configure aur deploy kiya gaya hai. Isse koi bhi user kisi doosre user ka private legal data access ya write nahi kar sakta:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Safety Net (Default Deny everything else)
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User profile rules
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Client rules: must be authenticated and only access own client records
    match /clients/{clientId} {
      allow read: if request.auth != null && resource.data.lawyerId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.lawyerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.lawyerId == request.auth.uid && request.resource.data.lawyerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.lawyerId == request.auth.uid;
    }
    
    // Hearing rules: must be authenticated and only access own hearing records
    match /hearings/{hearingId} {
      allow read: if request.auth != null && resource.data.lawyerId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.lawyerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.lawyerId == request.auth.uid && request.resource.data.lawyerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.lawyerId == request.auth.uid;
    }
    
    // Fee payment rules: must be authenticated and only access own payment records
    match /feePayments/{paymentId} {
      allow read: if request.auth != null && resource.data.lawyerId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.lawyerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.lawyerId == request.auth.uid && request.resource.data.lawyerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.lawyerId == request.auth.uid;
    }
  }
}
```

---

## 4. CORE FUNCTIONAL MODULES
Application mein custom state hooks aur persistent cloud syncing ke saath nimnlikhit views module-wise implement kiye gaye hain:

1. **Gatekeeper (Login/Signup Screen):**
   * Real Firebase User creation and email/password login flow.
   * Signup parameters user ke name to capture karke profile parameters data coordinate (`displayName`) store karte hain.
   * Fallback **Interactive Demo Mode** jo local memory state storage ke sath pure app ko without-internet sandbox mein bhi run karne deta hai.

2. **Advocate Hub (Dashboard):**
   * Welcome panel jo dynamic real name target karta hai (e.g., *Good Afternoon, Adv. Amar*).
   * Real-time metrics widgets: **Total Registered Clients**, **Upcoming Hearings**, and **Pending/Received Financials**.
   * Instant upcoming court schedules timeline carousel.

3. **Client Dossier (Add & List Clients):**
   * Filterable search systems with responsive modal drawer.
   * Full comprehensive database recording with Case Categories (Criminal, Civil, Family, etc.).
   * Click-to-expand details view for fast audits.

4. **Daily Register (Hearings Tracker):**
   * Calendar coordination representation to record, modify, or complete hearing progress.
   * Case connection filters to auto-inject clients names.

5. **Financial Ledger (Fee Payments Hub):**
   * Dynamic graphical charts showing cash inflows.
   * Transaction history filterable by payment forms (UPI, Cheque, Cash).

---

## 5. RECENT CRITICAL FIXES IMPLEMENTED
* **Authentication Error (`auth/operation-not-allowed` & `auth/invalid-credential`):** Login system mein safe exception triggers implement kiye gaye hain jo user ko direct guide karte hain ki Firebase Console mein "Email/Password Provider" kaise enable karein.
* **Database Sync Warning Error (`Missing or insufficient permissions`):** Rules file ko standard query parameters ke scalable standards ke mutabik configure karke deploy kiya gaya hai jo lawyer boundaries lock karti hain, aur UI alerts block karke user ko credentials fresh sync karne ke liye "Sign Out & Sign In" standard triggers suggest karti hain.
* **Advocate Name Resolution (Adv. Amar Dynamic Rendering):** Dashboard aur Navigation headers par direct user profiles ke data hooks mapping setup kiye gaye hain, taaki logged-in advocate ka proper dynamic sign-up name reflect ho. Email split matching backup logic lagaya hai taki custom names secure aur solid load hon.

---
*Documentation Compiled successfully. Code and functionality kept intact and untouched.*

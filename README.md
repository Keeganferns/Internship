# 🏨 Hotel Booking System – Goa Niwas, Goa Sadan & Goa Bhavan  

A **full-stack hotel/guest house booking system** built with **React + Firebase**. This project allows users to browse available rooms, make bookings, view receipts, and cancel reservations. It also includes an **Admin Dashboard** for managing bookings and a **chatbot assistant** to help users with FAQs and booking guidance.  

---

## ✨ Features  

### 👤 User Features  
- 🔑 **Authentication** – Signup/Login with Firebase Auth  
- 🏠 **Room Selection** – Browse rooms with availability status (Green = Available, Red = Occupied)  
- 📝 **Booking Flow** – Enter guest details, select dates, confirm booking  
- 📑 **Booking Receipts** – Auto-generated with GST calculations and PDF download option  
- 📅 **My Bookings** – Dashboard to view and manage personal bookings  
- ❌ **Cancellation System** – Request booking cancellations with real-time status updates  
- 💬 **Chatbot** – Interactive chatbot for FAQs, booking guidance, and quick replies  

### 🛠 Admin Features  
- 📊 **Admin Panel** – Manage all bookings in real-time  
- ✏️ **Edit/Delete** – Update or remove bookings  
- 🔍 **Search & Filter** – Filter by hotel, room type, date, or guest name  
- 📈 **Statistics** – Overview of active/cancelled bookings  
- ✅ **Cancellation Approval** – Approve/reject cancellation requests  

### 🎨 UI/UX Enhancements  
- 📱 Responsive design with TailwindCSS  
- 🔔 Toast notifications for success/error states  
- ⚡ Real-time updates with Firestore  
- 🖼 Room images & details pulled dynamically from Firestore  

---

## 🏗 Tech Stack  

- **Frontend:** React, TailwindCSS  
- **Backend:** Firebase (Auth, Firestore, Storage)  
- **State Management:** React Hooks & Context  
- **PDF Generation:** jsPDF  
- **Chatbot:** Custom React component + Firestore responses  

---

## 📂 Project Structure  

/src
├── components # Reusable UI components
│ ├── Chatbot.jsx
│ ├── RoomCard.jsx
│ ├── BookingForm.jsx
│ └── AdminDashboard.jsx
├── pages # Main pages (Home, Login, MyBookings, etc.)
├── firebase.js # Firebase configuration
├── App.jsx # Main app component
└── index.js # Entry point



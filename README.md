# BoxBook 🏏

A full-stack box cricket turf booking platform with a dark neon UI.

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js + Express, MongoDB + Mongoose
- **Auth**: JWT

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Backend

```bash
cd boxbook/backend
npm install
# Edit .env if needed (default: mongodb://localhost:27017/boxbook)
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd boxbook/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/boxbook
JWT_SECRET=your_secret_here
```

---

## Features

**Player**
- Browse & search turfs by city, price, name
- View turf details, images, slots
- Book a slot with date picker
- View & cancel bookings
- Leave reviews with star ratings
- WhatsApp contact button

**Turf Owner**
- Register as owner
- Add/edit/delete turfs with image upload
- Set time slots & amenities
- Dashboard with stats (revenue, bookings)
- View all incoming bookings

---

## API Endpoints

| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/turfs | — |
| GET | /api/turfs/:id | — |
| POST | /api/turfs | Owner |
| PUT | /api/turfs/:id | Owner |
| DELETE | /api/turfs/:id | Owner |
| POST | /api/bookings | Player |
| GET | /api/bookings/my | Player |
| GET | /api/bookings/owner | Owner |
| PUT | /api/bookings/:id/cancel | Player |
| GET | /api/bookings/slots | — |

# Deepthi Hospitals — Hospital Management Platform

A full stack hospital management system built with React and FastAPI. This project covers both the public facing hospital website and a complete HMS portal for admin, doctors and reception staff.

I built this to practice building real world applications that combine frontend UI, backend APIs, database management and payment integration together in one system.

---

## What this project does

**Public Website**
- Home page with hospital info, departments, doctors
- Book appointment with doctor selection, date/time slot picking and Razorpay payment
- Patient login and registration
- About, Contact, FAQ, Emergency pages

**Patient Dashboard**
- View and manage appointments
- Download appointment invoices
- View prescriptions and lab reports
- Billing page with Pay Now, retry payment and payment history
- Health profile management

**HMS Portal (Staff only)**
- Admin dashboard with stats, charts, alerts
- Manage patients, doctors, staff, beds, inventory
- Billing and lab management
- Doctor portal with patient queue, prescriptions, lab orders
- Reception portal with walk-in queue, registration, discharge

**Payments**
- Razorpay integration for appointment fees and bills
- Retry option if payment fails
- Webhook support for automatic payment confirmation
- Invoice download (print-ready HTML)

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS v4
- React Router DOM
- Zustand (state management with persist)
- React Hook Form + Zod (form validation)
- react-hot-toast

**Backend**
- FastAPI (Python)
- PostgreSQL 16
- SQLAlchemy (async)
- JWT authentication
- Razorpay Python SDK
- Loguru for logging

**Other**
- ngrok (for Razorpay webhook testing locally)
- Docker support (docker-compose.yml included)

---

## Project Structure

```
hospital-management-platform/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── pages/          # All pages (public, dashboard, HMS)
│   │   ├── components/     # Shared components
│   │   ├── layouts/        # Dashboard, HMS, Admin layouts
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API service layer
│   │   └── utils/          # Invoice generator etc
│   └── .env                # Frontend env vars
│
├── backend/                # FastAPI app
│   ├── app/
│   │   ├── routers/        # All API route handlers
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── core/           # Config, DB, security, deps
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Error handler, RBAC
│   └── .env                # Backend env vars
│
└── docker-compose.yml
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | arjun@deepthi.com | password123 |
| Admin | admin@deepthihospitals.com | admin123 |
| Doctor/Staff | staff@deepthihospitals.com | staff123 |
| Reception | reception@deepthihospitals.com | reception123 |

---

## Setup

See [STARTUP.md](STARTUP.md) for full setup instructions.

---

## Screenshots

> Frontend runs on `http://localhost:5173`  
> Backend API runs on `http://localhost:8000`  
> API docs at `http://localhost:8000/docs` (only in DEBUG mode)

---

## Notes

- This is a development/demo project. Not deployed to production yet.
- Razorpay is in test mode. Use test card `4111 1111 1111 1111` for payments.
- Some pages use mock data when backend is not connected.
- ngrok is used for webhook testing locally. URL changes on every restart.

---

Built by a CSE student learning full stack development. Feedback welcome.

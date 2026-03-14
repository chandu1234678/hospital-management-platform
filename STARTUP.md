# How to Run This Project

This file explains how to set up and run the project from scratch. I am writing this so anyone can follow it step by step without getting confused.

---

## Requirements

Make sure you have these installed before starting:

- Node.js (v18 or above)
- Python 3.11 or above
- PostgreSQL 16
- pgAdmin (optional but helpful)
- ngrok (for Razorpay webhook testing)

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/hospital-management-platform.git
cd hospital-management-platform
```

---

## Step 2 — Setup the Database

1. Open pgAdmin or psql
2. Create a new database called `deepthi_db`

```sql
CREATE DATABASE deepthi_db;
```

That's it. The backend will auto-create all tables when it starts.

---

## Step 3 — Setup the Backend

Go into the backend folder:

```bash
cd backend
```

Create a virtual environment and activate it:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the `.env` file. Copy from example:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/deepthi_db
SECRET_KEY=any-long-random-string-here
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
ALLOWED_ORIGINS=http://localhost:5173
```

> You can get Razorpay test keys from https://dashboard.razorpay.com → Settings → API Keys

Start the backend server:

```bash
venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at `http://localhost:8000`

You can check API docs at `http://localhost:8000/docs` (only works when DEBUG=True)

---

## Step 4 — Setup the Frontend

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Create the `.env` file:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
```

Start the dev server:

```bash
npm run dev
```

Frontend will be running at `http://localhost:5173`

---

## Step 5 — Create Demo Users (optional)

If you want to test with demo accounts, run this in psql or pgAdmin after the backend starts:

```sql
-- The backend auto-creates tables. You can register users via the /auth/register endpoint
-- or use the registration page on the frontend.
```

Or just register from the frontend at `http://localhost:5173/register`

---

## Step 6 — Setup ngrok for Razorpay Webhooks (optional)

This is only needed if you want to test Razorpay webhooks locally.

Download ngrok from https://ngrok.com/download and add your authtoken:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

Start the tunnel:

```bash
ngrok http 8000
```

Copy the HTTPS URL it gives you (something like `https://xxxx.ngrok-free.dev`)

Go to Razorpay Dashboard → Settings → Webhooks → Add webhook:
- URL: `https://xxxx.ngrok-free.dev/billing/webhook/razorpay`
- Events: check `payment.captured`
- Secret: same as your `RAZORPAY_KEY_SECRET`

> Note: ngrok free URL changes every time you restart it. You have to update the webhook URL in Razorpay dashboard each time.

---

## Step 7 — Build for Production

Frontend build:

```bash
cd frontend
npm run build
```

This creates a `dist/` folder. You can serve it with nginx or any static host.

Backend for production:

```bash
# Set DEBUG=False in .env first
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Common Errors

**Backend not starting**
- Check if PostgreSQL is running
- Check if DATABASE_URL in `.env` is correct
- Make sure venv is activated before running uvicorn

**Frontend showing blank page**
- Check if VITE_API_URL is set correctly in `.env`
- Make sure backend is running on port 8000

**Payment not working**
- Check if Razorpay keys are correct in both `.env` files
- Make sure you are using test keys (starts with `rzp_test_`)
- Use test card: `4111 1111 1111 1111`, any future expiry, any CVV

**CORS error in browser**
- Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`

---

## Ports Summary

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| ngrok dashboard | http://localhost:4040 |
| HMS Portal | http://localhost:5173/hms |

---

## HMS Portal Links

| Portal | URL |
|--------|-----|
| Staff Login | http://localhost:5173/hms |
| Admin Dashboard | http://localhost:5173/hms/admin/dashboard |
| Doctor Dashboard | http://localhost:5173/hms/doctor/dashboard |
| Reception Dashboard | http://localhost:5173/hms/reception/dashboard |

---

If something is not working feel free to open an issue or check the logs in `backend/logs/app.log`


venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
npm run dev
C:\Users\bc833\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 8000
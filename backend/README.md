# GanPass 2026 — FastAPI & MongoDB Production Backend

Official asynchronous REST & AI API engine for Mumbai Sarvajanik Ganeshotsav 2026 (134th Edition).

## 🚀 Tech Stack
- **Framework**: Python 3.10+, FastAPI (Async)
- **Database**: MongoDB (MongoDB Atlas in Production, Motor Async Driver)
- **Validation**: Pydantic v2
- **Auth**: JWT Bearer Tokens, Bcrypt Password Hashing, RBAC (Devotee & Admin roles)
- **Geo-Verification**: Haversine distance engine with 150m checkin radius constraint
- **Server-Side AI**: Google Gemini 2.5 API integration (`google-genai`)
- **Deployment Target**: Render, Railway, Google Cloud Run

---

## 📁 Directory Structure
```text
backend/
├── app/
│   ├── main.py              # FastAPI app & lifecycle setup
│   ├── core/
│   │   ├── config.py        # Settings & environment variables
│   │   ├── security.py      # JWT & Bcrypt password hashing
│   │   └── database.py      # Motor Async MongoDB connection & indexes
│   ├── models/              # Database models
│   ├── schemas/             # Pydantic schemas for request/response contracts
│   ├── api/
│   │   ├── deps.py          # Auth & DB dependency injectors
│   │   └── v1/              # API Route Handlers
│   │       ├── auth.py          # Devotee & Admin authentication
│   │       ├── mandals.py       # Mandal CRUD & geo discovery
│   │       ├── events.py        # Agman & Aarti event schedule
│   │       ├── announcements.py # Broadcast alerts & advisory banners
│   │       ├── featured.py      # Official Top 10 slot management
│   │       ├── stamps.py        # GPS Haversine verification & passport stamps
│   │       ├── settings.py      # Festival feature toggles & settings
│   │       ├── dashboard.py     # Real-time MongoDB metrics
│   │       ├── planner.py       # Itinerary optimization engine
│   │       └── ai.py            # Server-side Gemini AI darshan assistant
│   └── utils/
│       └── geo.py           # Haversine distance calculation
├── scripts/
│   └── seed.py              # Initial safe database seeding script
├── requirements.txt         # Production Python dependencies
├── .env.example             # Environment variable template
├── Procfile                 # Render / Heroku start command
└── render.yaml              # Render infrastructure blueprint
```

---

## 🛠 Local Setup & Running

1. **Create Virtual Environment & Install Dependencies**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Set your MongoDB Atlas URI in .env:
   # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ganpass
   ```

3. **Seed Initial Data**:
   ```bash
   python scripts/seed.py
   ```

4. **Start the API Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Interactive Swagger API Documentation**:
   - Open: `http://localhost:8000/docs` or `http://localhost:8000/redoc`

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Devotee Registration | Public |
| `POST` | `/api/auth/login` | Devotee Login | Public |
| `POST` | `/api/auth/admin/login` | Admin Officer Login | Public |
| `GET` | `/api/auth/me` | Current Profile & Stamps | Bearer Token |
| `GET` | `/api/mandals` | Explore Active Mandals | Public |
| `GET` | `/api/mandals/featured` | Top 10 Featured Mandals | Public |
| `GET` | `/api/mandals/{id}` | Mandal Profile + Nearby Mandals | Public |
| `POST` | `/api/mandals` | Create Mandal | Admin Bearer |
| `PUT` | `/api/mandals/{id}` | Update Mandal | Admin Bearer |
| `DELETE` | `/api/mandals/{id}` | Deactivate / Delete Mandal | Admin Bearer |
| `GET` | `/api/events` | List Events with Computed Status (`LIVE`/`UPCOMING`) | Public |
| `POST` | `/api/events` | Schedule Agman / Event | Admin Bearer |
| `GET` | `/api/announcements/active` | Active Broadcast Banners | Public |
| `GET` | `/api/featured/slots` | 10 Official Stamp Slots | Public / Admin |
| `PUT` | `/api/featured/slots` | Reorder / Assign Slots | Admin Bearer |
| `POST` | `/api/stamps/checkin` | **GPS Check-in** (150m Haversine Check) | Bearer Token |
| `GET` | `/api/stamps/progress` | Passport Stamp Progress (10 slots) | Optional Bearer |
| `GET` | `/api/admin/dashboard/stats` | Live MongoDB Aggregated Statistics | Admin Bearer |
| `GET` | `/api/settings` | Festival Configuration & Emergency Helpline | Public / Admin |
| `POST` | `/api/planner/generate` | Optimized Route Circuit Generator | Public |
| `POST` | `/api/ai/ask` | Server-Side Gemini AI Pilgrimage Guide | Public |

---

## ☁️ Deployment on Render

1. Connect your GitHub repository to [Render](https://render.com).
2. Select **Web Service** with environment **Python**.
3. Set **Root Directory** to `backend` (or use the root `render.yaml`).
4. Set **Build Command**: `pip install -r requirements.txt`.
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add environment variable `MONGODB_URI` pointing to your MongoDB Atlas cluster.
7. Run `python scripts/seed.py` once to seed the database.

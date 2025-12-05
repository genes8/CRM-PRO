# CRM Pro Dashboard

A professional CRM application with an elegant design, built with FastAPI and React Router.

## Features

- **Google OAuth Authentication** with HTTP-Only Cookies for security
- **Dashboard** - Overview of contacts, deals, tasks, and analytics
- **Contacts Management** - Full CRUD for contacts with status tracking
- **Deals Pipeline** - Kanban-style pipeline view and list view
- **Tasks** - Task management with priorities, types, and due dates
- **Analytics** - Charts and metrics for business insights
- **Settings** - Profile, notifications, security, and appearance settings

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **SQLAlchemy** - ORM for database operations
- **Google OAuth** - Authentication via Google
- **HTTP-Only Cookies** - Secure session management

### Frontend
- **React Router v7** - Full-stack React framework
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon set
- **Recharts** - Charting library for analytics

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google OAuth credentials

### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
7. Copy Client ID and Client Secret

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
crm-dashboard/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── auth.py         # Authentication logic
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   ├── main.py         # FastAPI app
│   │   └── seed_data.py    # Example data
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (Auth)
│   │   ├── lib/            # Utilities and API
│   │   └── routes/         # Page components
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication status

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/{id}` - Get contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Deals
- `GET /api/deals` - List deals
- `POST /api/deals` - Create deal
- `GET /api/deals/{id}` - Get deal
- `PUT /api/deals/{id}` - Update deal
- `DELETE /api/deals/{id}` - Delete deal

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Mark task complete

### Analytics
- `GET /api/analytics` - Get analytics data

### Seed Data
- `POST /api/seed` - Load example data

## Security Features

- **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies, preventing XSS attacks
- **CORS Protection**: Configured to only allow requests from the frontend origin
- **JWT Tokens**: Secure token-based authentication
- **Google OAuth**: Leverages Google's secure authentication infrastructure

## License

MIT

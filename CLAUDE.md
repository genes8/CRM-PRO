# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRM Pro Dashboard - A full-stack CRM application with FastAPI backend and React Router v7 frontend. Features Google OAuth authentication, contacts/deals/tasks management, and analytics.

## Development Commands

### Backend (Python/FastAPI)
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn app.main:app --reload --port 8000  # Run dev server
```

### Frontend (React Router v7)
```bash
cd frontend
npm run dev        # Development server (port 5173)
npm run build      # Production build
npm run typecheck  # TypeScript type checking
```

## Architecture

### Backend (`backend/`)
- **FastAPI** application with SQLite database
- Entry point: `app/main.py` - initializes app, CORS, and routers
- `app/routers/` - API endpoint handlers (auth, contacts, deals, tasks, analytics, users)
- `app/models/` - SQLAlchemy ORM models (user, contact, deal, task)
- `app/schemas/` - Pydantic validation schemas
- `app/auth.py` - JWT authentication with Google OAuth
- `app/database.py` - Database connection and session management
- Database tables auto-created on startup via `Base.metadata.create_all()`

### Frontend (`frontend/`)
- **React Router v7** with file-based routing
- `app/routes.ts` - Route configuration (uses layout pattern with AppLayout)
- `app/routes/` - Page components (dashboard, contacts, deals, tasks, analytics, settings)
- `app/components/ui/` - Reusable UI components (Button, Card, Modal, etc.)
- `app/components/layout/` - AppLayout, Header, Sidebar
- `app/context/AuthContext.tsx` - Authentication state management
- `app/lib/api.ts` - Axios-based API client
- `app/lib/types.ts` - TypeScript type definitions

### API Communication
- Frontend proxies to backend at `http://localhost:8000`
- All API routes prefixed with `/api`
- Authentication uses HTTP-only cookies with JWT tokens

## Environment Setup
Backend requires `.env` file with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth.

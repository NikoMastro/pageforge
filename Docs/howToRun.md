# Local Development Setup

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for backend/frontend dev)

## Two Options for Running Backend

### Option 1: Full Docker Setup (Backend + Firestore)

```bash
docker compose up
```
The backend is started in docker, so, this is best for frontend development.

### Option 2: Host Backend + Dockerized Firestore

```bash
# Terminal 1: Start Firestore emulator
docker compose -f docker-compose.emulator-only.yml up

# Terminal 2: Run backend on host
cd backend
npm install
export NODE_ENV=development
export PORT=8080
export FIRESTORE_EMULATOR_HOST=localhost:8082
export FIRESTORE_DATABASE_ID="(default)"
export GCP_PROJECT_ID=pageforge-local
export BACKEND_URL=http://localhost:8080
npm run dev
```
Here you start the backend separatly, so best for backend development.

## Useful

```bash
# Run in background
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Shell into backend container
docker compose exec backend sh
```

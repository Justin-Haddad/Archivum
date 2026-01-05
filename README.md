# Archivum

A media tracking and archive management application.

## Project Structure

```
.
├── frontend/          # React/Vite frontend application
│   ├── src/          # React components, pages, contexts
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
├── backend/          # Backend server (CORS proxy)
│   ├── proxy-server.js
│   └── package.json  # Backend dependencies
│
└── package.json      # Root package.json with workspace scripts
```

## Setup

### Install Dependencies

From the root directory:

```bash
npm run install:all
```

Or install individually:

```bash
cd frontend && npm install
cd ../backend && npm install
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories with the necessary environment variables.

### Development

**Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

**Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

### Building

Build the frontend:

```bash
npm run build:frontend
# or
cd frontend && npm run build
```

## Documentation

See the various `.md` files in the root directory for setup guides and documentation.

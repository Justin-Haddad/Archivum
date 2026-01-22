# Archivum

A personal media tracking app to keep all your movies, TV shows, books, and games in one place. Track what you've watched, rate your favorites, and discover new content.

## Features

- **Multi-Media Support**: Track movies, TV shows, books, and video games
- **Personal Library**: Build your own collection with ratings and notes
- **Discovery**: Browse trending content and search across multiple APIs
- **User Profiles**: Customize your profile and connect with friends
- **Rating System**: Rate everything on a 1-10 scale
- **Backlog Tracking**: Mark items you want to watch/read/play later

## Tech Stack

- **Frontend**: React 19, Vite, React Router
- **Backend**: Supabase (PostgreSQL + Authentication)
- **APIs**: TMDB (movies/TV), Open Library (books), IGDB (games)
- **Styling**: Custom CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- API keys for TMDB and IGDB (optional - some features won't work without them)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/archivum.git
cd archivum
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up environment variables

Create a `.env` file in the `frontend/` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_IGDB_CLIENT_ID=your_igdb_client_id
VITE_IGDB_CLIENT_SECRET=your_igdb_client_secret
VITE_CORS_PROXY=http://localhost:3001/proxy
```

4. Set up the database

Run the SQL in `create_library_table.sql` in your Supabase SQL editor. See `DATABASE_SCHEMA.md` for more details on the database structure.

5. Start the development servers

Terminal 1 (Proxy server for IGDB):
```bash
cd backend
npm install
node proxy-server.js
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

The app will be available at `http://localhost:5173`

## Project Structure

```
.
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context for state management
│   │   ├── pages/         # Page components
│   │   └── lib/           # API and utility functions
│   └── package.json
├── backend/           # CORS proxy server for IGDB API
│   └── proxy-server.js
└── package.json      # Root workspace configuration
```

## Development

- Frontend dev server: `npm run dev:frontend`
- Backend proxy: `cd backend && node proxy-server.js`
- Build for production: `npm run build:frontend`

## Current Status

Still in active development. Core features are working but I'm continuing to add more functionality and improvements.

## License

MIT

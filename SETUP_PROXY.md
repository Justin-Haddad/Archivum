# How to Set Up the IGDB Proxy Server

## The Problem
IGDB API blocks direct browser requests due to CORS. You need to run a local proxy server.

## Quick Setup Steps:

### 1. Install Dependencies
```bash
npm install express cors dotenv --save-dev
```

### 2. Start the Proxy Server
Open a **new terminal window** and run:
```bash
node proxy-server.js
```

You should see:
```
CORS proxy server running on http://localhost:3001
```

**Keep this terminal open** - the proxy server needs to keep running.

### 3. Restart Your Dev Server
In your main terminal (where you run `npm run dev`):
- Stop it (Ctrl+C)
- Start it again: `npm run dev`

### 4. Try Searching for Games
Now when you search for games, it should work!

## Troubleshooting

### Error: "Cannot find module 'express'"
- Run: `npm install express cors dotenv --save-dev`

### Error: "Failed to connect to proxy server"
- Make sure the proxy server is running (step 2)
- Check that you see "CORS proxy server running on http://localhost:3001"
- Make sure your `.env` has: `VITE_CORS_PROXY=http://localhost:3001/proxy`

### Still getting CORS errors?
- Make sure you restarted your dev server after adding the proxy URL to `.env`
- Check the browser console for more detailed error messages
- Verify the proxy server is still running

## Running Both Servers

You'll need **two terminal windows**:
1. **Terminal 1**: Run `node proxy-server.js` (proxy server)
2. **Terminal 2**: Run `npm run dev` (your React app)

Both need to be running at the same time!


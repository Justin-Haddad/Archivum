// Simple CORS proxy server for IGDB API
// Run with: node proxy-server.js
// Then update VITE_CORS_PROXY in .env to: http://localhost:3001/proxy?url=

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'POST', headers = {}, body } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.text();
    const jsonData = JSON.parse(data);
    
    res.json(jsonData);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running on http://localhost:${PORT}`);
  console.log(`Update VITE_CORS_PROXY in .env to: http://localhost:${PORT}/proxy`);
});


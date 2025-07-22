const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files (HTML, JS, etc.)
app.use(express.static(__dirname));

// Proxy: Fetch external URLs (avoid CORS when reading web articles)
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const response = await axios.get(url, { timeout: 10000 });
    res.send(response.data);
  } catch (err) {
    res.status(500).send(`Error fetching URL: ${err.message}`);
  }
});

// Proxy: Forward LLM requests to LM Studio (to bypass browser CORS)
app.post('/v1/chat/completions', express.json(), async (req, res) => {
  try {
    const lmStudioRes = await axios.post('http://localhost:1234/v1/chat/completions', req.body, {
      headers: req.headers,
    });
    res.json(lmStudioRes.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`💡 Make sure LM Studio is running at http://localhost:1234`);
  console.log(`🚀 Open your browser to: http://localhost:${PORT}`);
});
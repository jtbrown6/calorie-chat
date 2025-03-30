/**
 * Simple Express server for data persistence in CalorieChat container
 * 
 * This server provides endpoints to save and load localStorage data
 * to/from a Docker volume for persistence across container restarts.
 */

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = '/app/data';
const DATA_FILE = path.join(DATA_DIR, 'calorieChat.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API endpoint to save data
app.post('/api/save-data', (req, res) => {
  try {
    const data = req.body.data;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    fs.writeFileSync(DATA_FILE, data);
    console.log(`Data saved to ${DATA_FILE}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// API endpoint to load data
app.get('/api/load-data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'No saved data found' });
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    console.log(`Data loaded from ${DATA_FILE}`);
    res.status(200).json({ calorieChat: data });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Persistence server running on port ${PORT}`);
});

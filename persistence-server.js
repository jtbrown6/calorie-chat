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
    // Expect the raw state object directly in the body
    const stateData = req.body; 
    if (!stateData || typeof stateData !== 'object') {
      console.error('Invalid data received for saving:', stateData);
      return res.status(400).json({ error: 'Invalid data provided. Expected state object.' });
    }

    // Stringify the object once before writing
    const dataString = JSON.stringify(stateData, null, 2); // Pretty print for readability
    fs.writeFileSync(DATA_FILE, dataString);
    console.log(`Data successfully saved to ${DATA_FILE}. Size: ${dataString.length} bytes.`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error saving data to ${DATA_FILE}:`, error);
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

// API endpoint to load data
app.get('/api/load-data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log(`Data file not found: ${DATA_FILE}. Returning 404.`);
      return res.status(404).json({ error: 'No saved data found' });
    }

    const dataString = fs.readFileSync(DATA_FILE, 'utf8');
    console.log(`Read ${dataString.length} bytes from ${DATA_FILE}. Attempting to parse.`);
    
    // Parse the JSON string into an object
    const parsedData = JSON.parse(dataString); 
    console.log(`Data successfully parsed from ${DATA_FILE}.`);
    
    // Send the parsed object directly
    res.status(200).json(parsedData); 
  } catch (error) {
    console.error(`Error loading or parsing data from ${DATA_FILE}:`, error);
    // If parsing fails or other error occurs, return 500
    res.status(500).json({ error: 'Failed to load or parse data', details: error.message });
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

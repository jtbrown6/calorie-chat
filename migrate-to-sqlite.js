/**
 * Migration script to convert CalorieChat JSON data to SQLite database
 * 
 * This script should be executed once to migrate existing data from the JSON file
 * to the new SQLite database format.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001';
// Handle different environments - Docker vs local development
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/app/data' : './data';
const JSON_FILE = path.join(DATA_DIR, 'calorieChat.json');

async function migrateToSqlite() {
  try {
    console.log('Starting migration from JSON to SQLite...');
    
    // Check if the SQLite migration endpoint is available
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
      if (!healthResponse.data.status === 'OK') {
        throw new Error('Server health check failed');
      }
      
      if (healthResponse.data.database !== 'SQLite') {
        console.log('Warning: The server does not appear to be using SQLite. Make sure the new db-persistence-server.js is running.');
      }
      
      console.log('Server is healthy and ready for migration.');
    } catch (error) {
      console.error('Error connecting to persistence server:', error.message);
      console.log('Make sure the db-persistence-server.js is running on port 3001.');
      return;
    }
    
    // Perform the migration
    try {
      const migrationResponse = await axios.post(`${API_BASE_URL}/api/migrate-json`);
      console.log('Migration result:', migrationResponse.data);
      
      if (migrationResponse.data.success) {
        console.log('✅ Migration completed successfully!');
        console.log(`The original JSON file has been backed up to ${migrationResponse.data.backupFile}`);
      } else {
        console.error('❌ Migration failed:', migrationResponse.data.error);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('No JSON file found for migration. If this is a fresh install, this is normal.');
      } else {
        console.error('Error during migration process:', error.message);
        if (error.response) {
          console.error('Server response:', error.response.data);
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error during migration:', error);
  }
}

// Run the migration
migrateToSqlite();

/**
 * This script adds data persistence functionality to the CalorieChat application
 * by saving localStorage data to a persistent volume in the Docker container.
 * 
 * Include this script in your index.html before the application scripts.
 */

// API endpoint URLs
const SAVE_DATA_URL = '/api/save-data';
const LOAD_DATA_URL = '/api/load-data';
const APP_STORAGE_KEY = 'calorieChat';

// Intercept localStorage setItem to save data to volume
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  // Call the original implementation
  originalSetItem.apply(this, arguments);
  
  // If this is our application data, save it to the volume
  if (key === APP_STORAGE_KEY) {
    try {
      console.log('Persisting data to volume');
      
      // Make API call to persistence server
      fetch(SAVE_DATA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: value })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data successfully saved to volume');
      })
      .catch(error => {
        console.error('Error saving data to volume:', error);
      });
    } catch (error) {
      console.error('Error in localStorage sync:', error);
    }
  }
};

// Initialize localStorage from volume data on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Checking for persisted data in volume');
  
  fetch(LOAD_DATA_URL)
    .then(response => {
      if (response.status === 404) {
        // No saved data found, that's okay
        console.log('No previously saved data found in volume');
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    })
    .then(data => {
      if (data && data.calorieChat) {
        // Don't use our overridden setItem to avoid a loop
        originalSetItem.call(localStorage, APP_STORAGE_KEY, data.calorieChat);
        console.log('Data successfully loaded from volume');
        
        // Reload the page to ensure app initializes with the loaded data
        // Only do this if we actually loaded data
        window.location.reload();
      }
    })
    .catch(error => {
      console.error('Error loading data from volume:', error);
    });
});

// Add a method to force save current data (can be called programmatically)
window.forceSaveCalorieData = function() {
  const data = localStorage.getItem(APP_STORAGE_KEY);
  if (data) {
    fetch(SAVE_DATA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Data manually saved to volume');
    })
    .catch(error => {
      console.error('Error in manual save:', error);
    });
  }
};

// Add a periodic save every 5 minutes as a backup
setInterval(() => {
  window.forceSaveCalorieData();
}, 5 * 60 * 1000);

console.log('CalorieChat persistence system initialized');

/**
 * SQLite-based Express server for data persistence in CalorieChat
 * 
 * This server provides endpoints to save and load data to/from a SQLite database
 * for persistence across container restarts and device syncing.
 */

const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001; // Changed to 3001 to avoid conflict with React's default port 3000
// Handle different environments - Docker vs local development
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/app/data' : './data';
const DB_FILE = path.join(DATA_DIR, 'calorieChat.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Initialize database
let db;
try {
  db = new Database(DB_FILE);
  console.log(`Connected to SQLite database at ${DB_FILE}`);
} catch (error) {
  console.error(`Failed to connect to database: ${error.message}`);
  process.exit(1);
}

// Create tables if they don't exist
function initDatabase() {
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      targetCalories INTEGER,
      proteinRatio INTEGER,
      carbsRatio INTEGER,
      fatRatio INTEGER,
      theme TEXT,
      lastUpdated TEXT
    )
  `);
  
  // Custom foods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_foods (
      id TEXT PRIMARY KEY,
      name TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      servingSize TEXT,
      createdAt TEXT,
      isCustom INTEGER,
      lastUpdated TEXT
    )
  `);
  
  // Daily entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_entries (
      id TEXT PRIMARY KEY,
      date TEXT,
      totalCalories REAL,
      totalProtein REAL,
      totalCarbs REAL,
      totalFat REAL,
      lastUpdated TEXT
    )
  `);
  
  // Consumed foods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS consumed_foods (
      foodId TEXT PRIMARY KEY,
      dailyEntryId TEXT,
      name TEXT,
      servingSize TEXT,
      quantity REAL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      mealType TEXT,
      time TEXT,
      lastUpdated TEXT,
      FOREIGN KEY (dailyEntryId) REFERENCES daily_entries(id)
    )
  `);
  
  // Chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      date TEXT,
      role TEXT,
      content TEXT,
      timestamp TEXT
    )
  `);

  console.log('Database tables initialized');
}

// Initialize database on server start
initDatabase();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Get all data
app.get('/api/load-data', (req, res) => {
  try {
    // Fetch all data from tables and structure it like the app state
    // Settings
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {
      targetCalories: 2000,
      proteinRatio: 30,
      carbsRatio: 40,
      fatRatio: 30,
      theme: 'light'
    };
    
    // Custom foods
    const customFoods = db.prepare('SELECT * FROM custom_foods').all() || [];
    
    // Daily entries with their consumed foods
    const dailyEntries = db.prepare('SELECT * FROM daily_entries').all() || [];
    for (const entry of dailyEntries) {
      entry.foods = db.prepare('SELECT * FROM consumed_foods WHERE dailyEntryId = ?')
        .all(entry.id) || [];
    }
    
    // Chat history organized by date
    const chatMessages = db.prepare('SELECT * FROM chat_messages ORDER BY timestamp').all() || [];
    const chatHistory = {};
    for (const msg of chatMessages) {
      if (!chatHistory[msg.date]) {
        chatHistory[msg.date] = [];
      }
      chatHistory[msg.date].push({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      });
    }
    
    const appState = {
      settings: {
        targetCalories: settings.targetCalories || 2000,
        macroRatio: {
          protein: settings.proteinRatio || 30,
          carbs: settings.carbsRatio || 40,
          fat: settings.fatRatio || 30
        },
        theme: settings.theme || 'light'
      },
      customFoods: customFoods.map(food => ({
        ...food,
        isCustom: Boolean(food.isCustom)
      })),
      dailyEntries,
      chatHistory,
      currentDate: new Date().toISOString().split('T')[0] // Today's date
    };
    
    res.status(200).json(appState);
    const now = new Date().toISOString();
    console.log(`[${now}] Data successfully loaded from database. Entries: ${dailyEntries.length} daily entries, ${customFoods.length} custom foods`);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Save all data
app.post('/api/save-data', (req, res) => {
  try {
    // Expect the raw state object directly in the body
    const appState = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    if (!appState || typeof appState !== 'object') {
      console.error('Invalid data received for saving:', appState);
      return res.status(400).json({ error: 'Invalid data provided. Expected state object.' });
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Update settings
      const settings = appState.settings;
      if (settings) {
        db.prepare(`
          INSERT OR REPLACE INTO settings (
            id, targetCalories, proteinRatio, carbsRatio, fatRatio, theme, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          1,
          settings.targetCalories,
          settings.macroRatio.protein,
          settings.macroRatio.carbs,
          settings.macroRatio.fat,
          settings.theme,
          new Date().toISOString()
        );
      }
      
      // Clear and re-insert custom foods
      db.prepare('DELETE FROM custom_foods').run();
      if (appState.customFoods && appState.customFoods.length > 0) {
        const insertCustomFood = db.prepare(`
          INSERT INTO custom_foods (
            id, name, calories, protein, carbs, fat, servingSize, createdAt, isCustom, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const food of appState.customFoods) {
          insertCustomFood.run(
            food.id,
            food.name,
            food.calories,
            food.protein,
            food.carbs,
            food.fat,
            food.servingSize,
            food.createdAt,
            food.isCustom ? 1 : 0,
            new Date().toISOString()
          );
        }
      }
      
      // Clear and re-insert daily entries and consumed foods
      db.prepare('DELETE FROM consumed_foods').run();
      db.prepare('DELETE FROM daily_entries').run();
      
      if (appState.dailyEntries && appState.dailyEntries.length > 0) {
        const insertDailyEntry = db.prepare(`
          INSERT INTO daily_entries (
            id, date, totalCalories, totalProtein, totalCarbs, totalFat, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertConsumedFood = db.prepare(`
          INSERT INTO consumed_foods (
            foodId, dailyEntryId, name, servingSize, quantity, calories, protein,
            carbs, fat, mealType, time, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const entry of appState.dailyEntries) {
          insertDailyEntry.run(
            entry.id,
            entry.date,
            entry.totalCalories,
            entry.totalProtein,
            entry.totalCarbs,
            entry.totalFat,
            new Date().toISOString()
          );
          
          if (entry.foods && entry.foods.length > 0) {
            for (const food of entry.foods) {
              insertConsumedFood.run(
                food.foodId,
                entry.id,
                food.name,
                food.servingSize,
                food.quantity,
                food.calories,
                food.protein,
                food.carbs,
                food.fat,
                food.mealType,
                food.time,
                new Date().toISOString()
              );
            }
          }
        }
      }
      
      // Clear and re-insert chat messages
      db.prepare('DELETE FROM chat_messages').run();
      
      if (appState.chatHistory) {
        const insertChatMessage = db.prepare(`
          INSERT INTO chat_messages (
            id, date, role, content, timestamp
          ) VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const [date, messages] of Object.entries(appState.chatHistory)) {
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              insertChatMessage.run(
                msg.id,
                date,
                msg.role,
                msg.content,
                msg.timestamp
              );
            }
          }
        }
      }
    });
    
    // Execute the transaction
    transaction();
    
    const stats = {
      settings: settings ? 1 : 0,
      customFoods: appState.customFoods?.length || 0,
      dailyEntries: appState.dailyEntries?.length || 0,
      chatMessages: Object.values(appState.chatHistory || {}).reduce((sum, msgs) => sum + (Array.isArray(msgs) ? msgs.length : 0), 0)
    };
    const now = new Date().toISOString();
    console.log(`[${now}] Data successfully saved to database. Stats: ${JSON.stringify(stats)}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving data to database:', error);
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'SQLite' });
});

// Migrate from JSON to SQLite
app.post('/api/migrate-json', (req, res) => {
  try {
    const JSON_FILE = path.join(DATA_DIR, 'calorieChat.json');
    
    if (!fs.existsSync(JSON_FILE)) {
      return res.status(404).json({ message: 'No JSON file found to migrate' });
    }
    
    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    
    // Use the same code as the save endpoint but directly
    const appState = jsonData;
    
    if (!appState || typeof appState !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON data format' });
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Update settings
      const settings = appState.settings;
      if (settings) {
        db.prepare(`
          INSERT OR REPLACE INTO settings (
            id, targetCalories, proteinRatio, carbsRatio, fatRatio, theme, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          1,
          settings.targetCalories,
          settings.macroRatio.protein,
          settings.macroRatio.carbs,
          settings.macroRatio.fat,
          settings.theme,
          new Date().toISOString()
        );
      }
      
      // Clear and re-insert custom foods
      db.prepare('DELETE FROM custom_foods').run();
      if (appState.customFoods && appState.customFoods.length > 0) {
        const insertCustomFood = db.prepare(`
          INSERT INTO custom_foods (
            id, name, calories, protein, carbs, fat, servingSize, createdAt, isCustom, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const food of appState.customFoods) {
          insertCustomFood.run(
            food.id,
            food.name,
            food.calories,
            food.protein,
            food.carbs,
            food.fat,
            food.servingSize,
            food.createdAt,
            food.isCustom ? 1 : 0,
            new Date().toISOString()
          );
        }
      }
      
      // Clear and re-insert daily entries and consumed foods
      db.prepare('DELETE FROM consumed_foods').run();
      db.prepare('DELETE FROM daily_entries').run();
      
      if (appState.dailyEntries && appState.dailyEntries.length > 0) {
        const insertDailyEntry = db.prepare(`
          INSERT INTO daily_entries (
            id, date, totalCalories, totalProtein, totalCarbs, totalFat, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertConsumedFood = db.prepare(`
          INSERT INTO consumed_foods (
            foodId, dailyEntryId, name, servingSize, quantity, calories, protein,
            carbs, fat, mealType, time, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const entry of appState.dailyEntries) {
          insertDailyEntry.run(
            entry.id,
            entry.date,
            entry.totalCalories,
            entry.totalProtein,
            entry.totalCarbs,
            entry.totalFat,
            new Date().toISOString()
          );
          
          if (entry.foods && entry.foods.length > 0) {
            for (const food of entry.foods) {
              insertConsumedFood.run(
                food.foodId,
                entry.id,
                food.name,
                food.servingSize,
                food.quantity,
                food.calories,
                food.protein,
                food.carbs,
                food.fat,
                food.mealType,
                food.time,
                new Date().toISOString()
              );
            }
          }
        }
      }
      
      // Clear and re-insert chat messages
      db.prepare('DELETE FROM chat_messages').run();
      
      if (appState.chatHistory) {
        const insertChatMessage = db.prepare(`
          INSERT INTO chat_messages (
            id, date, role, content, timestamp
          ) VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const [date, messages] of Object.entries(appState.chatHistory)) {
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              insertChatMessage.run(
                msg.id,
                date,
                msg.role,
                msg.content,
                msg.timestamp
              );
            }
          }
        }
      }
    });
    
    // Execute the transaction
    transaction();
    
    // Rename the old JSON file as backup
    const backupFile = `${JSON_FILE}.bak.${Date.now()}`;
    fs.renameSync(JSON_FILE, backupFile);
    
    console.log(`JSON data migrated to SQLite. Original file backed up to ${backupFile}`);
    res.status(200).json({ 
      success: true, 
      message: 'Migration from JSON to SQLite completed successfully',
      backupFile
    });
    
  } catch (error) {
    console.error('Error during migration:', error);
    res.status(500).json({ error: 'Migration failed', details: error.message });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SQLite persistence server running on port ${PORT}`);
});

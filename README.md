# CalorieChat

A nutrition tracking application with chat interface for logging food, tracking calories, and managing custom food items.

## New SQLite Database Integration

This application now uses SQLite for persistent data storage, allowing for improved data integrity and cross-device synchronization.

### Key Features

- **SQLite Database**: All data is stored in a structured SQLite database for reliability and data integrity
- **Cross-Device Synchronization**: Data is always synchronized between devices via the central database
- **Refresh Button**: Manual refresh capability in the app header to fetch the latest data
- **Fallback to Local Storage**: Data is cached in localStorage as a fallback for offline use
- **Easy Migration**: Simple migration from the previous JSON-based storage

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the React development server:
   ```
   npm start
   ```

3. Start the SQLite database server (in a separate terminal):
   ```
   npm run db-server
   ```

## Migrating from JSON to SQLite

If you're upgrading from a previous version using JSON storage, run the migration script:

```
npm run migrate-to-sqlite
```

This will:
1. Convert all existing JSON data to the SQLite database
2. Create a backup of your original JSON file
3. Report successful migration with the backup location

## Docker Deployment

The application can be deployed using Docker:

1. Build and start the container:
   ```
   docker-compose up -d
   ```

2. The application will be available at:
   ```
   http://localhost:8081
   ```

## Environment Variables

### Setting Up OpenAI API Key

For local development:

1. Create a `.env` file in the project root (you can copy from the provided `.env.example`):
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Replace `your_openai_api_key_here` with your actual OpenAI API key

For Docker deployment:

1. Add the API key to your docker-compose command:
   ```
   REACT_APP_OPENAI_API_KEY=your_key docker-compose up -d
   ```
   
   Or define it in your docker-compose.yml environment section.

## Data Structure

The SQLite database contains the following tables:

- `settings`: User preferences and application settings
- `custom_foods`: User-defined food items with nutritional information
- `daily_entries`: Records of daily food consumption
- `consumed_foods`: Detailed food consumption records
- `chat_messages`: History of chat interactions

## SQLite Database Management Guide

### Accessing the SQLite Database

**In Development Environment:**
```bash
# Install SQLite CLI if needed
# On macOS:
brew install sqlite3
# On Ubuntu/Debian:
sudo apt-get install sqlite3

# Connect to the database (from project root)
sqlite3 ./data/calorieChat.db
```

**In Docker Environment:**
```bash
# Get the container ID
docker ps

# Connect to the container
docker exec -it [container_id] /bin/sh

# Navigate to data directory
cd /app/data

# Connect to SQLite database
sqlite3 calorieChat.db
```

### Useful SQLite Commands

Once connected to the database, you can run these commands:

```sql
-- Show all tables
.tables

-- Display table schema
.schema settings
.schema custom_foods
.schema daily_entries
.schema consumed_foods
.schema chat_messages

-- Enable column headers and formatted output
.headers on
.mode column

-- Query examples
-- Get all settings
SELECT * FROM settings;

-- Get all custom foods
SELECT * FROM custom_foods;

-- Get daily entries for a specific date
SELECT * FROM daily_entries WHERE date = '2025-04-08';

-- Get consumed foods for a specific daily entry
SELECT * FROM consumed_foods WHERE dailyEntryId = '(entry_id_from_previous_query)';

-- Get chat messages for a specific date
SELECT * FROM chat_messages WHERE date = '2025-04-08';

-- Exit SQLite
.quit
```

### Viewing Docker Logs

To monitor database operations and ensure data is being saved:

```bash
# View logs from the container
docker logs [container_id]

# Follow logs in real-time
docker logs -f [container_id]
```

You should see messages like:
- "Data successfully loaded from database"
- "Data successfully saved to database"
- "Connected to SQLite database at /app/data/calorieChat.db"

### Backup and Restore

```bash
# In development (from project root)
# Backup
sqlite3 ./data/calorieChat.db .dump > backup.sql

# Restore
sqlite3 ./data/calorieChat.db < backup.sql

# In Docker
# Backup
docker exec -it [container_id] sh -c "cd /app/data && sqlite3 calorieChat.db .dump" > backup.sql

# Restore
cat backup.sql | docker exec -i [container_id] sh -c "cd /app/data && sqlite3 calorieChat.db"
```

## Cross-Device Usage

To ensure you always have the latest data on any device:

1. When switching devices, click the refresh button in the header to get the latest data
2. The app automatically fetches fresh data on startup
3. Data is always saved to the server when changes are made
4. LocalStorage is used only as a fallback cache in case of server unavailability

## License

[MIT License](LICENSE)

# CalorieChat - AI-Powered Nutrition Tracking App

CalorieChat is a React application that combines AI nutrition analysis with a calorie tracking dashboard. It allows you to easily track your daily food intake through natural language, analyze nutritional content, and monitor your progress toward your dietary goals.

![CalorieChat Screenshot](https://via.placeholder.com/800x450.png?text=CalorieChat+Screenshot)

## Features

- **AI-Powered Food Analysis**: Describe what you've eaten in natural language, and the app will calculate the nutritional content
- **Custom Foods**: Add your own foods with precise nutritional information
- **Dashboard**: Track your daily calories and macronutrient intake with visual progress indicators
- **Data Persistence**: All your nutrition data is saved between sessions
- **Responsive Design**: Works on desktop and mobile devices

## Docker Containerization

CalorieChat is containerized for easy deployment and consistent behavior across environments.

> **Note:** The project contains a nested git repository at `/calorie-chat` that is automatically excluded during the Docker build process. This nested directory is ignored in `.gitignore` and removed in the `Dockerfile` to prevent any submodule issues.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- OpenAI API Key (for the AI-powered food analysis)

### Architecture

The containerized application consists of:

1. **React Frontend**: The main CalorieChat application
2. **Nginx Web Server**: Serves the static React files efficiently
3. **Persistence Server**: A small Express.js server that manages data persistence
4. **Data Volume**: For persistent storage of user data

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd calorie-chat
```

### 2. Set up Environment Variables

Create a `.env` file in the project root with your OpenAI API key:

```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container on port 8081
- Mount a persistent volume for data storage

### 4. Access the Application

Open your browser and navigate to:

```
http://192.168.1.214:8081
```

## Data Persistence

CalorieChat uses a dedicated persistence system to ensure your data is saved between container restarts:

1. **How it works**:
   - A persistence server runs alongside the web server
   - The client-side JavaScript intercepts localStorage operations
   - Data is saved to a Docker volume mounted at `/app/data`

2. **Backup your data**:
   - The data is stored in JSON format at `/app/data/calorieChat.json`
   - You can copy this file to create backups

3. **Restore data**:
   - To restore data, place your backup file at `/app/data/calorieChat.json`
   - Restart the container

## Future Enhancements

While the current implementation works well for a single user, here are some potential areas for future improvement:

### 1. Scalable Data Persistence

The current method saves the entire application state to a single `calorieChat.json` file. While simple, this approach has limitations as data grows:

-   **File Size:** The JSON file can become very large over time, containing all historical daily entries, custom foods, and chat history.
-   **Performance:** Reading, parsing, and writing the entire large file on every load/save can become slow and resource-intensive (CPU, memory, disk I/O).
-   **Granularity:** It's inefficient to query or update specific pieces of data (e.g., a single meal) without handling the entire state object.

**Potential Alternatives:**

-   **SQLite Database:** Integrate a file-based database like SQLite within the container. This would allow for efficient querying and updating of specific data records without loading the entire dataset. Requires adding the `sqlite3` package and using SQL or an ORM.
-   **Dedicated Database Server:** For larger scale or multi-user scenarios, migrate to a more powerful database system (e.g., PostgreSQL, MongoDB) running as a separate service/container.
-   **Split JSON Files:** As an intermediate step, the persistence logic could be modified to use multiple JSON files (e.g., `settings.json`, `customFoods.json`, `entries-YYYY-MM.json`). This reduces the size of individual file operations but adds complexity to the backend server.

### 2. Authentication

Currently, the application is accessible to anyone who can reach the URL. A simple authentication layer could be added:

-   **Mechanism:** Implement a basic password check.
-   **Configuration:** Store a hashed password securely (e.g., using an environment variable like `APP_PASSWORD_HASH` set during the Docker build).
-   **Frontend:** Create a login screen component that prompts for the password.
-   **Verification:** Compare the entered password (hashed) against the stored hash.
-   **Session Management:** Upon successful login, set a flag in the browser's `sessionStorage` (e.g., `isAuthenticated=true`). The main app component would check for this flag on load; if present, show the app, otherwise show the login screen. `sessionStorage` automatically clears when the browser tab/window is closed, requiring login again for a new session.

## Configuration Options

### Port Mapping

The application uses port 8081 by default. To change this, modify the `docker-compose.yml` file:

```yaml
ports:
  - "your_preferred_port:80"
```

### Static IP Address

The application is configured to use the static IP 192.168.1.214. If your Docker host has a different IP, update it in the `docker-compose.yml` file:

```yaml
environment:
  - HOST_IP=your_docker_host_ip
```

## Development

### Building Without Docker

If you want to run the application directly without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### File Structure

- `src/` - React application source code
- `public/` - Static assets
- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Container orchestration
- `nginx.conf` - Nginx web server configuration
- `persistence-server.js` - Data persistence server
- `localStorage-persistence.js` - Client-side persistence script

## Troubleshooting

### Data Not Persisting

If your data isn't being saved between container restarts:

1. Check volume permissions:
   ```bash
   docker-compose exec calorie-chat ls -la /app/data
   ```

2. Verify the persistence server is running:
   ```bash
   docker-compose logs calorie-chat | grep "Persistence server running"
   ```

3. Check for errors in the browser console related to data saving

### Container Won't Start

If the container fails to start:

1. Check Docker logs:
   ```bash
   docker-compose logs calorie-chat
   ```

2. Verify your OpenAI API key is correctly set in the `.env` file

3. Ensure ports 8081 and 3000 are available on your host machine

## License

[MIT License](LICENSE)

## Acknowledgments

- Built with React
- Powered by OpenAI API for food analysis
- Styled with styled-components

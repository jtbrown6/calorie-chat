# Build stage
FROM node:18 AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code (excluding nested git repositories)
COPY . .
RUN rm -rf calorie-chat

# Uncomment to include client-side persistence script in index.html
# RUN sed -i 's/<head>/<head>\n    <script src="\/localStorage-persistence.js"><\/script>/' ./public/index.html

# Build the React application
ARG REACT_APP_OPENAI_API_KEY
ENV REACT_APP_OPENAI_API_KEY=$REACT_APP_OPENAI_API_KEY
RUN npm run build

# Production stage with Nginx and Node.js for persistence
FROM node:18-alpine
WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx

# Set up directories
RUN mkdir -p /usr/share/nginx/html /app/data

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf
# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Install persistence server dependencies
COPY package.json /app/
COPY db-persistence-server.js /app/
COPY localStorage-persistence.js /usr/share/nginx/html/
RUN npm install express body-parser better-sqlite3

# Create data directory for persistence
RUN mkdir -p /app/data && \
    chmod -R 777 /app/data

# Expose ports
EXPOSE 80 3001

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'export NODE_ENV=production' >> /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'node /app/db-persistence-server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start both Nginx and Node.js persistence server
CMD ["/app/start.sh"]

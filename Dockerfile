# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy the rest of the backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Expose the port your app runs on
EXPOSE 3000

# Start the backend
CMD ["node", "backend/index.js"] 
# IntelliPlan v2

Enterprise planning application with React frontend and Node.js backend.

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Backend Server

```bash
cd server
npm run dev
# Server will start on http://localhost:8080
```

### 3. Start the Frontend (in a new terminal)

```bash
cd client
npm start
# React app will start on http://localhost:3000
```

### 4. Verify Setup

- Backend health check: http://localhost:8080/api/health
- Items API: http://localhost:8080/api/items
- Frontend: http://localhost:3000

## Troubleshooting

### Issue: API returns HTML instead of JSON

**Symptoms:**

- Requesting `/api/items` returns HTML
- 304 status code with HTML content

**Solutions:**

1. **Make sure backend server is running:**

   ```bash
   cd server
   npm run dev
   ```

   You should see: `✅ Server running on port 8080`

2. **Clear browser cache:**

   - Chrome: Ctrl+Shift+Delete
   - Or use Incognito mode

3. **Test API directly:**

   ```bash
   curl http://localhost:8080/api/health
   curl http://localhost:8080/api/items
   ```

4. **Check proxy configuration:**

   - Verify `package.json` has `"proxy": "http://localhost:8080"`
   - Restart React dev server after adding proxy

5. **Use absolute API URLs in code:**
   ```javascript
   // Instead of: fetch('/api/items')
   // Use:
   fetch("http://localhost:8080/api/items");
   ```

### Issue: CORS errors

If you see CORS errors, the backend server includes CORS middleware. Make sure:

- Backend server is running
- CORS origin includes your frontend URL

### Issue: Connection refused

- Check if backend is running on port 8080
- Check if another process is using port 8080:

  ```bash
  # Windows
  netstat -ano | findstr :8080

  # Linux/Mac
  lsof -i :8080
  ```

## Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up
```

## Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services
kubectl get ingress
```

## Project Structure

```
intelliplan_v2/
├── client/          # React frontend
├── server/          # Express backend
├── k8s/             # Kubernetes configs
└── docker-compose.yml
```

# Quick Start Guide - Backend

## 🚀 Get Started in 3 Minutes

### 1. Setup
```bash
cd server
cp .env.example .env
npm install
```

### 2. Configure .env
```env
MONGO_URI=mongodb://localhost:27017/ultimate-level-game
JWT_SECRET=dev_secret_key_change_in_production
PORT=5000
CORS_ORIGIN=*
```

### 3. Run
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## 📍 API Endpoints

### Guest Login (Frontend does this automatically)
```bash
curl -X POST http://localhost:5000/api/auth/guest
# Returns: { "token": "eyJhbG..." }
```

### Save Progress (Frontend calls silently)
```bash
curl -X POST http://localhost:5000/api/progress/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxLevel": 5, "deaths": 10}'
# Returns: { "success": true }
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/leaderboard
# Returns: [ { "username": "player1", "progress": {...} }, ... ]
```

### Health Check
```bash
curl http://localhost:5000/health
# Returns: { "status": "ok" }
```

---

## 🗄️ MongoDB Setup (Local Dev)

### With Docker (Easiest)
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Or Install MongoDB locally
- macOS: `brew install mongodb-community`
- Linux: `sudo apt install mongodb`
- Windows: Download from mongodb.com

Then set:
```env
MONGO_URI=mongodb://localhost:27017/ultimate-level-game
```

---

## 🔧 Development

### Watch mode (auto-restart on changes)
```bash
npm install -D nodemon
npm run dev
```

### View database (optional)
```bash
# Install MongoDB Compass from mongodb.com
# Connect to: mongodb://localhost:27017
```

---

## ✅ Verification

After starting the server, test these:

| Test | Command | Expected |
|------|---------|----------|
| Server alive | `curl http://localhost:5000/health` | `{"status":"ok"}` |
| Guest auth | `curl -X POST http://localhost:5000/api/auth/guest` | `{"token":"..."}` |
| DB connected | Check console output | `✓ MongoDB connected successfully` |

---

## 🚨 Common Issues

**"MONGO_URI is not defined"**
- Run `cp .env.example .env`

**"Cannot connect to MongoDB"**
- Start MongoDB service
- Check MONGO_URI in .env is correct

**CORS errors in browser**
- Ensure CORS_ORIGIN in .env matches frontend URL

**"Address already in use" on port 5000**
- Change PORT in .env
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

---

## 📦 Frontend Configuration

In `Client/services/api.ts`, set:
```typescript
const API_URL = "https://YOUR-BACKEND-URL.onrender.com";
```

For local dev: `http://localhost:5000`

---

## 🚀 Deploy to Production

### Using Render.com (Free)
1. Push repo to GitHub
2. Connect repo on render.com
3. Create "New Web Service"
4. Set environment variables in Settings:
   - `MONGO_URI` → MongoDB Atlas connection string
   - `JWT_SECRET` → Long random string
   - `CORS_ORIGIN` → Your game URL
5. Deploy

### Using Heroku
```bash
heroku create your-app-name
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret
heroku config:set CORS_ORIGIN=https://yourgame.com
git push heroku main
```

---

## 📚 API Behavior

| Endpoint | Behavior | Never Crashes |
|----------|----------|---------------|
| POST /api/auth/guest | Creates guest account, returns token | ✅ Yes |
| POST /api/progress/save | Saves maxLevel & deaths, always returns 200 | ✅ Yes |
| GET /api/leaderboard | Returns top 100 players sorted | ✅ Catches errors |

**Key Guarantee**: Progress save will NEVER cause game crash. Always returns `{ success: true }`.

---

## 📞 Support

Check [BACKEND_SETUP.md](server/BACKEND_SETUP.md) for detailed documentation.

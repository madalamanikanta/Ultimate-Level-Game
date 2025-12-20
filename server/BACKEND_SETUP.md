# Ultimate Level Game - Backend Setup

## Overview

Node.js + Express + MongoDB backend for Ultimate Level Game (Phaser-based browser game).

### Architecture

- **Auth**: JWT-based authentication with guest account support
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful endpoints matching frontend contract exactly
- **Security**: CORS enabled, password hashing with bcryptjs

## Installation

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A long random string for signing tokens
   - `PORT`: Server port (default 5000)
   - `CORS_ORIGIN`: Frontend URL for CORS (use * for dev)

3. **Start the server**:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### Guest Login (Silent)
```
POST /api/auth/guest
```
- **Body**: Empty
- **Response**: `{ token: "jwt_token_string" }`
- **Notes**: Creates temporary guest account, never crashes game

#### Register
```
POST /api/auth/register
```
- **Body**: `{ username: string, password: string }`
- **Response**: `{ token: "jwt_token_string" }`

#### Login
```
POST /api/auth/login
```
- **Body**: `{ username: string, password: string }`
- **Response**: `{ token: "jwt_token_string" }`

### Progress Tracking

#### Save Progress
```
POST /api/progress/save
Headers: Authorization: Bearer <token>
```
- **Body**: `{ maxLevel: number, deaths: number }`
- **Response**: `{ success: true }`
- **Notes**: Fire-and-forget. Always returns success to prevent game crash

### Leaderboard

#### Get Leaderboard
```
GET /api/leaderboard
```
- **Response**: Array of users sorted by:
  1. Highest level unlocked (descending)
  2. Lowest deaths (ascending)
- **Example**: 
  ```json
  [
    {
      "_id": "...",
      "username": "player1",
      "progress": {
        "highestLevelUnlocked": 42,
        "deaths": 5
      }
    }
  ]
  ```

## Frontend Integration

The frontend (Client/) expects:

1. **Token Storage**: `localStorage.ulg_token`
2. **Auth Header**: `Authorization: Bearer <token>`
3. **Guest Auth**: Happens on first load via `ensureGuestAuth()` in `services/api.ts`
4. **Progress Sync**: Fire-and-forget, never blocks gameplay

Backend has been configured to:
- ✅ Accept guest auth with no validation required
- ✅ Never crash progress save endpoint
- ✅ Enable CORS for frontend access
- ✅ Maintain consistent JWT authentication
- ✅ Sort leaderboard by level then deaths

## Database Models

### User Schema

```javascript
{
  username: String (unique),
  password: String (hashed),
  isGuest: Boolean,
  progress: {
    highestLevelUnlocked: Number (default: 1),
    deaths: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

- **Guest Auth**: Always returns `{ token }` or `{ token: null }` on failure
- **Progress Save**: Always returns 200 status (never blocks game)
- **Auth Middleware**: Returns 401 if token missing/invalid
- **Database**: Exits on connection failure

## Development

For local development with auto-reload:

```bash
npm install -D nodemon
npm run dev
```

## MongoDB Setup

### Local Development
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Then set MONGO_URI=mongodb://localhost:27017/ultimate-level-game
```

### MongoDB Atlas (Cloud)
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Set `MONGO_URI` in `.env`

## Production Deployment

1. Set strong `JWT_SECRET`
2. Update `CORS_ORIGIN` to your frontend domain
3. Use MongoDB Atlas or self-hosted MongoDB
4. Deploy to Heroku, Render, Railway, etc.
5. Set environment variables on hosting platform
6. Ensure `NODE_ENV=production`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGO_URI is not defined" | Copy `.env.example` to `.env` and set values |
| CORS errors in browser | Check `CORS_ORIGIN` in `.env` matches frontend URL |
| Token invalid errors | Ensure `JWT_SECRET` is set and consistent |
| "User not found" on progress save | Account was deleted; guest auth creates new one |
| Port already in use | Change `PORT` in `.env` or kill existing process |

## API Contract Summary

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| POST | /api/auth/guest | None | `{ token }` |
| POST | /api/auth/register | None | `{ token }` |
| POST | /api/auth/login | None | `{ token }` |
| POST | /api/progress/save | Required | `{ success: true }` |
| GET | /api/leaderboard | None | `[ { username, progress } ]` |

---

**Status**: ✅ Production-ready backend with full game integration

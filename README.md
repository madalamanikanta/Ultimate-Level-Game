# Ultimate Level Challenge

A feature-rich 2D side-scrolling platformer game built with **Phaser 3**, **React/TypeScript**, and **Node.js**. Play through 10 progressively challenging levels with dynamic obstacles, enemies, power-ups, and customization systems. Available on **web browsers** and **Android** via Capacitor.

---

## 🎮 Project Overview

**Ultimate Level Challenge** is a jungle-themed platformer that combines engaging level design with modern web technologies. The game emphasizes skill-based mechanics with progressive difficulty, cosmetic customization, and daily challenges. Players navigate through increasingly complex levels, defeat enemies, collect coins, and compete on global leaderboards.

The project features both a **frontend game engine** (Phaser-based) and a **backend server** (Node.js + MongoDB) for progress tracking, authentication, and leaderboards.

---

## 🕹️ Gameplay Description

### How It Works

Players control a customizable character navigating through 10 levels with the goal of reaching the level exit. Each level presents unique challenges with varying difficulty.

### Core Mechanics

- **Movement**: Arrow keys (Left/Right) to move horizontally
- **Jumping**: Up arrow to jump; press again in mid-air for a double jump
- **Dashing**: SHIFT to perform a quick dash (invincible during dash)
- **Parrying**: CTRL to parry incoming enemy attacks (stun enemies for 2 seconds)
- **Vine Swinging**: Press Up arrow while near a vine to swing; press again to jump off
- **Stomping**: Jump on enemies from above to defeat them

### Level Elements

- **Platforms**: Static and moving platforms (horizontal & vertical motion)
- **Coins**: Collectibles worth 10 points each
- **Enemies**: Snake and bat enemies with distinct behaviors
- **Hazards**: Quicksand that slows movement
- **Traps**: Spike traps that deal damage
- **Power-ups**:
  - Speed Boost: 50% faster movement for 5 seconds
  - Jump Boost: 25% higher jump for 10 seconds
  - Shield: Blocks one hit
- **Vines**: Climbable vines for vertical traversal

### Boss Level

Level 10 features a **Gorilla Boss** with 10 health points that must be defeated to complete the game. Boss attacks can be parried for strategic advantage.

### Challenges & Progression

- **Daily Challenges**: Random daily objectives (collect coins, finish within time limit, defeat enemy)
- **Star System**: Earn up to 3 stars per level based on performance
- **Level Unlock System**: Later levels require a minimum number of stars to unlock
- **Tutorial System**: In-level guides explain mechanics

---

## ✨ Key Features

### Implemented Features

- **10 Playable Levels** with increasing difficulty (Level 1-9 plus Boss Level 10)
- **Player Customization**:
  - 5 outfit colors (Default, Ruby Red, Sapphire Blue, Emerald Green, Golden Gold)
  - 5 hat options (None, Fedora, Pith Helmet, Top Hat, Crown)
  - Cosmetics unlocked through level progression
- **Enemy Types**: Snake (ground patrol), Bat (flying), Gorilla Boss
- **Physics System**: Gravity, collisions, momentum, and jump mechanics
- **Daily Challenge System**: Rotating objectives with bonus rewards (50 coins)
- **Progress Tracking**:
  - Local progress stored in browser localStorage
  - Automatic synchronization to MongoDB backend
  - Offline-first gameplay (works without internet)
- **Authentication**:
  - Guest account system (automatic, no login required)
  - User registration and login
  - JWT-based session management
- **Leaderboard System**: Global rankings based on progress and deaths
- **Death Counter**: Tracks total deaths across the game
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Audio**: Procedurally generated background music
- **Platform Support**: Web (browser) and Android (via Capacitor)

---

## 🛠️ Tech Stack

### Frontend
- **Phaser 3** (v3.90.0) - Game engine
- **React** (TypeScript) - UI framework (legacy components, not used in current game)
- **Vite** (v6.2.0) - Build tool and dev server
- **TypeScript** (v5.8.2) - Type safety
- **Capacitor** (v8.0.0) - Cross-platform mobile wrapper for Android deployment
- **CSS** - Styling for responsive design

### Backend
- **Node.js** - Runtime
- **Express** (v4.19.2) - Web framework
- **MongoDB** (Mongoose v8.5.0) - Database
- **JWT** (jsonwebtoken v9.0.2) - Authentication tokens
- **bcryptjs** (v2.4.3) - Password hashing
- **CORS** (v2.8.5) - Cross-origin requests
- **Nodemon** - Development auto-reload
- **dotenv** - Environment variables

### Development Tools
- **TypeScript** - Static typing
- **Vite** - Fast build and HMR
- **npm** - Package management

---

## 📁 Project Structure

```
Ultimate-Level-Game-main/
├── README.md                 # Main documentation
├── Client/                   # Frontend (Phaser game + Capacitor)
│   ├── index.tsx            # Main entry point (3900+ lines)
│   ├── App.tsx              # Legacy React component (not used)
│   ├── index.html           # HTML template
│   ├── constants.ts         # Game configuration (levels, cosmetics, challenges)
│   ├── types.ts             # TypeScript type definitions (legacy)
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite build configuration
│   ├── capacitor.config.json # Capacitor Android config
│   ├── metadata.json        # App metadata
│   │
│   ├── components/          # Legacy React components
│   │   ├── ContentPanel.tsx
│   │   ├── IdeaCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Sidebar.tsx
│   │   └── icons.tsx
│   │
│   ├── services/            # API communication
│   │   ├── api.ts          # Backend sync & progress tracking
│   │   └── geminiService.ts # Legacy AI service
│   │
│   ├── public/              # Static assets
│   │   └── manifest.json    # PWA manifest
│   │
│   └── android/             # Capacitor Android build
│       ├── app/
│       ├── gradle/
│       └── [Android native files]
│
├── server/                   # Backend (Node.js + Express + MongoDB)
│   ├── server.js            # Main server entry point
│   ├── package.json         # Backend dependencies
│   ├── BACKEND_SETUP.md     # Backend documentation
│   │
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   │
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication
│   │
│   ├── models/
│   │   └── User.js          # User schema (guest & registered)
│   │
│   └── routes/
│       ├── auth.js          # /api/auth/* (register, login, guest)
│       ├── progress.js      # /api/progress/* (save, reset, fetch)
│       └── leaderboard.js   # /api/leaderboard/* (rankings)
```

### Key Files Explained

| File | Purpose |
|------|---------|
| **index.tsx** | Complete game implementation (10 scenes: Main Menu, Level Select, Customization, Game, Level Complete, Leaderboard) |
| **constants.ts** | All game data: level layouts, cosmetics, challenges, enemy/hazard configurations |
| **api.ts** | Frontend-backend communication: progress sync, authentication, leaderboard fetching |
| **server.js** | Express server setup, CORS, route handlers |
| **auth.js** | JWT authentication (register, login, guest account creation) |
| **progress.js** | Save/fetch/reset player progress from MongoDB |
| **leaderboard.js** | Fetch and rank players by level and deaths |

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (cloud or local instance)
- **Android SDK** (for mobile builds only)

### Backend Setup

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env  # (if exists, or create manually)
```

Configure `.env`:
```bash
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ultimatelevel
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
CORS_ORIGIN=*  # Use http://localhost:3000 for production
```

### Frontend Setup

```bash
# 1. Navigate to client directory
cd Client

# 2. Install dependencies
npm install

# 3. (Optional) Configure API endpoint in services/api.ts
# The API_URL defaults to https://ultimate-level-game.onrender.com
# Change API_URL if running local backend
```

---

## 🚀 How to Run / Build

### Development Mode

#### Backend
```bash
cd server
npm run dev  # Runs with nodemon (auto-reload on file changes)
```

Server runs on: `http://localhost:5000`

#### Frontend
```bash
cd Client
npm run dev  # Runs Vite dev server with HMR
```

Game runs on: `http://localhost:3000`

### Production Build

#### Backend
```bash
cd server
npm start  # Runs server.js directly
```

#### Frontend (Web)
```bash
cd Client
npm run build      # Creates optimized production bundle in dist/
npm run preview    # Preview production build locally
```

#### Android Build (using Capacitor)
```bash
cd Client

# 1. Build web assets
npm run build

# 2. Copy web assets to Android project
npx cap copy android

# 3. Sync dependencies and permissions
npx cap sync android

# 4. Open Android Studio
npx cap open android

# 5. Build and run on emulator/device
# (Use Android Studio's build buttons or adb commands)
```

---

## 🎮 Controls / Input

### Keyboard (Desktop)

| Action | Key |
|--------|-----|
| Move Left | Left Arrow ← |
| Move Right | Right Arrow → |
| Jump | Up Arrow ↑ |
| Double Jump | Up Arrow ↑ (mid-air) |
| Dash | SHIFT |
| Parry | CTRL |
| Vine Swing | Up Arrow ↑ (near vine) |
| Jump off Vine | Up Arrow ↑ (while swinging) |
| Menu Navigation | Mouse Click |

### Mobile (Touch)

- On-screen buttons for movement, jump, dash, and parry
- Tap and swipe gestures for level navigation

---

## 📱 Platform Support

### Supported Platforms

- **Web Browser** (Chrome, Firefox, Safari, Edge)
  - Desktop: Windows, macOS, Linux
  - Tablet: iPads, Android tablets
  - Mobile Web: iOS Safari, Android Chrome
  
- **Android** (via Capacitor)
  - Native Android app for phones and tablets
  - API Level 21+ required

### Responsive Features

- Game scales to device screen size
- Touch input for mobile devices
- Viewport optimization for various aspect ratios

---

## 🔮 Future Improvements

Based on the current architecture, potential enhancements include:

### Gameplay
- Additional enemy types with unique AI patterns
- More varied level themes (volcano, ice, underwater)
- Achievement/badge system
- Difficulty settings (Easy, Normal, Hard)
- Level editor or user-generated content

### Features
- Sound effects and music tracks (currently procedural)
- Particle effects for visual polish
- Multiplayer competitive mode (racing levels)
- Seasonal events and limited-time challenges
- Inventory system for cosmetics

### Technical
- Performance optimization for lower-end devices
- Progressive Web App (PWA) support
- Cloud save across devices
- Offline replay functionality
- Analytics and telemetry

---

## 👥 Contributors

- **Original Creator**: [Project Repository]

This project was built as a full-stack web game with both frontend and backend components, demonstrating proficiency in game development (Phaser), full-stack JavaScript/TypeScript, and deployment practices.

---

## 📄 License

No license specified. This project is proprietary unless otherwise indicated.

---

## 🔗 Useful Links

- **Backend Documentation**: See [BACKEND_SETUP.md](server/BACKEND_SETUP.md)
- **Phaser 3 Docs**: https://photonstorm.github.io/phaser3-docs/
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Vite Docs**: https://vitejs.dev/

---

**Last Updated**: January 2026

For questions or contributions, please refer to the repository documentation or contact the development team.

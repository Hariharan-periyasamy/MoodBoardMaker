# 🎨 MoodBoard — AI-Powered Interactive Inspiration Hub

> A full-stack, production-ready **Digital MoodBoard & Inspiration Hub** featuring AI color palette extraction, real-time collaboration, public board sharing, activity logs, and a premium glassmorphism UI.

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with persistent sessions
- Secure password hashing (bcrypt)
- Protected routes & public share URLs

### 🎛 Board Management
- Full CRUD (Create, Read, Update, Delete, Archive)
- Configurable theme colors, visibility (Public/Private)
- Public sharing via unique token-based URLs
- JSON Export & Import boards
- Collaborator management with role-based access (Owner / Editor / Viewer)

### 🖼 Tile Management
- Upload images (Cloudinary CDN or local fallback)
- Drag-and-drop grid reordering
- Caption, tags, theme color per tile
- Duplicate tiles
- AI color palette extraction (6 dominant colors via `node-vibrant`)
- Click to copy HEX codes

### 🤝 Real-Time Collaboration (Socket.IO)
- Live presence avatars showing who's on the board
- Real-time tile sync across all connected users
- Editing status indicator ("Currently Editing")

### 🔍 Advanced Search & Activity
- Global context search (boards + tiles) with debounce
- Full activity timeline with date/action/board filters
- Notification bell with unread badge

### 📊 Analytics Dashboard
- Total boards, tiles, shared boards, activity counts
- Recently shared boards grid
- Recent activity timeline

### 🌗 Dark Mode
- Full dark theme with persisted preference
- Smooth animated transitions

### 📦 Export / Import
- Export any board as `.json`
- Import a previously exported `.json` file to restore boards

---

## 🗂 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, TailwindCSS, TanStack Query |
| Backend | Node.js, Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Real-Time | Socket.IO |
| Images | Cloudinary (with local fallback) |
| AI Colors | node-vibrant |
| DnD | @dnd-kit/sortable |
| UI | Lucide icons, React Hot Toast |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI or local MongoDB
- Cloudinary account (optional — local fallback works)

### Backend Setup
```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env        # set VITE_API_URL
npm install
npm run dev
```

App runs at **http://localhost:5173** with API at **http://localhost:5000**

---

## 📁 Project Structure

```
MoodTracker/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── middleware/         # Auth, error handlers
│   │   ├── socket/             # Socket.IO room management
│   │   └── utils/              # Activity logger, response helpers
│   └── server.js               # HTTP + Socket.IO entry point
│
└── frontend/
    ├── src/
    │   ├── api/                 # Axios API service hooks
    │   ├── components/          # Reusable UI components
    │   │   ├── boards/         # BoardCard, ShareModal, CollaboratorsPanel
    │   │   ├── tiles/          # TileCard, TileGrid, AddTileModal, ImageUploader
    │   │   ├── layout/         # Navbar, Sidebar, GlobalSearch, NotificationBell
    │   │   ├── activity/       # ActivityTimeline
    │   │   └── ui/             # Button, Input, Modal, Avatar, ErrorBoundary
    │   ├── context/            # AuthContext, ThemeContext
    │   ├── hooks/              # useSocket, useBoardSocket
    │   ├── pages/              # All page-level components
    │   └── utils/              # dateUtils
    └── vercel.json             # Vercel SPA routing config
```

---

## 🌐 Production Deployment

### Frontend → Vercel
1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy — Vercel auto-detects Vite and uses `vercel.json` for SPA routing

### Backend → Render
1. Push your code to GitHub
2. Create a new **Web Service** at [render.com](https://render.com)
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `backend/.env.example`

### Database → MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist all IPs (`0.0.0.0/0`) for Render compatibility
3. Copy the connection URI and set it as `MONGODB_URI`

### Images → Cloudinary
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy **Cloud Name**, **API Key**, **API Secret** to your backend `.env`

---

## 🔒 Security
- All API endpoints protected by JWT Bearer token middleware
- Share token endpoints are public and read-only
- Passwords never stored in plaintext (bcrypt with salt rounds: 12)
- CORS configured to only allow known frontend origin

---

## 📝 License
MIT — free to use, modify, and deploy.

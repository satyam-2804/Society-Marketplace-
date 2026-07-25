import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent state storage file path for cloud backend simulation
const DATA_FILE = path.join(process.cwd(), 'cloud_state.json');

let appState: any = {
  users: [
    {
      id: 'user_admin',
      fullName: 'Satyam (Society Admin)',
      email: 'satyam443355@gmail.com',
      mobile: '+91 8595946517',
      address: 'Society Management Office, Gate 1',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
      isApproved: true,
    }
  ],
  currentUser: null,
  stores: [],
  products: [],
  orders: [],
  cart: [],
  coupons: [],
  banners: [],
  notifications: [],
  reviews: [],
  themeMode: 'system'
};

// Load saved state from disk if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      appState = { ...appState, ...parsed };
    }
  } catch (e) {
    console.error("Error reading cloud_state.json:", e);
  }
}

function saveStateToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appState, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing cloud_state.json:", e);
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/state", (req, res) => {
  res.json(appState);
});

app.post("/api/state", (req, res) => {
  const newState = req.body;
  if (newState && typeof newState === 'object') {
    appState = { ...appState, ...newState };
    saveStateToDisk();
  }
  res.json({ success: true, state: appState });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloud-backed Server running on http://localhost:${PORT}`);
  });
}

startServer();

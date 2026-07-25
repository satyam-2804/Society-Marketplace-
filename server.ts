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
      createdAt: '2026-07-25T07:21:12-07:00',
      isApproved: true,
    }
  ],
  stores: [],
  products: [],
  orders: [],
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
      // Ensure we merge and don't include currentUser/cart globally
      appState = {
        users: Array.isArray(parsed.users) ? parsed.users : appState.users,
        stores: Array.isArray(parsed.stores) ? parsed.stores : [],
        products: Array.isArray(parsed.products) ? parsed.products : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
        banners: Array.isArray(parsed.banners) ? parsed.banners : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
        themeMode: parsed.themeMode || 'system'
      };
    }
  } catch (e) {
    console.error("Error reading cloud_state.json:", e);
  }
}

// Guarantee Admin user satyam443355@gmail.com always exists
const adminEmail = 'satyam443355@gmail.com';
const hasAdmin = appState.users.some((u: any) => u.email.toLowerCase() === adminEmail);
if (!hasAdmin) {
  appState.users.push({
    id: 'user_admin',
    fullName: 'Satyam (Society Admin)',
    email: adminEmail,
    mobile: '+91 8595946517',
    address: 'Society Management Office, Gate 1',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-07-25T07:21:12-07:00',
    isApproved: true,
  });
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
    // Exclude device-specific fields
    const { currentUser, cart, ...cleanState } = newState;
    
    appState = { ...appState, ...cleanState };

    // Ensure users array is valid and contains the Admin
    if (!Array.isArray(appState.users)) {
      appState.users = [];
    }
    
    const adminEmail = 'satyam443355@gmail.com';
    const hasAdmin = appState.users.some((u: any) => u.email.toLowerCase() === adminEmail);
    if (!hasAdmin) {
      appState.users.push({
        id: 'user_admin',
        fullName: 'Satyam (Society Admin)',
        email: adminEmail,
        mobile: '+91 8595946517',
        address: 'Society Management Office, Gate 1',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: '2026-07-25T07:21:12-07:00',
        isApproved: true,
      });
    }

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

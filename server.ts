import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import nodemailer from "nodemailer";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const app = express();
const PORT = 3000;

let isFcmInitialized = false;

try {
  // Initialize admin SDK using Application Default Credentials
  if (getApps().length === 0) {
    initializeApp({
      projectId: "excellent-star-nds98",
    });
  }
  isFcmInitialized = true;
  console.log("✅ Firebase Admin successfully initialized for Cloud Messaging (FCM).");
} catch (err: any) {
  console.warn("⚠️ Firebase Admin credentials not found. Running in Simulated FCM mode. Push notifications will be logged to server console.", err.message);
}

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

// SMTP Email Notification service
let emailTransporter: nodemailer.Transporter | null = null;
let isSmtpVerified = false;

function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (!emailTransporter) {
      console.warn("⚠️ SMTP environment variables are not fully configured. Email notifications will be logged to the server console.");
      emailTransporter = null;
    }
    return null;
  }

  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user,
        pass,
      },
    });

    // Don't verify eagerly to prevent crashing or angry error logs.
    // If it fails during sending, we catch it later.
    isSmtpVerified = true;
  }

  return isSmtpVerified ? emailTransporter : null;
}

// Call once on startup
getEmailTransporter();

app.post("/api/send-email", async (req, res) => {
  const {
    toEmail,
    orderId,
    customerName,
    customerMobile,
    deliveryAddress,
    items,
    totalAmount,
    storeName,
    statusUpdate,
    status,
    customerReceipt,
  } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: "Recipient email (toEmail) is required" });
  }

  let subject = `🚨 New Order #${orderId} Received at ${storeName}!`;
  if (statusUpdate) {
    if (status && status.toLowerCase() === 'delivered') {
      subject = `🎉 Order Delivered! Thank You for Shopping with ${storeName}`;
    } else {
      subject = `🔔 Order #${orderId} Update from ${storeName}: ${status ? status.toUpperCase() : 'UPDATED'}`;
    }
  } else if (customerReceipt) {
    subject = `✅ Order Confirmed! #${orderId} from ${storeName}`;
  }

  let htmlContent = "";

  if (statusUpdate) {
    const isDelivered = status && status.toLowerCase() === 'delivered';
    const itemsListHtml = Array.isArray(items)
      ? items
          .map(
            (item: any) =>
              `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${item.productName || item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price * item.quantity}</td>
              </tr>`
          )
          .join("")
      : "";

    if (isDelivered) {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #059669; margin-bottom: 20px;">🎉 Order Delivered Successfully!</h2>
          <p>Dear <strong>${customerName || 'Customer'}</strong>,</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 6px 0; font-size: 15px; color: #047857; font-weight: bold;">
              ❤️ Thank you for shopping with us at Manokamna Apartments Society Marketplace!
            </p>
            <p style="margin: 0; font-size: 14px; color: #166534;">
              We are delighted to confirm that your order <strong>#${orderId}</strong> from <strong>${storeName}</strong> has been successfully delivered to <strong>${deliveryAddress}</strong>.
            </p>
          </div>
          <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 12px; margin: 15px 0;">
            <p style="margin: 0 0 4px 0;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin: 0 0 4px 0;"><strong>Store:</strong> ${storeName}</p>
            <p style="margin: 0 0 4px 0;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
            <p style="margin: 0;"><strong>Status:</strong> DELIVERED ✅</p>
          </div>
          ${itemsListHtml ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td colspan="3" style="padding: 12px 8px 8px 8px; text-align: right;">Total Amount Paid:</td>
                <td style="padding: 12px 8px 8px 8px; text-align: right; color: #059669;">₹${totalAmount}</td>
              </tr>
            </tfoot>
          </table>
          ` : `<p><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>`}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #666; text-align: center;">Thank you for shopping local with Manokamna Apartments Marketplace!</p>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Order Status Updated</h2>
          <p>Dear Customer,</p>
          <p>Your order <strong>#${orderId}</strong> from <strong>${storeName}</strong> has been updated to:</p>
          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-weight: bold; font-size: 1.1em; text-align: center; color: #1e1b4b; text-transform: uppercase; margin: 20px 0;">
            ${status ? status.replace('_', ' ') : 'UPDATED'}
          </div>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #666; text-align: center;">Thank you for shopping with us!</p>
        </div>
      `;
    }
  } else if (customerReceipt) {
    const itemsListHtml = Array.isArray(items)
      ? items
          .map(
            (item: any) =>
              `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${item.productName || item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price * item.quantity}</td>
              </tr>`
          )
          .join("")
      : "";

    htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #059669; margin-bottom: 20px;">Order Confirmed! 🛒</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your order <strong>#${orderId}</strong> with <strong>${storeName}</strong> has been successfully placed and confirmed!</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 12px; margin: 15px 0;">
          <p style="margin: 0 0 5px 0;"><strong>Store:</strong> ${storeName}</p>
          <p style="margin: 0 0 5px 0;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
          <p style="margin: 0;"><strong>Payment Method:</strong> PAY After Delivery (Doorstep)</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; font-size: 1.1em;">
              <td colspan="3" style="padding: 12px 8px 8px 8px; text-align: right;">Total Amount:</td>
              <td style="padding: 12px 8px 8px 8px; text-align: right; color: #059669;">₹${totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Order Status</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 0.8em; color: #666; text-align: center;">Manokamna Apartments Marketplace Automated Receipt</p>
      </div>
    `;
  } else {
    const itemsListHtml = Array.isArray(items)
      ? items
          .map(
            (item: any) =>
              `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${item.productName || item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">₹${item.price * item.quantity}</td>
              </tr>`
          )
          .join("")
      : "";

    htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #e11d48; margin-bottom: 20px;">New Order Placed!</h2>
        <p>Hello <strong>${storeName} Shopkeeper</strong>,</p>
        <p>You have received a new order <strong>#${orderId}</strong>. Here are the details:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #e11d48; padding: 12px; margin: 15px 0;">
          <p style="margin: 0 0 5px 0;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin: 0 0 5px 0;"><strong>Mobile:</strong> ${customerMobile}</p>
          <p style="margin: 0;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; font-size: 1.1em;">
              <td colspan="3" style="padding: 12px 8px 8px 8px; text-align: right;">Total Amount:</td>
              <td style="padding: 12px 8px 8px 8px; text-align: right; color: #e11d48;">₹${totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Store Portal</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 0.8em; color: #666; text-align: center;">Manokamna Apartments Marketplace Notification Service</p>
      </div>
    `;
  }

  const transporter = getEmailTransporter();
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@manokamna-marketplace.com";

  if (!transporter) {
    console.log(`[SIMULATED EMAIL ALERT]
=========================================
TO: ${toEmail}
FROM: ${fromEmail}
SUBJECT: ${subject}
BODY: (HTML rendered content sent in email containing details of Order #${orderId})
=========================================`);
    return res.json({
      success: true,
      simulated: true,
      message: "SMTP not configured. Email logged to console successfully.",
      orderId,
    });
  }

  try {
    await transporter.sendMail({
      from: `"Manokamna Marketplace" <${fromEmail}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Order Email notification successfully sent to ${toEmail}`);
    return res.json({ success: true, message: "Email sent successfully", orderId });
  } catch (error: any) {
    console.warn("⚠️ SMTP sending error (falling back to simulated console email log):", error.message || error);
    console.log(`[SIMULATED EMAIL ALERT FALLBACK]
=========================================
TO: ${toEmail}
FROM: ${fromEmail}
SUBJECT: ${subject}
BODY: (HTML rendered content for Order #${orderId})
=========================================`);
    return res.json({
      success: true,
      simulated: true,
      message: "SMTP authentication or connection failed. Email logged to console fallback.",
      orderId,
    });
  }
});

// FCM Push Notification Endpoint
app.post("/api/send-fcm", async (req, res) => {
  const { userId, title, message, data, fcmToken } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ error: "userId, title, and message are required" });
  }

  // Retrieve user's FCM token from Firestore if not provided directly
  let targetToken = fcmToken;
  if (!targetToken && isFcmInitialized) {
    try {
      const firestoreDb = getFirestore();
      const userDoc = await firestoreDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
        targetToken = userDoc.data()?.fcmToken || null;
      }
    } catch (err: any) {
      console.warn("Could not retrieve fcmToken from Firestore for user:", userId, err.message);
    }
  }

  if (!targetToken) {
    console.log(`[SIMULATED PUSH NOTIFICATION - NO TOKEN REGISTERED]
=========================================
USER ID: ${userId}
TITLE: ${title}
MESSAGE: ${message}
=========================================`);
    return res.json({
      success: true,
      simulated: true,
      message: `User ${userId} does not have an active FCM token registered. Printed message to server log.`,
    });
  }

  if (targetToken.startsWith("fcm_simulated_") || !isFcmInitialized) {
    console.log(`[SIMULATED PUSH NOTIFICATION - SENT]
=========================================
TO TOKEN: ${targetToken}
USER ID: ${userId}
TITLE: ${title}
MESSAGE: ${message}
=========================================`);
    return res.json({
      success: true,
      simulated: true,
      message: `Push notification simulated successfully for token: ${targetToken}`,
    });
  }

  try {
    const payload = {
      token: targetToken,
      notification: {
        title,
        body: message,
      },
      data: data || {},
    };

    const response = await getMessaging().send(payload);
    console.log(`✅ FCM Push Notification sent to real device token successfully: ${response}`);
    return res.json({
      success: true,
      messageId: response,
    });
  } catch (error: any) {
    console.error("❌ Failed to send FCM Push Notification via Admin SDK, falling back to simulated:", error.message);
    console.log(`[SIMULATED PUSH NOTIFICATION - FALLBACK]
=========================================
TO TOKEN: ${targetToken}
USER ID: ${userId}
TITLE: ${title}
MESSAGE: ${message}
=========================================`);
    return res.json({
      success: true,
      simulated: true,
      error: error.message,
    });
  }
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

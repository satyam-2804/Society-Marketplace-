// Firebase Cloud Messaging (FCM) Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBc-hwH_PI8RYfZSgDHth13JmZdSk4Zvis",
  authDomain: "excellent-star-nds98.firebaseapp.com",
  projectId: "excellent-star-nds98",
  storageBucket: "excellent-star-nds98.firebasestorage.app",
  messagingSenderId: "101329829320",
  appId: "1:101329829320:web:2434dc95ca1dfed9bc14fd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Order Update!';
  const notificationOptions = {
    body: payload.notification?.body || 'Check your Manokamna Marketplace app for details.',
    icon: payload.notification?.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isBrowser = typeof window !== "undefined";

let appPromise = null;
const getFirebaseApp = async () => {
  if (!isBrowser) return null;
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const { initializeApp, getApps } = await import("firebase/app");
        return !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      } catch (err) {
        console.error("[FCM] Failed to initialize Firebase app:", err);
        return null;
      }
    })();
  }
  return appPromise;
};

export const requestForToken = async () => {
  if (!isBrowser || typeof window.navigator === "undefined") return null;
  try {
    const app = await getFirebaseApp();
    if (!app) return null;

    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission is:", permission, "— cannot get token.");
      return null;
    }

    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of existingRegistrations) {
      if (reg.active?.scriptURL?.includes("firebase-messaging-sw")) {
        await reg.unregister();
      }
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return currentToken || null;
  } catch (err) {
    console.error("[FCM] Error getting token:", err?.message || err, err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!isBrowser) return;
    getFirebaseApp().then((app) => {
      if (!app) return;
      import("firebase/messaging").then(({ getMessaging, onMessage }) => {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }).catch(err => console.error(err));
    });
  });

export default null;

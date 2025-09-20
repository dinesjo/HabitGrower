// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";
import { redirect } from "react-router-dom";
import { fetchFcmToken } from "./services/fetchFcmToken";
import { showSnackBar } from "./utils/helpers";

const firebaseConfig = {
  apiKey: "AIzaSyDMfCeJUzcBqHpfdfDbi_KQ4KIzmQuwOMs",
  authDomain: "habitgrower.firebaseapp.com",
  databaseURL: "https://habitgrower-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "habitgrower",
  storageBucket: "habitgrower.appspot.com",
  messagingSenderId: "691357820339",
  appId: "1:691357820339:web:7d043f04ec49fbb04417c6",
  measurementId: "G-JWYJH25B7E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const auth = getAuth();

// Initialize messaging conditionally - iOS Safari doesn't support it in all contexts
export let messaging: ReturnType<typeof getMessaging> | null = null;

// Enhanced iOS Safari detection for both mobile and desktop
function isIOSSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent);
  const isChrome = /chrome|crios|fxios|edgios/.test(userAgent);
  
  // Mobile Safari detection
  if (isIOS && isSafari && !isChrome) {
    return true;
  }
  
  // Additional mobile Safari checks
  if (isIOS && 'standalone' in navigator) {
    return true;
  }
  
  // Check for specific mobile Safari patterns
  if (/iphone.*safari/.test(userAgent) || /ipad.*safari/.test(userAgent)) {
    return true;
  }
  
  return false;
}

// Additional mobile-specific detection
function isMobileBrowser(): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
}

try {
  // More conservative approach for mobile browsers, especially iOS
  const shouldInitializeMessaging = 
    'serviceWorker' in navigator && 
    'Notification' in window && 
    !isIOSSafari() && 
    !isMobileBrowser() && // Skip messaging on ALL mobile browsers for now
    typeof navigator.serviceWorker.register === 'function' &&
    window.location.protocol === 'https:'; // Require HTTPS
  
  if (shouldInitializeMessaging) {
    messaging = getMessaging();
    
    if (Notification.permission === "granted") {
      fetchFcmToken();
    }
    console.log('Firebase messaging initialized successfully');
  } else {
    console.log('Firebase messaging skipped:', {
      isIOSSafari: isIOSSafari(),
      isMobile: isMobileBrowser(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotification: 'Notification' in window,
      isHTTPS: window.location.protocol === 'https:',
      userAgent: navigator.userAgent
    });
  }
} catch (error) {
  console.error('Firebase messaging initialization failed:', error);
  console.log('Browser details:', {
    userAgent: navigator.userAgent,
    isIOSSafari: isIOSSafari(),
    isMobile: isMobileBrowser()
  });
  messaging = null;
}

export const database = getDatabase(app);

/**
 * Retrieves the current user from the authentication state.
 * @returns A promise that resolves with the user object if the user is signed in, or null if the user is not signed in.
 */
export async function getUser() {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          // User is signed in
          resolve(user);
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
}

export async function signOut() {
  await auth.signOut();
  showSnackBar("Signed out successfully!", "success");
  return redirect("/profile/signin");
}

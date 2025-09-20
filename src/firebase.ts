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

try {
  // Check if messaging is supported (fails on iOS Safari in many cases)
  if ('serviceWorker' in navigator && 'Notification' in window) {
    messaging = getMessaging();
    
    if (Notification.permission === "granted") {
      fetchFcmToken();
    }
  }
} catch (error) {
  console.warn('Firebase messaging not supported on this device/browser:', error);
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

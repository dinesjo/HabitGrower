// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import { redirect } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyDMfCeJUzcBqHpfdfDbi_KQ4KIzmQuwOMs",
  authDomain: "habitgrower.firebaseapp.com",
  projectId: "habitgrower",
  storageBucket: "habitgrower.appspot.com",
  messagingSenderId: "691357820339",
  appId: "1:691357820339:web:7d043f04ec49fbb04417c6",
  measurementId: "G-JWYJH25B7E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

export async function getUser() {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        setTimeout(() => {
          if (user) {
            // User is signed in
            resolve(user);
          } else {
            resolve(null);
          }
        }, 500); // Delay of 2 seconds
      },
      reject
    );
  });
}

export async function signOut() {
  await auth.signOut();
  return redirect("/profile/");
}

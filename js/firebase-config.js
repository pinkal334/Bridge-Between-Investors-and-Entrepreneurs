// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArmJ6G0JB_GMHMeYZLPWXFFnvlB9ctRMs",
  authDomain: "bridgeproject-96cb6.firebaseapp.com",
  projectId: "bridgeproject-96cb6",
  storageBucket: "bridgeproject-96cb6.appspot.com",
  messagingSenderId: "989715062982",
  appId: "1:989715062982:web:c0619a1ba452b21405b7c7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db to use in other files
export { auth, db };
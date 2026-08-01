import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCFrKB0fVX3T3fCKeS51VFYFZsBpGakPKQ",
  authDomain: "fbs-bakery-world.firebaseapp.com",
  projectId: "fbs-bakery-world",
  storageBucket: "fbs-bakery-world.firebasestorage.app",
  messagingSenderId: "101297846532",
  appId: "1:101297846532:web:14a7e0f18b512a30b7b851",
  measurementId: "G-8GW49CG3G2",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

export { app, auth, googleProvider, facebookProvider, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult };


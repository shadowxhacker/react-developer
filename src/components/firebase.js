import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyASZ0qTzWuNZgq-ekYxB-WM1f_W3DtJU64",
  authDomain: "myapp-3a874.firebaseapp.com",
  databaseURL: "https://myapp-3a874-default-rtdb.firebaseio.com",
  projectId: "myapp-3a874",
  storageBucket: "myapp-3a874.appspot.com",
  messagingSenderId: "430236087961",
  appId: "1:430236087961:web:c2500450fbb67fee9b6a08",
  measurementId: "G-3N351416FX"
};

// Initialize Firebase app (only if no other app is initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { auth, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setDoc, getDoc, doc };
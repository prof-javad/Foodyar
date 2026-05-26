import {
  initializeApp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  CACHE_SIZE_UNLIMITED

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYM1hZ94IPgGxIbkzrUB3Lgz9WKJ08a9Y",
  authDomain: "foodyar-bb4ad.firebaseapp.com",
  projectId: "foodyar-bb4ad",
  storageBucket: "foodyar-bb4ad.firebasestorage.app",
  messagingSenderId: "802950674478",
  appId: "1:802950674478:web:63a336fc78ce53357d87bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// تنظیم persistence برای ذخیره لاگین در localStorage
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("✅ Persistence set to browserLocalPersistence");
  } catch (err) {
    console.warn("Persistence error:", err);
  }
})();

// فعال کردن قابلیت آفلاین (ذخیره در IndexedDB)
enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence');
  }
});

export {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  auth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
};

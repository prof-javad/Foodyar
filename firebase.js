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
  disableNetwork
};


import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

await setPersistence(auth, browserLocalPersistence);

export {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};

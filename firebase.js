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

  doc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey:
  "AIzaSyCYM1hZ94IPgGxIbkzrUB3Lgz9WKJ08a9Y",

  authDomain:
  "foodyar-bb4ad.firebaseapp.com",

  projectId:
  "foodyar-bb4ad",

  storageBucket:
  "foodyar-bb4ad.firebasestorage.app",

  messagingSenderId:
  "802950674478",

  appId:
  "1:802950674478:web:63a336fc78ce53357d87bf"

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

export {

  db,

  collection,

  addDoc,

  getDocs,

  deleteDoc,

  updateDoc,

  doc

};

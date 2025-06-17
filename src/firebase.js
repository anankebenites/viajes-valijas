// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCLGy4qILvoCdrpuOniyjSG0zChhvus-sw",
  authDomain: "viajes-valijas.firebaseapp.com",
  databaseURL: "https://viajes-valijas-default-rtdb.firebaseio.com",
  projectId: "viajes-valijas",
  storageBucket: "viajes-valijas.appspot.com",
  messagingSenderId: "599999874204",
  appId: "1:599999874204:web:59eb7e4095f1a1abc01959"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue };

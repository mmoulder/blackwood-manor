import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAyqIL0oq_0PacB28-wm1b3Sb-9htPpTjU",
  authDomain: "dda-team-building.firebaseapp.com",
  databaseURL: "https://dda-team-building-default-rtdb.firebaseio.com/",
  projectId: "dda-team-building",
  storageBucket: "dda-team-building.firebasestorage.app",
  messagingSenderId: "382483754461",
  appId: "1:382483754461:web:1fee2791d71500f58d9a34"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, onValue, update };

// firebase.ts (or firebase.js)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDf6mWjzzgsmhOqUE4CYjGwjLktbNa7KEA",
  authDomain: "kanban-board-fc705.firebaseapp.com",
  databaseURL: "https://kanban-board-fc705-default-rtdb.firebaseio.com",
  projectId: "kanban-board-fc705",
  storageBucket: "kanban-board-fc705.appspot.com",
  messagingSenderId: "851738181435",
  appId: "1:851738181435:web:478cef19906f600b7c811e",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);  // Initialize Firestore

export { auth, database,firestore };

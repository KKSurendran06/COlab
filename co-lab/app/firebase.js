// app/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRYmeOcrEMAKVwJRMql3cYNFQvuu-rYj4",
  authDomain: "colab-website-44898.firebaseapp.com",
  projectId: "colab-website-44898",
  storageBucket: "colab-website-44898.firebasestorage.app",
  messagingSenderId: "925791201806",
  appId: "1:925791201806:web:43b3622a4a2eef61e86a5f",
  databaseURL: "https://colab-website-44898-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export { auth };
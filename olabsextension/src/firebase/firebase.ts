import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDholc7OSspaboA-4DdFmk-MzaT_8AFqtw",
  authDomain: "colabai-f2eac.firebaseapp.com",
  projectId: "colabai-f2eac",
  storageBucket: "colabai-f2eac.firebasestorage.app",
  messagingSenderId: "915981542166",
  appId: "1:915981542166:web:f49bd7a37b0794414d6637"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqZJcZ1sepOVQvhUByCnihOkc7BMJqmg8",
  authDomain: "test-ecampus.firebaseapp.com",
  projectId: "test-ecampus",
  storageBucket: "test-ecampus.appspot.com",
  messagingSenderId: "895593395043",
  appId: "1:895593395043:web:f5669572c2a5c185f1d956",
  measurementId: "G-Z000YLK6QQ"
};

  

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export const db = getFirestore(app)

export default app;
  
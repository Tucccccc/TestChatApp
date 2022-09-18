import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getStorage} from 'firebase/storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtai2ZhWCiOSfF9IBtStGfsa7gYf-fUnw",
  authDomain: "test-chat-app-e7df0.firebaseapp.com",
  projectId: "test-chat-app-e7df0",
  storageBucket: "test-chat-app-e7df0.appspot.com",
  messagingSenderId: "1066351551909",
  appId: "1:1066351551909:web:3a59c6d84952cf0e63b44c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
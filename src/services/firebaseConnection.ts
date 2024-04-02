import { initializeApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSVgSCT6HC2SRpr456BRMfN1zAqbi6Nv8",
  authDomain: "webcarros-c0fd4.firebaseapp.com",
  projectId: "webcarros-c0fd4",
  storageBucket: "webcarros-c0fd4.appspot.com",
  messagingSenderId: "732802106864",
  appId: "1:732802106864:web:e88c2404dce83ab70fc935"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage};
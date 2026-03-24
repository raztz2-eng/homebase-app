import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// ── Firebase Config ───────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA49xgUuuCULMLiLAiR53uq2K-H9DpW7Vg",
  authDomain: "homebase-app-7445e.firebaseapp.com",
  projectId: "homebase-app-7445e",
  storageBucket: "homebase-app-7445e.firebasestorage.app",
  messagingSenderId: "952444613694",
  appId: "1:952444613694:web:a3d12c94b35c493d110d6f",
  measurementId: "G-1CHLN0JRN9",
};

// ── Initialize ────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Collection names ──────────────────────────────────────────
export const COL = {
  shopping: "shopping",
  tasks:    "tasks",
  kelly:    "kelly",
  health:   "health",
};

// ── Listen to a collection in real-time ──────────────────────
// Returns unsubscribe function — call it on component unmount
export const listenCol = (colName, callback) => {
  const ref = collection(db, colName);
  return onSnapshot(ref, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// ── Save / update a single document ──────────────────────────
export const saveDoc = async (colName, id, data) => {
  const ref = doc(db, colName, String(id));
  await setDoc(ref, { ...data, _updatedAt: serverTimestamp() }, { merge: true });
};

// ── Delete a document ─────────────────────────────────────────
export const deleteDocById = async (colName, id) => {
  await deleteDoc(doc(db, colName, String(id)));
};

// ── Save entire array (replaces only provided items) ─────────
export const saveAll = async (colName, items) => {
  await Promise.all(
    items.map((item) =>
      setDoc(
        doc(db, colName, String(item.id)),
        { ...item, _updatedAt: serverTimestamp() },
        { merge: true }
      )
    )
  );
};

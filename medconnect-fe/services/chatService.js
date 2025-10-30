import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";

export function roomCollection(roomId) {
  return collection(db, "vc_rooms", String(roomId), "messages");
}

export async function sendChatMessage(roomId, { senderId, senderName, senderRole, text }) {
  if (!text || !roomId) return;
  await addDoc(roomCollection(roomId), {
    senderId: senderId || null,
    senderName: senderName || null,
    senderRole: senderRole || null,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeRoomMessages(roomId, cb) {
  if (!roomId) return () => {};
  const q = query(roomCollection(roomId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    cb(items);
  });
}



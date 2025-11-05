import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, setDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";

export function roomCollection(roomId) {
  return collection(db, "vc_rooms", String(roomId), "messages");
}

export async function sendChatMessage(roomId, { senderId, senderName, senderRole, text }) {
  if (!text || !roomId) return;
  try {
    await addDoc(roomCollection(roomId), {
      senderId: senderId || null,
      senderName: senderName || null,
      senderRole: senderRole || null,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("[Firestore] sendChatMessage error:", e);
    throw e;
  }
}

// Image messaging removed per request; text-only chat remains

export function subscribeRoomMessages(roomId, cb) {
  if (!roomId) return () => {};
  const q = query(roomCollection(roomId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = [];
      snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      cb(items);
    },
    (error) => {
      console.error("[Firestore] subscribeRoomMessages error:", error);
    }
  );
}

// Presence management: mark doctor/patient online status in room
function presenceDoc(roomId, role) {
  const r = role === "doctor" ? "doctor" : "patient";
  return doc(db, "vc_rooms", String(roomId), "presence", r);
}

export async function setPresence(roomId, role, online) {
  if (!roomId) return;
  try {
    await setDoc(presenceDoc(roomId, role), { online: !!online, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error("[Firestore] setPresence error:", e);
  }
}

export async function cleanupRoomIfEmpty(roomId) {
  try {
    const dSnap = await getDoc(presenceDoc(roomId, "doctor"));
    const pSnap = await getDoc(presenceDoc(roomId, "patient"));
    const dOnline = !!(dSnap.exists() && dSnap.data()?.online);
    const pOnline = !!(pSnap.exists() && pSnap.data()?.online);
    if (!dOnline && !pOnline) {
      // delete all messages in this room
      const msgs = await getDocs(roomCollection(roomId));
      const deletions = [];
      msgs.forEach((m) => deletions.push(deleteDoc(m.ref)));
      await Promise.all(deletions);
      // optionally clear presence docs as well
      if (dSnap.exists()) await deleteDoc(dSnap.ref);
      if (pSnap.exists()) await deleteDoc(pSnap.ref);
      console.log(`[Firestore] Room ${roomId} cleaned up (messages + presence)`);
    }
  } catch (e) {
    console.error("[Firestore] cleanupRoomIfEmpty error:", e);
  }
}



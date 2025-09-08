import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/FirebaseConfig";

export interface Message {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
}

export function useMessages(projectId: string, channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // lắng nghe realtime tin nhắn
  useEffect(() => {
    if (!projectId || !channelId) return;

    const ref = collection(
      db,
      "projects",
      projectId,
      "discussions",
      channelId,
      "messages"
    );
    const q = query(ref, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Message)
      );
      setMessages(data);
      setLoading(false);
    });

    return () => unsub();
  }, [projectId, channelId]);

  // gửi tin nhắn
  const sendMessage = useCallback(
    async (userId: string, text: string) => {
      if (!text.trim()) return;
      const ref = collection(
        db,
        "projects",
        projectId,
        "discussions",
        channelId,
        "messages"
      );
      await addDoc(ref, {
        userId,
        text,
        createdAt: serverTimestamp(),
      });
    },
    [projectId, channelId]
  );

  return { messages, loading, sendMessage };
}

import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/services/FirebaseConfig";

export interface Channel {
  id: string;
  name: string;
  type: "info" | "chat" | "voice";
  createdAt: any;
}

export function useChannels(projectId: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const ref = collection(db, "projects", projectId, "discussions");
    const q = query(ref, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Channel)
      );
      setChannels(data);
      setLoading(false);
    });

    return () => unsub();
  }, [projectId]);

  const addChannel = useCallback(
    async (name: string, type: "info" | "chat") => {
      if (!name.trim()) return;
      const ref = collection(db, "projects", projectId, "discussions");
      await addDoc(ref, {
        name,
        type,
        createdAt: serverTimestamp(),
      });
    },
    [projectId]
  );

  const updateChannel = useCallback(
    async (id: string, name: string) => {
      const ref = doc(db, "projects", projectId, "discussions", id);
      await updateDoc(ref, { name });
    },
    [projectId]
  );

  const deleteChannel = useCallback(
    async (id: string) => {
      const ref = doc(db, "projects", projectId, "discussions", id);
      await deleteDoc(ref);
    },
    [projectId]
  );

  return { channels, loading, addChannel, updateChannel, deleteChannel };
}

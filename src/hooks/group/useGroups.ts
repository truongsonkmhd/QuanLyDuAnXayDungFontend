// src/hooks/group/useGroups.ts
import { useEffect, useState } from "react";
import { db } from "@/services/FirebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  leader: string;
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "groups"));
    const data = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Group[];
    setGroups(data);
    setLoading(false);
  };

  const addGroup = async (group: Omit<Group, "id">) => {
    await addDoc(collection(db, "groups"), group);
    await fetchGroups();
  };

  const updateGroup = async (id: string, data: Partial<Group>) => {
    const ref = doc(db, "groups", id);
    await updateDoc(ref, data);
    await fetchGroups();
  };

  const deleteGroup = async (id: string) => {
    const ref = doc(db, "groups", id);
    await deleteDoc(ref);
    await fetchGroups();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    addGroup,
    updateGroup,
    deleteGroup,
    refresh: fetchGroups,
  };
}

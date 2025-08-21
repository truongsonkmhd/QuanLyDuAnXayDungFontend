// hooks/useMilestones.ts
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { milestone } from "@/types/project";
import { db } from "@/services/FirebaseConfig";

export function useMilestones(projectId: string) {
    const [milestones, setMilestones] = useState<milestone[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMilestones = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        const projectDoc = doc(db, "projects", projectId);
        const snap = await getDoc(projectDoc);
        if (snap.exists()) {
            setMilestones((snap.data().milestones || []) as milestone[]);
        }
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        fetchMilestones();
    }, [fetchMilestones]);

    const addMilestone = async (newMilestone: milestone) => {
        const projectDoc = doc(db, "projects", projectId);
        const newArr = [...milestones, newMilestone];
        await updateDoc(projectDoc, { milestones: newArr });
        setMilestones(newArr);
    };

    const updateMilestone = async (updated: milestone) => {
        const projectDoc = doc(db, "projects", projectId);
        const newArr = milestones.map(m => (m.id === updated.id ? updated : m));
        await updateDoc(projectDoc, { milestones: newArr });
        setMilestones(newArr);
    };

    const deleteMilestone = async (id: string) => {
        const projectDoc = doc(db, "projects", projectId);
        const newArr = milestones.filter(m => m.id !== id);
        await updateDoc(projectDoc, { milestones: newArr });
        setMilestones(newArr);
    };

    return { milestones, loading, fetchMilestones, addMilestone, updateMilestone, deleteMilestone };
}

import { useEffect, useState } from "react"
import { onSnapshot, collection } from "firebase/firestore"
import { db } from "@/services/FirebaseConfig"
import { DisbursementPlanOnlyProject } from "@/types/disbursement"
import {
    deletePlanOnlyProject,
    updatePlanOnlyProject,
    addPlanOnlyProject,
} from "@/services/disbursement/disbursementService"

export function useDisbursementPlanOnlyProject() {
    const [plans, setPlans] = useState<DisbursementPlanOnlyProject[]>([])
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot(collection(db, "disbursementPlans"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as DisbursementPlanOnlyProject[];
            setPlans(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching plans:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const add = (newPlan: Omit<DisbursementPlanOnlyProject, "id">) => addPlanOnlyProject(newPlan)
    const update = (id: string, updated: Partial<DisbursementPlanOnlyProject>) =>
        updatePlanOnlyProject(id, updated)
    const remove = (id: string) => deletePlanOnlyProject(id)

    return { plans, add, update, remove, isLoading }
}

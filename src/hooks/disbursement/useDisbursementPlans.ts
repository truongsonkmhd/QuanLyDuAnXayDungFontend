import { useEffect, useState } from "react"
import { onSnapshot, collection } from "firebase/firestore"
import { db } from "@/services/FirebaseConfig"
import { DisbursementPlan } from "@/types/disbursement"
import {
    getAllPlans,
    addPlan,
    updatePlan,
    deletePlan,
} from "@/services/disbursement/disbursementService"

export function useDisbursementPlans() {
    const [plans, setPlans] = useState<DisbursementPlan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "disbursement_plans"), async () => {
            const data = await getAllPlans()
            setPlans(data)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const add = (newPlan: Omit<DisbursementPlan, "id">) => addPlan(newPlan)
    const update = (id: string, updated: Partial<DisbursementPlan>) =>
        updatePlan(id, updated)
    const remove = (id: string) => deletePlan(id)

    return { plans, loading, add, update, remove }
}

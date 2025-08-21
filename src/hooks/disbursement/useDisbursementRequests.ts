import { useEffect, useState } from "react"
import { onSnapshot, collection } from "firebase/firestore"
import { db } from "@/services/FirebaseConfig"
import { DisbursementRequest } from "@/types/disbursement"
import {
    getAllRequests,
    addRequest,
    updateRequest,
    deleteRequest,
} from "@/services/disbursement/disbursementService"

export function useDisbursementRequests() {
    const [requests, setRequests] = useState<DisbursementRequest[]>([])
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "disbursement_requests"), async () => {
            const data = await getAllRequests()
            setRequests(data)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const add = (newReq: Omit<DisbursementRequest, "id">) => addRequest(newReq)
    const update = (id: string, updated: Partial<DisbursementRequest>) =>
        updateRequest(id, updated)
    const remove = (id: string) => deleteRequest(id)

    return { requests, isLoading, add, update, remove }
}

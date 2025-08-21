import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore"
import { db } from "../FirebaseConfig"
import {
    DisbursementItem,
    DisbursementRequest,
    PlanItem,
    DisbursementPlan,
    DisbursementPlanOnlyProject,
} from "@/types/disbursement"

// ------------------ Collections ------------------
const disbursementRequestCollection = collection(db, "disbursement_requests")
const disbursementPlanCollection = collection(db, "disbursement_plans")
const disbursementPlanOnlyProjectCollection = collection(db, "disbursement_plan_only_project")

// ------------------ DISBURSEMENT PLAN ------------------
export const getAllPlans = async (): Promise<DisbursementPlan[]> => {
    const data = await getDocs(disbursementPlanCollection)
    return data.docs.map((d) => ({ ...d.data(), id: d.id } as DisbursementPlan))
}

export const addPlan = async (newPlan: Omit<DisbursementPlan, "id">) => {
    await addDoc(disbursementPlanCollection, newPlan)
}

export const updatePlan = async (id: string, updated: Partial<DisbursementPlan>) => {
    const planDoc = doc(db, "disbursement_plans", id)
    await updateDoc(planDoc, updated)
}

export const deletePlan = async (id: string) => {
    const planDoc = doc(db, "disbursement_plans", id)
    await deleteDoc(planDoc)
}

// ------------------ DISBURSEMENT PLANOnly project ------------------
export const getAllPlanOnlyProject = async (): Promise<DisbursementPlanOnlyProject[]> => {
    const data = await getDocs(disbursementPlanOnlyProjectCollection)
    return data.docs.map((d) => ({ ...d.data(), id: d.id } as DisbursementPlanOnlyProject))
}

export const addPlanOnlyProject = async (newPlan: Omit<DisbursementPlanOnlyProject, "id">) => {
    await addDoc(disbursementPlanOnlyProjectCollection, newPlan)
}

export const updatePlanOnlyProject = async (id: string, updated: Partial<DisbursementPlanOnlyProject>) => {
    const planDoc = doc(db, "disbursement_plan_only_project", id)
    await updateDoc(planDoc, updated)
}

export const deletePlanOnlyProject = async (id: string) => {
    const planDoc = doc(db, "disbursement_plan_only_project", id)
    await deleteDoc(planDoc)
}

// ------------------ DISBURSEMENT REQUEST ------------------
export const getAllRequests = async (): Promise<DisbursementRequest[]> => {
    const data = await getDocs(disbursementRequestCollection)
    return data.docs.map((d) => ({ ...d.data(), id: d.id } as DisbursementRequest))
}

export const addRequest = async (newReq: Omit<DisbursementRequest, "id">) => {
    await addDoc(disbursementRequestCollection, newReq)
}

export const updateRequest = async (id: string, updated: Partial<DisbursementRequest>) => {
    const reqDoc = doc(db, "disbursement_requests", id)
    await updateDoc(reqDoc, updated)
}

export const deleteRequest = async (id: string) => {
    const reqDoc = doc(db, "disbursement_requests", id)
    await deleteDoc(reqDoc)
}

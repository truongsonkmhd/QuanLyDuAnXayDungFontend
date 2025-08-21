import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore"
import { db } from "./FirebaseConfig.ts";
import { milestone, Project, ProjectTemplate } from "@/types/project"  // Đảm bảo đã định nghĩa các kiểu này

// Collections
const projectCollection = collection(db, "projects")
const projectTemplateCollection = collection(db, "projects_template")

// Lấy toàn bộ template dự án
export const getAllProjectsTemplate = async (): Promise<ProjectTemplate[]> => {
  const data = await getDocs(projectTemplateCollection)
  return data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  } as ProjectTemplate))
}

// Thêm sửa xóa milestones trong dự án
// Thêm milestone mới
export const addMilestone = async (projectId: string, newMilestone: milestone): Promise<void> => {
  const projectDoc = doc(db, "projects", projectId)
  await updateDoc(projectDoc, {
    milestones: arrayUnion(newMilestone)
  })
}

// Xoá milestone theo object
export const deleteMilestone = async (projectId: string, milestoneToDelete: milestone): Promise<void> => {
  const projectDoc = doc(db, "projects", projectId)
  await updateDoc(projectDoc, {
    milestones: arrayRemove(milestoneToDelete)
  })
}


// Cập nhật milestone (cần load toàn bộ mảng, sửa, rồi ghi lại)
export const updateMilestone = async (projectId: string, updatedMilestone: milestone): Promise<void> => {
  const projectDoc = doc(db, "projects", projectId)

  // Lấy dữ liệu dự án hiện tại
  const projectSnap = await getDoc(projectDoc)
  if (!projectSnap.exists()) return

  const projectData = projectSnap.data()
  const milestones = (projectData.milestones || []) as milestone[]

  // Tìm và cập nhật milestone theo id
  const newMilestones = milestones.map(m =>
    m.id === updatedMilestone.id ? updatedMilestone : m
  )

  await updateDoc(projectDoc, { milestones: newMilestones })
}



// Lấy toàn bộ dự án
export const getAllProjects = async (): Promise<Project[]> => {
  const data = await getDocs(projectCollection)
  return data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  } as Project))
}

// Thêm dự án mới
export const addProject = async (newProject: Omit<Project, 'id'>): Promise<void> => {
  await addDoc(projectCollection, newProject)
}

// Cập nhật dự án
export const updateProject = async (
  id: string,
  updatedProject: Partial<Project>
): Promise<void> => {
  const projectDoc = doc(db, "projects", id)
  await updateDoc(projectDoc, updatedProject)
}

// Xoá dự án
export const deleteProject = async (id: string): Promise<void> => {
  const projectDoc = doc(db, "projects", id)
  await deleteDoc(projectDoc)
}

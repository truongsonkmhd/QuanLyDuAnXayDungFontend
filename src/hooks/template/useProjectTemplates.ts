import { useEffect, useState } from "react";
import { db } from "@/services/FirebaseConfig"; // file cấu hình Firebase
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ProjectTemplate } from "@/types/project";

export function useProjectTemplates() {
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTemplates = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "projectTemplates"));
    const data = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as ProjectTemplate[];
    setProjectTemplates(data);
    setLoading(false);
  };

  const addTemplate = async (template: Omit<ProjectTemplate, "id">) => {
    await addDoc(collection(db, "projectTemplates"), {
      ...template,
      createdAt: new Date(),
    });
    await fetchTemplates();
  };

  const updateTemplate = async (id: string, data: Partial<ProjectTemplate>) => {
    const ref = doc(db, "projectTemplates", id);
    await updateDoc(ref, { ...data, updatedAt: new Date() });
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const ref = doc(db, "projectTemplates", id);
    await deleteDoc(ref);
    await fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    projectTemplates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates,
  };
}

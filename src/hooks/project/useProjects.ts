import { useEffect, useState } from "react";
import { getAllProjects } from "@/services/ProjectService";
import { Project } from "@/types/project";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getAllProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getById = (id: string): Project | undefined =>
    projects.find((p) => p.id === id);

  return { getById, projects, loading, refetch: fetchProjects };
};

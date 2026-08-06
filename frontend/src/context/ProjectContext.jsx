import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(
    localStorage.getItem('currentProjectId') || ''
  );
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects', authHeader);
      setProjects(res.data);

      // If no project is selected yet, or the saved one no longer exists, pick the first
      const stillExists = res.data.some((p) => p._id === currentProjectId);
      if (!stillExists && res.data.length > 0) {
        setCurrentProjectId(res.data[0]._id);
        localStorage.setItem('currentProjectId', res.data[0]._id);
      }
    } catch (err) {
      // Not logged in yet, or no projects — silently ignore here
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const selectProject = (id) => {
    setCurrentProjectId(id);
    localStorage.setItem('currentProjectId', id);
  };

  const createProject = async (name, description) => {
    const res = await api.post('/projects', { name, description }, authHeader);
    setProjects((prev) => [res.data, ...prev]);
    selectProject(res.data._id);
    return res.data;
  };

  const currentProject = projects.find((p) => p._id === currentProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProjectId,
        currentProject,
        loading,
        selectProject,
        createProject,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectContext);
}

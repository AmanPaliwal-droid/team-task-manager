import React, { createContext, useContext, useState, useCallback } from 'react';
import { projectAPI, taskAPI } from '../utils/api';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectAPI.list();
      setProjects(res.data.projects);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    const res = await projectAPI.get(id);
    setCurrentProject(res.data.project);
    setTasks(res.data.tasks);
    return res.data;
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await projectAPI.create(data);
    setProjects((prev) => [res.data.project, ...prev]);
    return res.data.project;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const res = await projectAPI.update(id, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? res.data.project : p)));
    if (currentProject?._id === id) setCurrentProject(res.data.project);
    return res.data.project;
  }, [currentProject]);

  const deleteProject = useCallback(async (id) => {
    await projectAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (currentProject?._id === id) setCurrentProject(null);
  }, [currentProject]);

  const addMember = useCallback(async (projectId, userId) => {
    const res = await projectAPI.addMember(projectId, userId);
    const updated = res.data.project;
    setCurrentProject(updated);
    setProjects((prev) => prev.map((p) => (p._id === projectId ? updated : p)));
    return updated;
  }, []);

  const removeMember = useCallback(async (projectId, userId) => {
    const res = await projectAPI.removeMember(projectId, userId);
    const updated = res.data.project;
    setCurrentProject(updated);
    setProjects((prev) => prev.map((p) => (p._id === projectId ? updated : p)));
    return updated;
  }, []);

  const createTask = useCallback(async (projectId, data) => {
    const res = await taskAPI.create({ ...data, project: projectId });
    const task = res.data.task;
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const res = await taskAPI.update(id, data);
    const task = res.data.task;
    setTasks((prev) => prev.map((t) => (t._id === id ? task : t)));
    setMyTasks((prev) => prev.map((t) => (t._id === id ? task : t)));
    return task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskAPI.delete(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const fetchMyTasks = useCallback(async () => {
    const res = await taskAPI.myTasks();
    setMyTasks(res.data.tasks);
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects, currentProject, tasks, myTasks, loading,
      fetchProjects, fetchProject, createProject, updateProject, deleteProject,
      addMember, removeMember,
      createTask, updateTask, deleteTask, fetchMyTasks,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};

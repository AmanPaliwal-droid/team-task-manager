import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI, projectAPI } from '../utils/api';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        taskAPI.list(),
        projectAPI.list(),
      ]);

      const taskData = Array.isArray(taskRes.data)
        ? taskRes.data
        : taskRes.data.tasks || [];

      const projectData = Array.isArray(projectRes.data)
        ? projectRes.data
        : projectRes.data.projects || [];

      setTasks(taskData);
      setProjects(projectData);
    } catch (error) {
      console.error(
        'Dashboard fetch error:',
        error
      );

      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.status === 'done'
  );

  const pendingTasks = tasks.filter(
    (task) => task.status !== 'done'
  );

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;

    return (
      new Date(task.dueDate) < new Date() &&
      task.status !== 'done'
    );
  });

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>

          <p style={styles.subtitle}>
            Welcome to Team Task Manager
          </p>
        </div>

        <div style={styles.buttonGroup}>
          <Link
            to="/projects"
            style={styles.primaryButton}
          >
            Projects
          </Link>

          <Link to="/my-tasks" style={styles.secondaryButton}>My Tasks</Link>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <h3>Total Tasks</h3>

          <p style={styles.number}>
            {tasks.length}
          </p>
        </div>

        <div style={styles.card}>
          <h3>Completed</h3>

          <p style={styles.number}>
            {completedTasks.length}
          </p>
        </div>

        <div style={styles.card}>
          <h3>Pending</h3>

          <p style={styles.number}>
            {pendingTasks.length}
          </p>
        </div>

        <div style={styles.card}>
          <h3>Overdue</h3>

          <p style={styles.number}>
            {overdueTasks.length}
          </p>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2>Recent Tasks</h2>
          </div>

          {tasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                style={styles.item}
              >
                <div>
                  <h4 style={styles.itemTitle}>
                    {task.title}
                  </h4>

                  <p style={styles.meta}>
                    Status: {task.status}
                  </p>
                </div>

                {task.dueDate && (
                  <span style={styles.date}>
                    {new Date(
                      task.dueDate
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2>Projects</h2>
          </div>

          {projects.length === 0 ? (
            <p>No projects available.</p>
          ) : (
            projects
              .slice(0, 5)
              .map((project) => (
                <div
                  key={project._id}
                  style={styles.item}
                >
                  <div>
                    <h4 style={styles.itemTitle}>
                      {project.name}
                    </h4>

                    <p style={styles.meta}>
                      {project.description ||
                        'No description'}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    background: '#f5f7fb',
    minHeight: '100vh',
  },

  loading: {
    padding: '40px',
    fontSize: '18px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },

  title: {
    fontSize: '32px',
    margin: 0,
  },

  subtitle: {
    color: '#666',
    marginTop: '8px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  primaryButton: {
    background: '#2563eb',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
  },

  secondaryButton: {
    background: '#111827',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },

  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.08)',
  },

  number: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginTop: '12px',
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },

  panel: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.08)',
  },

  panelHeader: {
    marginBottom: '16px',
  },

  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #eee',
  },

  itemTitle: {
    margin: 0,
  },

  meta: {
    marginTop: '6px',
    color: '#666',
    fontSize: '14px',
  },

  date: {
    fontSize: '14px',
    color: '#444',
  },
};
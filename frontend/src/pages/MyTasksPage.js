import React, { useEffect, useState } from 'react';
import {
  taskAPI,
  projectAPI,
} from '../utils/api';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] =
    useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    project: '',
  });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [taskRes, projectRes] =
        await Promise.all([
          taskAPI.myTasks(),      // ← only current user's assigned tasks
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
      console.error('Task page error:', error);
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!form.project) {
      alert("Please select a project.");
      return;
    }

    try {
      const payload = {
        ...form,
        assignee: form.assignee || undefined,
        dueDate: form.dueDate || undefined,
      };
      await taskAPI.create(payload);

      setForm({ title: "", description: "", status: "todo", dueDate: "", project: "" });

      loadData();
    } catch (error) {
      console.error("Create task error:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.delete(id);

      loadData();
    } catch (error) {
      console.error(
        'Delete task error:',
        error
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading tasks...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        Task Management
      </h1>

      <form
        onSubmit={createTask}
        style={styles.form}
      >
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <textarea
          name="description"
          placeholder="Task description"
          value={form.description}
          onChange={handleChange}
          style={styles.textarea}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="project"
          value={form.project}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">
            Select Project
          </option>

          {Array.isArray(projects) &&
            projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
        </select>

        <button
          type="submit"
          style={styles.button}
        >
          Create Task
        </button>
      </form>

      <div style={styles.taskGrid}>
        {!Array.isArray(tasks) ||
        tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              style={styles.card}
            >
              <h3>{task.title}</h3>

              <p>
                {task.description ||
                  'No description'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {task.status}
              </p>

              {task.dueDate && (
                <p>
                  <strong>Due:</strong>{' '}
                  {new Date(
                    task.dueDate
                  ).toLocaleDateString()}
                </p>
              )}

              {task.project && (
                <p>
                  <strong>Project:</strong>{' '}
                  {typeof task.project ===
                  'object'
                    ? task.project.name
                    : 'Assigned'}
                </p>
              )}

              <button
                onClick={() =>
                  deleteTask(task._id)
                }
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        )}
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

  heading: {
    marginBottom: '24px',
  },

  form: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '600px',
    marginBottom: '30px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.08)',
  },

  input: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },

  textarea: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    minHeight: '100px',
  },

  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  taskGrid: {
    display: 'grid',
    gap: '16px',
  },

  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.08)',
  },

  deleteButton: {
    marginTop: '12px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
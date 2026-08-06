import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

const emptyForm = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  deadline: '',
  assignedTo: '',
};
const COLUMNS = ['To Do', 'In Progress', 'Done'];

function Board() {
  const { currentProject, currentProjectId, loading: projectsLoading } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/dashboard', authHeader);
      setProfile(res.data.profile);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchMembers = async () => {
    if (!currentProjectId) return;
    try {
      const res = await api.get(`/projects/${currentProjectId}/members`, authHeader);
      setMembers(res.data);
    } catch (err) {
      // Non-critical
    }
  };

  const fetchTasks = async () => {
    if (!currentProjectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/tasks', { ...authHeader, params: { projectId: currentProjectId } });
      setTasks(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Could not load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const res = await api.put(`/tasks/${editingId}`, form, authHeader);
        setTasks((prev) => prev.map((t) => (t._id === editingId ? res.data : t)));
        setEditingId(null);
      } else {
        const res = await api.post(
          '/tasks',
          { ...form, projectId: currentProjectId },
          authHeader
        );
        setTasks((prev) => [res.data, ...prev]);
      }
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await api.delete(`/tasks/${id}`, authHeader);
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try {
      await api.put(`/tasks/${task._id}`, { ...task, status: newStatus }, authHeader);
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to move task. Please try again.');
    }
  };

  const priorityClass = (priority) => {
    if (priority === 'High') return 'badge badge-high';
    if (priority === 'Medium') return 'badge badge-medium';
    return 'badge badge-low';
  };

  const tasksByStatus = (status) =>
    tasks.filter(
      (t) => t.status === status && t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!projectsLoading && !currentProjectId) {
    return (
      <AppLayout profile={profile}>
        <NoProjectState />
      </AppLayout>
    );
  }

  return (
    <AppLayout profile={profile} onSearch={setSearchTerm}>
      <div className="board-page">
        <div className="board-header">
          <h2>{currentProject?.name || 'Board'}</h2>
          <button
            className="add-task-btn"
            onClick={() => {
              setShowForm((s) => !s);
              if (showForm) handleCancelEdit();
            }}
          >
            + New Task
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {showForm && (
          <form className="task-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
            />
            <div className="task-form-row">
              <select name="status" value={form.status} onChange={handleChange}>
                {COLUMNS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <label className="field-label">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />
            <label className="field-label">Assign To</label>
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
              <option value="" disabled>
                Select a project member
              </option>
              {members.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <div className="task-form-actions">
              <button type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="muted-text">Loading tasks...</p>
        ) : (
          <div className="board-columns">
            {COLUMNS.map((column) => (
              <div className="board-column" key={column}>
                <div className="board-column-header">
                  <h3>{column}</h3>
                  <span className="column-count">{tasksByStatus(column).length}</span>
                </div>

                <div className="board-column-body">
                  {tasksByStatus(column).length === 0 && (
                    <p className="muted-text column-empty">No tasks</p>
                  )}
                  {tasksByStatus(column).map((task) => (
                    <div className="task-card" key={task._id}>
                      <div className="task-card-top">
                        <h4>{task.title}</h4>
                        <span className={priorityClass(task.priority)}>{task.priority}</span>
                      </div>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      {task.assignedTo && (
                        <p className="muted-text task-assignee">
                          Assigned to {task.assignedTo.name}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="muted-text task-deadline">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}

                      <select
                        className="move-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c} value={c}>
                            Move to {c}
                          </option>
                        ))}
                      </select>

                      <div className="task-card-actions">
                        <button className="btn-link" onClick={() => handleEdit(task)}>
                          Edit
                        </button>
                        <button
                          className="btn-link btn-danger"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Board;

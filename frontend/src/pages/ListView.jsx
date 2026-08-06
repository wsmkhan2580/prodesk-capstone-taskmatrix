import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

function ListView() {
  const { currentProject, currentProjectId, loading: projectsLoading } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('deadline');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/dashboard', authHeader).then((res) => setProfile(res.data.profile)).catch(() => navigate('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentProjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/tasks', { ...authHeader, params: { projectId: currentProjectId } })
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const priorityClass = (priority) => {
    if (priority === 'High') return 'badge badge-high';
    if (priority === 'Medium') return 'badge badge-medium';
    return 'badge badge-low';
  };

  const sorted = [...tasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (sortBy === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    }
    return a.title.localeCompare(b.title);
  });

  if (!projectsLoading && !currentProjectId) {
    return (
      <AppLayout profile={profile}>
        <NoProjectState />
      </AppLayout>
    );
  }

  return (
    <AppLayout profile={profile}>
      <div className="page-container">
        <div className="list-view-header">
          <h2>{currentProject?.name || 'List'}</h2>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="deadline">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {loading ? (
          <p className="muted-text">Loading tasks...</p>
        ) : sorted.length === 0 ? (
          <p className="muted-text">No tasks in this project yet.</p>
        ) : (
          <div className="list-table">
            <div className="list-table-head">
              <span>Task</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Deadline</span>
            </div>
            {sorted.map((task) => (
              <div className="list-table-row" key={task._id}>
                <span className="list-title">{task.title}</span>
                <span className="muted-text">{task.assignedTo?.name || 'Unassigned'}</span>
                <span>
                  <span className={priorityClass(task.priority)}>{task.priority}</span>
                </span>
                <span>
                  <span className="status-pill">{task.status}</span>
                </span>
                <span className="muted-text">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ListView;

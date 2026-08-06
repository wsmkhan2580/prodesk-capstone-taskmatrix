import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

function Timeline() {
  const { currentProject, currentProjectId, loading: projectsLoading } = useProjects();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .then((res) =>
        setTasks([...res.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const statusDot = (status) => {
    if (status === 'Done') return 'timeline-dot timeline-dot-done';
    if (status === 'In Progress') return 'timeline-dot timeline-dot-progress';
    return 'timeline-dot timeline-dot-todo';
  };

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
        <h2>Timeline — {currentProject?.name}</h2>
        <p className="muted-text">All tasks in the order they were created.</p>

        {loading ? (
          <p className="muted-text">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="muted-text">No tasks yet.</p>
        ) : (
          <div className="timeline-list">
            {tasks.map((task) => (
              <div className="timeline-item" key={task._id}>
                <span className={statusDot(task.status)} />
                <div className="timeline-content">
                  <div className="timeline-item-top">
                    <strong>{task.title}</strong>
                    <span className="status-pill">{task.status}</span>
                  </div>
                  <p className="muted-text">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                    {task.deadline && ` · Due ${new Date(task.deadline).toLocaleDateString()}`}
                    {task.assignedTo && ` · Assigned to ${task.assignedTo.name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Timeline;

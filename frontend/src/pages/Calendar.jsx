import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

function Calendar() {
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
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const withDeadline = tasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const grouped = withDeadline.reduce((acc, task) => {
    const dateKey = new Date(task.deadline).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  const priorityClass = (priority) => {
    if (priority === 'High') return 'badge badge-high';
    if (priority === 'Medium') return 'badge badge-medium';
    return 'badge badge-low';
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
        <h2>Calendar — {currentProject?.name}</h2>
        <p className="muted-text">Tasks organized by their deadline.</p>

        {loading ? (
          <p className="muted-text">Loading...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="muted-text">No tasks have a deadline set yet.</p>
        ) : (
          <div className="calendar-list">
            {Object.entries(grouped).map(([date, dayTasks]) => (
              <div className="calendar-day-group" key={date}>
                <div className="calendar-date-label">{date}</div>
                <div className="calendar-day-tasks">
                  {dayTasks.map((task) => (
                    <div className="task-card calendar-task-card" key={task._id}>
                      <div className="task-card-top">
                        <h4>{task.title}</h4>
                        <span className={priorityClass(task.priority)}>{task.priority}</span>
                      </div>
                      <span className="status-pill">{task.status}</span>
                      {task.assignedTo && (
                        <p className="muted-text task-assignee">{task.assignedTo.name}</p>
                      )}
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

export default Calendar;

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { projects, selectProject } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
        setStats(res.data.taskStats);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <AppLayout profile={profile}>
      <div className="dashboard-container">
        <h2>Welcome to TaskMatrix, {profile?.name}!</h2>
        <p className="muted-text">
          You have {stats?.total || 0} task{stats?.total === 1 ? '' : 's'} across all projects —{' '}
          {stats?.assignedToMe || 0} assigned to you.
        </p>

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number">{stats?.total || 0}</div>
            <div className="muted-text">Total Tasks</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats?.todo || 0}</div>
            <div className="muted-text">To Do</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats?.inProgress || 0}</div>
            <div className="muted-text">In Progress</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats?.done || 0}</div>
            <div className="muted-text">Done</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/tasks" className="primary-link-btn">
            Go to My Tasks →
          </Link>

          {!profile?.isPro && (
            <Link to="/upgrade" className="primary-link-btn secondary-link-btn">
              Upgrade to Pro →
            </Link>
          )}
        </div>

        <h3 className="dashboard-projects-heading">Your Projects</h3>
        {projects.length === 0 ? (
          <p className="muted-text">
            You don't have any projects yet — create one from the dropdown next to the logo.
          </p>
        ) : (
          <div className="dashboard-project-grid">
            {projects.map((p) => (
              <Link
                key={p._id}
                to="/tasks"
                className="dashboard-project-card"
                onClick={() => selectProject(p._id)}
              >
                <div className="dashboard-project-name">{p.name}</div>
                {p.description && (
                  <div className="muted-text dashboard-project-desc">{p.description}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Dashboard;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

const STATUS_COLORS = { 'To Do': '#9ca3af', 'In Progress': '#f59e0b', Done: '#10b981' };
const PRIORITY_COLORS = { Low: '#059669', Medium: '#d97706', High: '#dc2626' };

function Reports() {
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

  const statusData = ['To Do', 'In Progress', 'Done'].map((status) => ({
    name: status,
    value: tasks.filter((t) => t.status === status).length,
  }));

  const priorityData = ['Low', 'Medium', 'High'].map((priority) => ({
    name: priority,
    count: tasks.filter((t) => t.priority === priority).length,
  }));

  const completedCount = tasks.filter((t) => t.status === 'Done').length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

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
        <h2>Reports — {currentProject?.name}</h2>
        <p className="muted-text">A quick overview of this project's task activity.</p>

        {loading ? (
          <p className="muted-text">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="muted-text">No tasks yet — reports will appear once you add some.</p>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-number">{tasks.length}</div>
                <div className="muted-text">Total Tasks</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{completedCount}</div>
                <div className="muted-text">Completed</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{completionRate}%</div>
                <div className="muted-text">Completion Rate</div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <h4>Tasks by Status</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h4>Tasks by Priority</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count">
                      {priorityData.map((entry) => (
                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default Reports;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

function Team() {
  const { currentProject, currentProjectId, loading: projectsLoading } = useProjects();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMembers = () => {
    if (!currentProjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/projects/${currentProjectId}/members`, authHeader)
      .then((res) => setMembers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/dashboard', authHeader).then((res) => setProfile(res.data.profile)).catch(() => navigate('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const isOwner = currentProject && profile && currentProject.ownerId === profile.id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) return;
    setAdding(true);
    try {
      const res = await api.post(
        `/projects/${currentProjectId}/members`,
        { email: email.trim() },
        authHeader
      );
      setMembers(res.data);
      setMessage(`Added ${email.trim()} to the project.`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member');
    } finally {
      setAdding(false);
    }
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
        <h2>Team — {currentProject?.name}</h2>
        <p className="muted-text">
          Only people in this list can be assigned tasks within this project.
        </p>

        {isOwner && (
          <form className="add-member-form" onSubmit={handleAddMember}>
            <input
              type="email"
              placeholder="Add member by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
        )}

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="muted-text">Loading team members...</p>
        ) : (
          <div className="team-list">
            {members.map((u) => (
              <div className="team-member-card" key={u._id}>
                <div className="sidebar-user-avatar team-avatar">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="sidebar-user-name">{u.name}</div>
                  <div className="muted-text">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Team;

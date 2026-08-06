import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

function Settings() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = () => {
    api
      .get('/dashboard', authHeader)
      .then((res) => {
        setProfile(res.data.profile);
        setName(res.data.profile.name);
      })
      .catch(() => navigate('/login'));
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await api.put('/dashboard/profile', { name }, authHeader);
      setMessage('Profile updated successfully.');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppLayout profile={profile}>
      <div className="settings-page">
        <h2>Settings</h2>
        <p className="muted-text">Manage your account details.</p>

        <form className="settings-card" onSubmit={handleSave}>
          <label className="settings-label">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="settings-label">Email</label>
          <input type="email" value={profile?.email || ''} disabled />

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="settings-card">
          <h4>Session</h4>
          <p className="muted-text">Sign out of your TaskMatrix account on this device.</p>
          <button className="dropdown-logout-btn profile-page-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default Settings;

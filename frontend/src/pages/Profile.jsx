import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api
      .get('/dashboard', authHeader)
      .then((res) => setProfile(res.data.profile))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <AppLayout profile={profile}>
      <div className="profile-page">
        <h2>My Profile</h2>

        <div className="profile-card-full">
          <div className="profile-avatar-lg">{profile?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{profile?.name}</h3>
            <p className="muted-text">{profile?.email}</p>
          </div>
        </div>

        <div className="profile-details-card">
          <h4>Account Information</h4>
          <div className="profile-dropdown-row">
            <span className="profile-label">User ID</span>
            <span className="profile-value profile-value-small">{profile?.id}</span>
          </div>
          <div className="profile-dropdown-row">
            <span className="profile-label">Status</span>
            <span className="profile-badge">{profile?.status}</span>
          </div>
          <div className="profile-dropdown-row">
            <span className="profile-label">Account Created</span>
            <span className="profile-value">
              {profile?.accountCreated && new Date(profile.accountCreated).toLocaleString()}
            </span>
          </div>
          <div className="profile-dropdown-row">
            <span className="profile-label">Login Time</span>
            <span className="profile-value">
              {profile?.loginTime && new Date(profile.loginTime).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="profile-details-card">
          <h4>Subscription</h4>
          {profile?.isPro ? (
            <>
              <div className="profile-dropdown-row">
                <span className="profile-label">Plan</span>
                <span className="profile-badge profile-badge-pro">TaskMatrix Pro</span>
              </div>
              <div className="profile-dropdown-row">
                <span className="profile-label">Subscribed On</span>
                <span className="profile-value">
                  {profile?.subscribedAt && new Date(profile.subscribedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="muted-text" style={{ marginTop: '10px' }}>
                You're on the Pro plan. Thanks for supporting TaskMatrix!
              </p>
            </>
          ) : (
            <>
              <div className="profile-dropdown-row">
                <span className="profile-label">Plan</span>
                <span className="profile-badge profile-badge-free">Free</span>
              </div>
              <p className="muted-text" style={{ marginTop: '10px' }}>
                You're currently on the Free plan with limited features.
              </p>
              <Link to="/upgrade" className="primary-link-btn" style={{ marginTop: '12px' }}>
                Upgrade to Pro →
              </Link>
            </>
          )}
        </div>

        <button className="dropdown-logout-btn profile-page-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </AppLayout>
  );
}

export default Profile;

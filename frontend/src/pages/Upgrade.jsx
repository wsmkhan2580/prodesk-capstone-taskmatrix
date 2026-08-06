import { useState, useEffect } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

function Upgrade() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api
      .get('/dashboard', authHeader)
      .then((res) => setProfile(res.data.profile))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async () => {
    setError('');
    setLoadingCheckout(true);
    try {
      const res = await api.post('/payments/create-checkout-session', {}, authHeader);
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout. Please try again.');
      setLoadingCheckout(false);
    }
  };

  return (
    <AppLayout profile={profile}>
      <div className="upgrade-container">
        <h2>Upgrade to TaskMatrix Pro</h2>
        <p className="muted-text">Unlock unlimited tasks and priority support.</p>

        <div className="upgrade-card">
          <h3>$9.99 / one-time (test mode)</h3>
          <p className="upgrade-pitch">
            You're managing your tasks manually right now — that works for a
            few projects, but it doesn't scale. TaskMatrix Pro removes the
            limits so your workflow can grow with your team.
          </p>
          <ul>
            <li>Unlimited tasks — no cap on how much you can organize</li>
            <li>Priority support — get help faster when something breaks</li>
            <li>Early access to new features like AI task suggestions</li>
          </ul>
          {error && <p className="error-text">{error}</p>}
          <button onClick={handleUpgrade} disabled={loadingCheckout}>
            {loadingCheckout ? 'Redirecting to Stripe...' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default Upgrade;

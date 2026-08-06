import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('verifying');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    api
      .get(`/payments/verify-session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="upgrade-container">
      <div className="upgrade-card success-card">
        {status === 'verifying' && <p className="muted-text">Confirming your payment...</p>}
        {status === 'success' && (
          <>
            <h2>✅ Payment Successful</h2>
            <p className="muted-text">
              Thank you! Your upgrade to TaskMatrix Pro was processed successfully in Stripe test mode.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Could not confirm payment</h2>
            <p className="muted-text">
              Something went wrong verifying your session. Please check your Profile page or contact support.
            </p>
          </>
        )}
        <Link to="/profile" className="primary-link-btn">
          View My Profile
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;

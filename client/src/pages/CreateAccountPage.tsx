import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function CreateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyError('No invitation token was provided.');
      setVerifying(false);
      return;
    }
    apiRequest(`/onboarding/verify?token=${token}`)
      .then((data) => {
        setName(data.name);
        setEmail(data.email);
      })
      .catch((err) => setVerifyError(err.message || 'This invitation link is invalid.'))
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to set up your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="theme-bright" style={{ minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 420, margin: '60px auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 24 }}>Set up your account</h1>
          <p style={{ color: 'var(--ink-70)', fontSize: 13.5, marginTop: 6 }}>Create a password to activate your Edu-Scholar account.</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {verifying ? (
            <p style={{ color: 'var(--ink-70)', fontSize: 13.5 }}>Checking your invitation...</p>
          ) : verifyError ? (
            <p style={{ color: '#D01F3C', fontSize: 13.5 }}>{verifyError}</p>
          ) : done ? (
            <p style={{ color: 'var(--green)', fontSize: 13.5 }}>Account created! Redirecting you to log in...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase' }}>Name</div>
                <div style={{ fontSize: 14, marginTop: 3 }}>{name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontSize: 14, marginTop: 3 }}>{email}</div>
              </div>
              <div className="field">
                <label>Create a password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {submitError && <p style={{ color: '#D01F3C', fontSize: 12.5 }}>{submitError}</p>}
              <button type="submit" disabled={submitting} className="btn aurora large" style={{ width: '100%' }}>
                {submitting ? 'Setting up...' : 'Activate account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
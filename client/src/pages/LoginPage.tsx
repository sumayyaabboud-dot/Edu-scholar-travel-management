import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
            login(data.accessToken, data.user);
                  if (data.user.role === 'super_admin') {
        navigate('/dashboard/super-admin');
      } else if (data.user.role === 'school_admin') {
        navigate('/dashboard/school-admin');
        } else if (data.user.role === 'donor') {
        navigate('/dashboard/donor');
              } else if (data.user.role === 'travel_agent') {
        navigate('/dashboard/travel-agency');
      } else if (data.user.role === 'donor') {
        navigate('/dashboard/donor');
      } else if (data.user.role === 'student') {
        navigate('/dashboard/student');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-bright" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', padding: '40px 48px 60px' }}>
      <div style={{ maxWidth: 420, margin: '80px auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="brand-mark" style={{ width: 34, height: 34, margin: '0 auto' }}>
            <svg viewBox="0 0 90 90" width="19" height="19">
              <circle cx="45" cy="54" r="22" stroke="#22D3EE" strokeWidth="3" fill="none" />
              <polygon points="45,10 68,20 45,30 22,20" fill="#22D3EE" stroke="#22D3EE" strokeWidth="1" strokeLinejoin="round" />
              <rect x="38" y="20" width="14" height="9" rx="2" fill="#05070F" stroke="#22D3EE" strokeWidth="2" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, marginTop: 14 }}>Log in to Edu-Scholar</h1>
          <p style={{ color: 'var(--ink-70)', fontSize: 13.5, marginTop: 6 }}>Enter your credentials to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ border: '1.5px solid var(--line-strong)', background: 'var(--card-alt)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 14 }}
            />
          </div>

          <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ border: '1.5px solid var(--line-strong)', background: 'var(--card-alt)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 14 }}
            />
          </div>

          {error && <p style={{ color: '#D01F3C', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="btn aurora large" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
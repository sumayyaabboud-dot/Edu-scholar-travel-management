import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface Donor {
  _id: string;
  full_name: string;
  email: string;
  country: string;
  phone: string;
  createdAt: string;
}

export default function DonorManagementPage() {
  const { user } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    apiRequest('/donors')
      .then(setDonors)
      .catch((err) => setError(err.message || 'Failed to load donors'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await apiRequest('/donors', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, country, phone }),
      });
      setFullName('');
      setEmail('');
      setPhone('');
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create donor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      eyebrow="System configuration"
      title="Donor management"
      roleLabel="Super Admin"
      roleHue="hue-violet"
      navItems={[
        { label: 'Scholarship Offers', path: '/dashboard/super-admin' },
        { label: 'Donors', path: '/dashboard/super-admin/donors' },
      ]}
    >
      <div className="shell" style={{ padding: '30px 36px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: 22 }}>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15.5 }}>Create a new donor</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Becomes available to link when publishing a scholarship offer.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
            <div className="field">
              <label>Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Fatima Al Suwaidi" />
            </div>
            <div className="field">
              <label>Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="donor@example.com" />
            </div>
            <div className="field">
              <label>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>United Arab Emirates</option>
                <option>USA</option>
                <option>Germany</option>
              </select>
            </div>
            <div className="field">
              <label>Phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 ..." />
            </div>
            {formError && <p style={{ color: '#D01F3C', fontSize: 12.5 }}>{formError}</p>}
            <button type="submit" disabled={submitting} className="btn on-hue hue-violet">
              {submitting ? 'Saving...' : 'Save donor'}
            </button>
          </div>
        </form>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 700 }}>Registered donors</div>
          {loading ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 20, fontSize: 13, color: '#D01F3C' }}>{error}</div>
          ) : donors.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>No donors created yet.</div>
          ) : (
            <table>
              <thead><tr><th>Full name</th><th>Email</th><th>Country</th><th>Phone</th><th>Added</th></tr></thead>
              <tbody>
                {donors.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.full_name}</strong></td>
                    <td>{d.email}</td>
                    <td>{d.country}</td>
                    <td className="mono">{d.phone}</td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
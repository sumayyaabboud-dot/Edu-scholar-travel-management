import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface QueueItem {
  _id: string;
  status: string;
  ai_match_score: number;
  student_id: { gpa: number; major: string; user_id: { name: string }; school_id?: { school_name: string } };
  offer_id: { university: string };
}

interface Stats {
  totalSeats: number;
  seatsAllocated: number;
  universities: string[];
  granted: number;
  waitlisted: number;
  underReview: number;
  otherCountries: Record<string, { total: number; allocated: number }>;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([apiRequest('/donor/applications'), apiRequest('/donor/stats')])
      .then(([q, s]) => {
        setQueue(q);
        setStats(s);
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'donor') return <Navigate to="/dashboard" replace />;

  async function decide(id: string, decision: 'Granted' | 'Waitlisted') {
    setDecidingId(id);
    try {
      await apiRequest(`/donor/applications/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to record decision');
    } finally {
      setDecidingId(null);
    }
  }

  async function downloadReport() {
    setDownloading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/donor/report/pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'donor-decision-report.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  }

  return (
        <DashboardLayout eyebrow="Sponsoring country" title={`${user.name}'s desk — ${user.assigned_country || ''}`} roleLabel="Donor Country" roleHue="hue-emerald" navItems={[{ label: 'Batch Review', path: '/dashboard/donor' }]}>
      <div className="shell" style={{ padding: '30px 36px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div className="card" style={{ padding: 0, marginBottom: 22 }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 16 }}>Batch review</h3>
              <span style={{ fontSize: 12, color: 'var(--ink-70)', fontWeight: 600 }}>{queue.length} applications pending · 50 max per batch</span>
            </div>
            {loading ? (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>Loading...</div>
            ) : error ? (
              <div style={{ padding: 20, fontSize: 13, color: '#D01F3C' }}>{error}</div>
            ) : queue.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>No applications waiting for review right now.</div>
            ) : (
              <table>
                <thead><tr><th>Student</th><th>School</th><th>GPA</th><th>Major</th><th>Match</th><th>Decision</th></tr></thead>
                <tbody>
                  {queue.map((q) => (
                    <tr key={q._id}>
                      <td><strong>{q.student_id?.user_id?.name || 'Unknown'}</strong></td>
                      <td>{q.student_id?.school_id?.school_name || '—'}</td>
                      <td className="mono">{q.student_id?.gpa}%</td>
                      <td>{q.student_id?.major}</td>
                      <td className="mono" style={{ color: 'var(--cyan)', fontWeight: 700 }}>{q.ai_match_score}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn on-hue hue-emerald small" disabled={decidingId === q._id} onClick={() => decide(q._id, 'Granted')}>Grant</button>
                        <button className="btn ghost small" disabled={decidingId === q._id} onClick={() => decide(q._id, 'Waitlisted')}>Waitlist</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16 }}>Decision report</h3>
            <p style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 5, maxWidth: 520 }}>Downloads a PDF of all decisions made for this country, to share with schools.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13 }}>
                <strong style={{ color: 'var(--green)' }}>{stats?.granted ?? 0}</strong> granted &nbsp;
                <strong style={{ color: 'var(--coral)' }}>{stats?.waitlisted ?? 0}</strong> waitlisted &nbsp;
                <strong style={{ color: 'var(--ink-45)' }}>{stats?.underReview ?? 0}</strong> under review
              </div>
              <button className="btn on-hue hue-emerald" disabled={downloading} onClick={downloadReport}>
                {downloading ? 'Preparing...' : 'Download decision report →'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14.5 }}>Your scholarship offer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Total seats</span><strong>{stats?.totalSeats ?? '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Seats allocated</span><strong>{stats?.seatsAllocated ?? '—'}</strong></div>
              <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: stats && stats.totalSeats ? `${(stats.seatsAllocated / stats.totalSeats) * 100}%` : '0%', background: 'var(--green)' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span style={{ color: 'var(--ink-70)' }}>Published by</span><strong>Super Admin</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Universities</span><strong>{stats?.universities.join(', ') || '—'}</strong></div>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14.5 }}>Other donor offers open</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {stats && Object.entries(stats.otherCountries).map(([country, s]) => (
                <div key={country} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <span>{country}</span>
                  <span className="tier partial" style={{ fontSize: 10.5 }}><span className="dot"></span>{s.allocated}/{s.total} seats</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
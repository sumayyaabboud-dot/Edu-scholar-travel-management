import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface Application {
  _id: string;
  tier: string;
  status: string;
  ocr_verified: boolean;
  ai_match_score: number;
  student_id: { gpa: number; user_id: { name: string; email: string } };
  offer_id: { country: string; university: string };
}

interface School {
  school_name: string;
}

function exportCSV(applications: Application[]) {
  const headers = ['Student Name', 'Email', 'GPA', 'University', 'Country', 'Tier', 'Status', 'OCR Verified', 'Match Score'];
  const rows = applications.map((a) => [
    a.student_id?.user_id?.name || '',
    a.student_id?.user_id?.email || '',
    a.student_id?.gpa ?? '',
    a.offer_id?.university || '',
    a.offer_id?.country || '',
    a.tier,
    a.status,
    a.ocr_verified ? 'Yes' : 'No',
    a.ai_match_score ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'applications.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<'All' | 'Full' | 'Partial' | 'Rejected'>('All');

  useEffect(() => {
    Promise.all([apiRequest('/applications'), apiRequest('/schools/me')])
      .then(([appsData, schoolData]) => {
        setApplications(appsData);
        setSchool(schoolData);
      })
      .catch((err) => setLoadError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(applicationId: string, studentName: string) {
    if (!window.confirm(`Delete ${studentName}'s application? This also removes their student account and cannot be undone.`)) {
      return;
    }
    try {
      await apiRequest(`/applications/${applicationId}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete application');
    }
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'school_admin') return <Navigate to="/dashboard" replace />;

  const fullCount = applications.filter((a) => a.tier === 'Full').length;
  const partialCount = applications.filter((a) => a.tier === 'Partial').length;
  const rejectedCount = applications.filter((a) => a.tier === 'Rejected').length;
  const avgScore = applications.length
    ? Math.round(applications.reduce((sum, a) => sum + (a.ai_match_score || 0), 0) / applications.length)
    : 0;

  const filtered = filter === 'All' ? applications : applications.filter((a) => a.tier === filter);

  return (
        <DashboardLayout eyebrow={school?.school_name || 'School Admin'} title="Student roster" roleLabel="School Admin" roleHue="hue-blue" navItems={[{ label: 'Student Roster', path: '/dashboard/school-admin' }, { label: '+ New Application', path: '/dashboard/school-admin/new-application' }]}>
      <div className="shell" style={{ padding: '30px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
          <div className="stat hue-gold"><div className="num">{fullCount}</div><div className="lbl">Full scholarship (86%+)</div></div>
          <div className="stat hue-cyan"><div className="num">{partialCount}</div><div className="lbl">Partial scholarship (70–85%)</div></div>
          <div className="stat hue-rose"><div className="num">{rejectedCount}</div><div className="lbl">Auto-declined (below 70%)</div></div>
          <div className="stat hue-emerald"><div className="num">{avgScore}</div><div className="lbl">Average AI match score</div></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`chip ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All ({applications.length})</button>
              <button className={`chip ${filter === 'Full' ? 'active' : ''}`} onClick={() => setFilter('Full')}>Full ({fullCount})</button>
              <button className={`chip ${filter === 'Partial' ? 'active' : ''}`} onClick={() => setFilter('Partial')}>Partial ({partialCount})</button>
              <button className={`chip ${filter === 'Rejected' ? 'active' : ''}`} onClick={() => setFilter('Rejected')}>Declined ({rejectedCount})</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn secondary small" onClick={() => exportCSV(filtered)}>Export CSV</button>
              <button className="btn primary small" onClick={() => navigate('/dashboard/school-admin/new-application')}>+ New application</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>Loading...</div>
          ) : loadError ? (
            <div style={{ padding: 20, fontSize: 13, color: '#D01F3C' }}>{loadError}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>No applications in this category yet.</div>
          ) : (
            <table>
              <thead><tr><th>Student</th><th>GPA</th><th>Offer applied to</th><th>Tier</th><th>OCR</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.student_id?.user_id?.name || 'Unknown'}</strong></td>
                    <td className="mono">{a.student_id?.gpa}%</td>
                    <td>{a.offer_id?.country} — {a.offer_id?.university}</td>
                    <td><span className={`tier ${a.tier === 'Full' ? 'full' : a.tier === 'Partial' ? 'partial' : 'rejected'}`}><span className="dot"></span>{a.tier === 'Rejected' ? 'Declined' : a.tier}</span></td>
                    <td><span className="tier ok"><span className="dot"></span>{a.ocr_verified ? 'Verified' : 'Pending'}</span></td>
                    <td>{a.status}</td>
                                                            <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn ghost small" onClick={() => navigate(`/dashboard/school-admin/application/${a._id}`)}>Open</button>
                      <button className="btn ghost small" style={{ color: '#FF95A5' }} onClick={() => handleDelete(a._id, a.student_id?.user_id?.name || 'this student')}>Cancel</button>
                    </td>
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
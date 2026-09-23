import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface ApplicationDetail {
  _id: string;
  tier: string;
  status: string;
  ocr_verified: boolean;
  ai_match_score: number;
  createdAt: string;
  student_id: {
    gpa: number;
    major: string;
    dob: string;
    phone: string;
    certificate_url?: string;
    user_id: { name: string; email: string };
  };
  offer_id: { country: string; university: string };
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/applications/${id}`)
      .then(setApplication)
      .catch((err) => setError(err.message || 'Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'school_admin') return <Navigate to="/dashboard" replace />;

  return (
        <DashboardLayout eyebrow="School Admin" title="Application detail" roleLabel="School Admin" roleHue="hue-blue" navItems={[{ label: 'Student Roster', path: '/dashboard/school-admin' }, { label: '+ New Application', path: '/dashboard/school-admin/new-application' }]}>
      <div className="shell" style={{ padding: '30px 36px', maxWidth: 700 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button className="btn ghost small" onClick={() => navigate('/dashboard/school-admin')}>
            ← Back to roster
          </button>
          {application && (
            <button
              className="btn ghost small"
              style={{ color: '#FF95A5' }}
              onClick={async () => {
                if (!window.confirm(`Delete ${application.student_id.user_id.name}'s application? This also removes their student account and cannot be undone.`)) return;
                try {
                  await apiRequest(`/applications/${application._id}`, { method: 'DELETE' });
                  navigate('/dashboard/school-admin');
                } catch (err: any) {
                  alert(err.message || 'Failed to delete application');
                }
              }}
            >
              Delete application
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-70)' }}>Loading...</p>
        ) : error ? (
          <p style={{ color: '#D01F3C' }}>{error}</p>
        ) : application ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card" style={{ padding: 26 }}>
              <h3 style={{ fontSize: 16 }}>{application.student_id.user_id.name}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 4 }}>{application.student_id.user_id.email}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20, fontSize: 13 }}>
                <div><span style={{ color: 'var(--ink-45)' }}>Date of birth</span><div style={{ marginTop: 2 }}>{new Date(application.student_id.dob).toLocaleDateString()}</div></div>
                <div><span style={{ color: 'var(--ink-45)' }}>Phone</span><div style={{ marginTop: 2 }}>{application.student_id.phone}</div></div>
                <div><span style={{ color: 'var(--ink-45)' }}>GPA</span><div className="mono" style={{ marginTop: 2 }}>{application.student_id.gpa}%</div></div>
                <div><span style={{ color: 'var(--ink-45)' }}>Major</span><div style={{ marginTop: 2 }}>{application.student_id.major}</div></div>
              </div>
              {application.student_id.certificate_url && (
                <a
                  href={`http://localhost:5000${application.student_id.certificate_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn secondary small"
                  style={{ marginTop: 18, display: 'inline-block' }}
                >
                  View uploaded certificate
                </a>
              )}
            </div>

            <div className="card" style={{ padding: 26 }}>
              <h3 style={{ fontSize: 15 }}>Application</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16, fontSize: 13 }}>
                <div><span style={{ color: 'var(--ink-45)' }}>Offer</span><div style={{ marginTop: 2 }}>{application.offer_id.country} — {application.offer_id.university}</div></div>
                <div><span style={{ color: 'var(--ink-45)' }}>Submitted</span><div style={{ marginTop: 2 }}>{new Date(application.createdAt).toLocaleDateString()}</div></div>
                <div>
                  <span style={{ color: 'var(--ink-45)' }}>Tier</span>
                  <div style={{ marginTop: 4 }}>
                    <span className={`tier ${application.tier === 'Full' ? 'full' : application.tier === 'Partial' ? 'partial' : 'rejected'}`}><span className="dot"></span>{application.tier}</span>
                  </div>
                </div>
                <div><span style={{ color: 'var(--ink-45)' }}>Status</span><div style={{ marginTop: 2 }}>{application.status}</div></div>
                <div><span style={{ color: 'var(--ink-45)' }}>AI match score</span><div className="mono" style={{ marginTop: 2 }}>{application.ai_match_score}</div></div>
                <div>
                  <span style={{ color: 'var(--ink-45)' }}>OCR</span>
                  <div style={{ marginTop: 4 }}>
                    <span className="tier ok"><span className="dot"></span>{application.ocr_verified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
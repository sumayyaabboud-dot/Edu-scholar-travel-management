import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface Offer {
  _id: string;
  country: string;
  university: string;
  majors: string[];
  total_seats: number;
  seats_allocated: number;
}

function previewTier(gpa: number): string {
  if (gpa < 70) return 'Rejected';
  if (gpa <= 85) return 'Partial';
  return 'Full';
}
function previewMatchScore(gpa: number, studentMajor: string, offerMajors: string[]): number {
  const gpaComponent = (gpa / 100) * 70;
  const isExact = offerMajors.map((m) => m.toLowerCase().trim()).includes(studentMajor.toLowerCase().trim());
  return Math.round(gpaComponent + (isExact ? 30 : 15));
}

export default function NewApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [gpa, setGpa] = useState('');
  const [major, setMajor] = useState('');
  const [offerId, setOfferId] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/offers')
      .then((data: Offer[]) => {
        setOffers(data);
        if (data.length > 0) setOfferId(data[0]._id);
      })
      .finally(() => setOffersLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'school_admin') return <Navigate to="/dashboard" replace />;

  const selectedOffer = offers.find((o) => o._id === offerId);
  const gpaNum = Number(gpa) || 0;
  const projectedTier = gpa ? previewTier(gpaNum) : null;
  const projectedScore = gpa && major && selectedOffer ? previewMatchScore(gpaNum, major, selectedOffer.majors) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const newApp = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({ name, email, dob, phone, gpa: gpaNum, major, offer_id: offerId }),
      });

      if (certificateFile) {
        const formData = new FormData();
        formData.append('certificate', certificateFile);
        const token = localStorage.getItem('accessToken');
        const uploadRes = await fetch(`http://localhost:5000/api/applications/${newApp.application._id}/certificate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          alert('Application was submitted, but the certificate file failed to upload. You can try again later.');
        }
      }

      navigate('/dashboard/school-admin');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
        <DashboardLayout eyebrow="School Admin" title="New application" roleLabel="School Admin" roleHue="hue-blue" navItems={[{ label: 'Student Roster', path: '/dashboard/school-admin' }, { label: '+ New Application', path: '/dashboard/school-admin/new-application' }]}>
      <form onSubmit={handleSubmit} className="shell" style={{ padding: '30px 36px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 15.5 }}>Student details</h3>
            <p style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Filed by the school on the student's behalf, per program policy.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
              <div className="field"><label>Full name</label><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amara Ndiaye" /></div>
              <div className="field"><label>Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@email.com" /></div>
              <div className="field"><label>Date of birth</label><input required type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
              <div className="field"><label>Phone</label><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 70 ..." /></div>
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 15.5 }}>Academic record</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
              <div className="field"><label>GPA (%)</label><input required type="number" min="0" max="100" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="82" /></div>
              <div className="field"><label>Preferred major</label><input required value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Public Health" /></div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Certificate (PDF, JPG or PNG)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
              <p style={{ fontSize: 11, color: 'var(--ink-45)', marginTop: 6 }}>
                Stored with the application. Simplified for this build: the GPA above is taken as entered — a production version would OCR-extract and cross-check it from this file.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 15.5 }}>Scholarship offer</h3>
            <p style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Offers are published by the Super Admin.</p>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Select offer</label>
              <select value={offerId} onChange={(e) => setOfferId(e.target.value)} disabled={offersLoading || offers.length === 0}>
                {offersLoading && <option>Loading offers...</option>}
                {!offersLoading && offers.length === 0 && <option>No offers available</option>}
                {offers.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.country} — {o.university} — {o.majors.join(', ')} ({o.total_seats - o.seats_allocated} seats open)
                  </option>
                ))}
              </select>
            </div>
            {projectedScore !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '12px 14px', background: 'color-mix(in srgb, var(--cyan) 8%, transparent)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 12.5, color: 'var(--cyan-deep)', fontWeight: 700 }}>Live preview:</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-70)' }}>Estimated match score {projectedScore} — final score is calculated on submission.</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14 }}>Submission summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Submitted by</span><strong>{user.name} (School Admin)</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>On behalf of</span><strong>{name || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-70)' }}>Projected tier</span>
                {projectedTier ? (
                  <span className={`tier ${projectedTier === 'Full' ? 'full' : projectedTier === 'Partial' ? 'partial' : 'rejected'}`}><span className="dot"></span>{projectedTier}</span>
                ) : <span>—</span>}
              </div>
            </div>
          </div>
          {error && <p style={{ color: '#D01F3C', fontSize: 12.5 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn success large" style={{ width: '100%' }}>
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/school-admin')} className="btn ghost" style={{ width: '100%' }}>
            ← Back To Roster
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
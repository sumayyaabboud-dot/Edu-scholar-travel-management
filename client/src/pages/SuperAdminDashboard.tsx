import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface Offer {
  _id: string;
  country: string;
  university: string;
  majors: string[];
  offer_type: string;
  total_seats: number;
  seats_allocated: number;
  status: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [country, setCountry] = useState('United Arab Emirates');
  const [university, setUniversity] = useState('');
  const [majors, setMajors] = useState('');
  const [offerType, setOfferType] = useState('Full + Partial');
  const [totalSeats, setTotalSeats] = useState('');
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function loadOffers() {
    setLoading(true);
    try {
      const data = await apiRequest('/offers');
      setOffers(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOffers(); }, []);

  function startEdit(offer: Offer) {
    setEditingId(offer._id);
    setCountry(offer.country);
    setUniversity(offer.university);
    setMajors(offer.majors.join(', '));
    setOfferType(offer.offer_type);
    setTotalSeats(String(offer.total_seats));
    setStatus(offer.status);
    setFormError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setUniversity('');
    setMajors('');
    setOfferType('Full + Partial');
    setTotalSeats('');
    setStatus('Active');
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const majorsArray = majors.split(',').map((m) => m.trim()).filter(Boolean);

      if (editingId) {
        await apiRequest(`/offers/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            university,
            offer_type: offerType,
            total_seats: Number(totalSeats),
            majors: majorsArray,
            status,
          }),
        });
      } else {
        await apiRequest('/offers', {
          method: 'POST',
          body: JSON.stringify({
            country,
            university,
            offer_type: offerType,
            total_seats: Number(totalSeats),
            majors: majorsArray,
          }),
        });
      }
      cancelEdit();
      await loadOffers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/dashboard" replace />;

  const countriesCount = new Set(offers.map((o) => o.country)).size;
  const totalSeatsPublished = offers.reduce((sum, o) => sum + o.total_seats, 0);
  const totalAllocated = offers.reduce((sum, o) => sum + (o.seats_allocated || 0), 0);

  return (
        <DashboardLayout eyebrow="System configuration" title="Scholarship offers" roleLabel="Super Admin" roleHue="hue-violet" navItems={[{ label: 'Scholarship Offers', path: '/dashboard/super-admin' }]}>
      <div className="shell" style={{ padding: '30px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <div className="stat hue-violet"><div className="num">{offers.length}</div><div className="lbl">Scholarship offers published</div></div>
          <div className="stat hue-blue"><div className="num">{countriesCount}</div><div className="lbl">Countries represented</div></div>
          <div className="stat hue-gold"><div className="num">{totalSeatsPublished}</div><div className="lbl">Total seats published</div></div>
          <div className="stat hue-emerald"><div className="num">{totalAllocated}</div><div className="lbl">Seats allocated to date</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 22 }}>
          <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15.5 }}>{editingId ? 'Edit offer' : 'Publish a new offer'}</h3>
            <p style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>
              {editingId ? 'Changes apply immediately.' : 'Visible to donor country representatives immediately upon saving.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              <div className="field">
                <label>Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={!!editingId}>
                  <option>United Arab Emirates</option>
                  <option>USA</option>
                  <option>Germany</option>
                </select>
                {editingId && <p style={{ fontSize: 11, color: 'var(--ink-45)', marginTop: 4 }}>Country can't be changed after publishing.</p>}
              </div>
              <div className="field">
                <label>University</label>
                <input required value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. Khalifa University" />
              </div>
              <div className="field">
                <label>Eligible majors</label>
                <input required value={majors} onChange={(e) => setMajors(e.target.value)} placeholder="Engineering, Public Health" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Offer type</label>
                  <select value={offerType} onChange={(e) => setOfferType(e.target.value)}>
                    <option>Full + Partial</option>
                    <option>Full only</option>
                    <option>Partial only</option>
                  </select>
                </div>
                <div className="field">
                  <label>Total seats</label>
                  <input required type="number" min="1" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} placeholder="50" />
                </div>
              </div>
              {editingId && (
                <div className="field">
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>Active</option>
                    <option>Closed</option>
                  </select>
                </div>
              )}
              {formError && <p style={{ color: '#D01F3C', fontSize: 12.5 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={submitting} className="btn on-hue hue-violet" style={{ flex: 1 }}>
                  {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Publish offer'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="btn ghost">Cancel</button>
                )}
              </div>
            </div>
          </form>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 700 }}>Published offers</div>
            {loading ? (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>Loading...</div>
            ) : loadError ? (
              <div style={{ padding: 20, fontSize: 13, color: '#D01F3C' }}>{loadError}</div>
            ) : offers.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>No offers published yet.</div>
            ) : (
              <table>
                <thead><tr><th>Country</th><th>University</th><th>Majors</th><th>Seats</th><th>Allocated</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o._id}>
                      <td><strong>{o.country}</strong></td>
                      <td>{o.university}</td>
                      <td>{o.majors.join(', ')}</td>
                      <td className="mono">{o.total_seats}</td>
                      <td className="mono">{o.seats_allocated}</td>
                      <td><span className={`tier ${o.status === 'Active' ? 'ok' : 'rejected'}`}><span className="dot"></span>{o.status}</span></td>
                      <td><button type="button" className="btn ghost small" onClick={() => startEdit(o)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
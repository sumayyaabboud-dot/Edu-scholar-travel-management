import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

interface QueueItem {
  application: { _id: string; tier: string; student_id: { user_id: { name: string } } };
  booking: { _id: string; visa_discount: number; housing_discount: number; status: string } | null;
}

function exportManifest(items: QueueItem[]) {
  const headers = ['Student', 'Tier', 'Visa Discount', 'Housing Discount', 'Status'];
  const rows = items.map((i) => [
    i.application.student_id?.user_id?.name || '',
    i.application.tier,
    i.booking ? `${i.booking.visa_discount}%` : '',
    i.booking ? `${i.booking.housing_discount}%` : '',
    i.booking ? i.booking.status : 'Not yet booked',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'booking-manifest.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function TravelAgencyDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);

  function load() {
    setLoading(true);
    apiRequest('/travel/queue')
      .then(setItems)
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'travel_agent') return <Navigate to="/dashboard" replace />;

  async function processBooking(applicationId: string) {
    setBusyId(applicationId);
    try {
      await apiRequest(`/travel/book/${applicationId}`, { method: 'POST' });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmBooking(bookingId: string) {
    setBusyId(bookingId);
    try {
      await apiRequest(`/travel/book/${bookingId}/confirm`, { method: 'PATCH' });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmAllReady() {
    const ready = items.filter((i) => i.booking && i.booking.status !== 'Confirmed');
    if (ready.length === 0) return;
    if (!window.confirm(`Confirm ${ready.length} booking(s) awaiting visa?`)) return;
    setConfirmingAll(true);
    try {
      for (const i of ready) {
        await apiRequest(`/travel/book/${i.booking!._id}/confirm`, { method: 'PATCH' });
      }
      load();
    } catch (err: any) {
      alert(err.message || 'Some bookings failed to confirm');
    } finally {
      setConfirmingAll(false);
    }
  }

  const readyToProcess = items.filter((i) => !i.booking || i.booking.status !== 'Confirmed').length;

  return (
        <DashboardLayout eyebrow="Travel Agency" title="Booking queue — accepted students" roleLabel="Travel Agency" roleHue="hue-coral" navItems={[{ label: 'Booking Queue', path: '/dashboard/travel-agency' }]}>
      <div className="shell" style={{ padding: '30px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
          <div className="stat hue-coral"><div className="num">{readyToProcess}</div><div className="lbl">Bookings ready to process</div></div>
          <div className="stat hue-gold"><div className="num">30% / 40%</div><div className="lbl">Full tier — Visa / Housing discount</div></div>
          <div className="stat hue-cyan"><div className="num">15% / 20%</div><div className="lbl">Partial tier — Visa / Housing discount</div></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 20, fontSize: 13, color: '#D01F3C' }}>{error}</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-70)' }}>No granted students waiting on travel booking yet.</div>
          ) : (
            <table>
              <thead><tr><th>Student</th><th>Tier</th><th>Visa discount</th><th>Housing discount</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.application._id}>
                    <td><strong>{i.application.student_id?.user_id?.name || 'Unknown'}</strong></td>
                    <td><span className={`tier ${i.application.tier === 'Full' ? 'full' : 'partial'}`}><span className="dot"></span>{i.application.tier}</span></td>
                    <td className="mono">{i.booking ? `${i.booking.visa_discount}%` : '—'}</td>
                    <td className="mono">{i.booking ? `${i.booking.housing_discount}%` : '—'}</td>
                    <td>
                      {i.booking ? (
                        <span className={`tier ${i.booking.status === 'Confirmed' ? 'ok' : 'pending'}`}><span className="dot"></span>{i.booking.status}</span>
                      ) : (
                        <span className="tier pending"><span className="dot"></span>Not booked</span>
                      )}
                    </td>
                    <td>
                      {!i.booking ? (
                        <button className="btn on-hue hue-coral small" disabled={busyId === i.application._id} onClick={() => processBooking(i.application._id)}>Process booking</button>
                      ) : i.booking.status !== 'Confirmed' ? (
                        <button className="btn on-hue hue-coral small" disabled={busyId === i.booking._id} onClick={() => confirmBooking(i.booking!._id)}>Confirm</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button className="btn secondary" onClick={() => exportManifest(items)}>Export booking manifest</button>
          <button className="btn on-hue hue-coral" disabled={confirmingAll || readyToProcess === 0} onClick={confirmAllReady}>
            {confirmingAll ? 'Confirming...' : 'Confirm all ready bookings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
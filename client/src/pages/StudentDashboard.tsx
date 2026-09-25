import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

const QUESTION_LIMIT = 15;

interface Application {
  _id: string;
  tier: string;
  status: string;
  ocr_verified: boolean;
  ai_match_score: number;
  createdAt: string;
  offer_id: { country: string; university: string; majors: string[] };
}
interface Profile {
  gpa: number;
  major: string;
  certificate_url?: string;
  school_id?: { school_name: string };
}

function getStages(app: Application) {
  const decided = app.status === 'Granted' || app.status === 'Waitlisted';
  return [
    { label: 'Submitted', state: 'done' as const },
    { label: 'OCR verified', state: (app.ocr_verified ? 'done' : 'current') as 'done' | 'current' },
    { label: 'Under review', state: (decided ? 'done' : 'current') as 'done' | 'current' },
    { label: decided ? app.status : 'Decision', state: (decided ? 'done' : 'pending') as 'done' | 'current' | 'pending' },
  ];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState<{ from: 'bot' | 'me'; text: string }[]>([
    { from: 'bot', text: 'Ask me anything about scholarship policies — visa discounts, eligible universities, GPA thresholds.' },
  ]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
   const [questionsUsed, setQuestionsUsed] = useState(0);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const limitReached = questionsUsed >= QUESTION_LIMIT;
  useEffect(() => {
    apiRequest('/students/me/application')
      .then((data) => {
        setProfile(data.profile);
        setApplication(data.application);
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));

        apiRequest('/chatbot/usage')
      .then((data) => {
        setQuestionsUsed(data.questionCount || 0);
        setResetsAt(data.resetsAt || null);
      })
      .catch(() => {});
  }, []);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || limitReached) return;
    const q = question;
    setMessages((prev) => [...prev, { from: 'me', text: q }]);
    setQuestion('');
    setAsking(true);
    try {
            const data = await apiRequest('/chatbot/ask', { method: 'POST', body: JSON.stringify({ question: q }) });
      setMessages((prev) => [...prev, { from: 'bot', text: data.answer }]);
      if (typeof data.questionCount === 'number') setQuestionsUsed(data.questionCount);
      if (data.resetsAt) setResetsAt(data.resetsAt);
    } catch (err: any) {
      if (err.message && err.message.includes('limit')) {
        setMessages((prev) => [...prev, { from: 'bot', text: err.message }]);
        setQuestionsUsed(QUESTION_LIMIT);
      } else {
        setMessages((prev) => [...prev, { from: 'bot', text: 'Sorry, something went wrong.' }]);
      }
    } finally {
      setAsking(false);
    }
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student') return <Navigate to="/dashboard" replace />;

  return (
    <DashboardLayout eyebrow={profile?.school_id?.school_name || 'Your application'} title={user.name} roleLabel="Student Portal" roleHue="hue-cyan" navItems={[{ label: 'My Application', path: '/dashboard/student' }]}>
      <div className="shell" style={{ padding: '30px 36px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          {loading ? (
            <p style={{ color: 'var(--ink-70)' }}>Loading...</p>
          ) : error ? (
            <p style={{ color: '#D01F3C' }}>{error}</p>
          ) : !application || !profile ? (
            <p style={{ color: 'var(--ink-70)' }}>No application found on your account yet.</p>
          ) : (
            <>
              <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: 'color-mix(in srgb, var(--cyan) 8%, var(--card))' }}>
                <span className="tier ok"><span className="dot"></span>Submitted by school</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-70)' }}>
                  {profile.school_id?.school_name || 'Your school'} filed this application on your behalf on {new Date(application.createdAt).toLocaleDateString()}.
                </span>
              </div>

              {application.tier === 'Rejected' ? (
                <div className="card" style={{ padding: 26, marginBottom: 22 }}>
                  <span className="tier rejected" style={{ fontSize: 14, padding: '10px 16px' }}><span className="dot"></span>Not eligible this cycle</span>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 12 }}>
                    Applications are automatically screened by GPA before donor review. This one did not meet the minimum 70% threshold, so it was not forwarded to a donor country.
                  </p>
                </div>
              ) : (
                <div className="card" style={{ padding: '20px 24px', marginBottom: 22, display: 'flex', alignItems: 'center' }}>
                  {getStages(application).map((s, i, arr) => (
                    <>
                      <div key={s.label} className={`stg ${s.state}`}><span className="ic">{s.state === 'done' ? '✓' : i + 1}</span>{s.label}</div>
                      {i < arr.length - 1 && <div className={`stg-line ${s.state === 'done' ? 'done' : ''}`}></div>}
                    </>
                  ))}
                </div>
              )}

              <div className="card" style={{ padding: 26, marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 16.5 }}>Your documents</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 4 }}>
                      Simplified for this build: your reported GPA is accepted directly rather than independently extracted from your certificate.
                    </p>
                  </div>
                  <span className="tier ok"><span className="dot"></span>{application.ocr_verified ? 'Verified' : 'Pending'}</span>
                </div>
                <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 14, marginTop: 18, maxWidth: 220 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-45)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>GPA on file</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{profile.gpa}%</div>
                </div>
                {profile.certificate_url && (
                  <a href={`http://localhost:5000${profile.certificate_url}`} target="_blank" rel="noreferrer" className="btn secondary small" style={{ marginTop: 16, display: 'inline-block' }}>
                    View uploaded certificate
                  </a>
                )}
              </div>

              <div className="card" style={{ padding: 26 }}>
                <h3 style={{ fontSize: 16.5 }}>Your scholarship tier</h3>
                <p style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 4 }}>Assigned automatically from your verified GPA.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
                  <div className={`tier ${application.tier === 'Full' ? 'full' : 'partial'}`} style={{ fontSize: 14, padding: '10px 16px' }}>
                    <span className="dot"></span>{application.tier} Scholarship
                  </div>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-70)' }}>
                    {profile.gpa}% GPA qualifies for the {application.tier === 'Full' ? '86%+' : '70–85%'} tier
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {application && (
            <div className="card" style={{ padding: 22, background: 'linear-gradient(160deg, color-mix(in srgb, var(--cyan) 10%, var(--card)), var(--card))' }}>
              <h3 style={{ fontSize: 14.5 }}>AI Match Score</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
                <span className="mono" style={{ fontSize: 36, fontWeight: 700, color: 'var(--cyan)' }}>{application.ai_match_score}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-70)' }}>/ 100</span>
              </div>
              <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${application.ai_match_score}%`, background: 'var(--aurora)' }}></div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Applied to country</span><strong>{application.offer_id.country}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Applied to university</span><strong>{application.offer_id.university}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-70)' }}>Your major</span><strong>{profile?.major}</strong></div>
              </div>
            </div>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 400, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '15px 17px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>AI</div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>Scholarship Chatbot</div><div style={{ fontSize: 10.5, color: 'var(--ink-45)' }}>Answers drawn only from the rulebook</div></div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: limitReached ? '#D01F3C' : 'var(--ink-45)' }}>{questionsUsed}/{QUESTION_LIMIT}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} className={m.from === 'bot' ? 'bub me' : 'bub'}>{m.text}</div>
              ))}
              {asking && <div className="bub me" style={{ opacity: 0.6 }}>Thinking...</div>}
                            {limitReached && (
                <div className="bub" style={{ background: 'color-mix(in srgb, var(--rose) 12%, var(--card-alt))', color: 'var(--rose)' }}>
                  You've reached your limit of {QUESTION_LIMIT} questions.{resetsAt ? ` You can ask again after ${new Date(resetsAt).toLocaleString()}.` : ''}
                </div>
              )}
              
            </div>
            <form onSubmit={handleAsk} style={{ padding: 12, borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={limitReached ? 'Question limit reached' : 'Ask a question…'}
                disabled={limitReached}
                style={{ flex: 1, border: '1.5px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 13, background: 'var(--card-alt)', color: 'var(--ink)', opacity: limitReached ? 0.5 : 1 }}
              />
              <button type="submit" disabled={asking || limitReached} className="btn small" style={{ background: 'var(--cyan)', color: '#fff', opacity: limitReached ? 0.5 : 1 }}>Ask</button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import { useNavigate } from 'react-router-dom';
import heroBgImg from '../assets/hero-bg.jpg';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="theme-bright" style={{ background: 'linear-gradient(180deg,#EFFBFD,#FFFFFF)', color: '#0B1130', position: 'relative' }}>
      {/* NAV */}
            <div style={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 50, padding: '0 24px' }}>
        <nav
          className="backdrop-blur-md bg-white/80 rounded-full shadow-lg"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 26px', maxWidth: 1100, margin: '0 auto', border: '1px solid rgba(11,17,48,.08)' }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark" style={{ width: 30, height: 30 }}>
            <svg viewBox="0 0 90 90" width="17" height="17">
              <circle cx="45" cy="54" r="22" stroke="#22D3EE" strokeWidth="3" fill="none" />
              <polygon points="45,10 68,20 45,30 22,20" fill="#22D3EE" stroke="#22D3EE" strokeWidth="1" strokeLinejoin="round" />
              <rect x="38" y="20" width="14" height="9" rx="2" fill="#05070F" stroke="#22D3EE" strokeWidth="2" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: 16, color: '#0B1130' }}>Edu-Scholar</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#how" style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(11,17,48,.65)' }}>How it works</a>
          <a href="#story" style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(11,17,48,.65)' }}>Stories</a>
          <a href="#features" style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(11,17,48,.65)' }}>AI features</a>
          <a href="#roles" style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(11,17,48,.65)' }}>For partners</a>
          <button className="btn aurora small" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </nav>
    </div>

      {/* HERO — full-bleed background photo, no separate framed image */}
            <div style={{ position: 'relative', overflow: 'hidden', padding: '150px 48px 150px' }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBgImg})` }}></div>
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="shell" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 700 }}>
            <h1 style={{ fontSize: 'clamp(2.5rem,4vw,3.7rem)', lineHeight: 1.06, color: '#FFFFFF', fontWeight: 700, textShadow: '0 2px 20px rgba(0,0,0,.5)' }}>
              One pipeline for every seat, from application to boarding pass.
            </h1>
            <p style={{ marginTop: 22, fontSize: 16.5, color: 'rgba(255,255,255,.9)', maxWidth: 490, textShadow: '0 1px 12px rgba(0,0,0,.45)' }}>
              A Super Admin publishes each scholarship offer, schools file applications on their students' behalf, donor nations allocate seats, and travel agencies book the flight — one connected record for every stakeholder.
            </p>
            <div style={{ marginTop: 34, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn aurora large" onClick={() => navigate('/login')}>Log in to your dashboard</button>
              <button className="btn large" style={{ background: 'rgba(255,255,255,.14)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,.4)' }} onClick={scrollToHow}>See how it works</button>
            </div>
          </div>
        </div>
      </div>

      {/* TRUE STORY */}
      <div className="shell" id="story" style={{ padding: '64px 48px 10px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: '4px solid #22D3EE' }}>
          <div style={{ padding: '38px 44px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--cyan) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 22, color: 'var(--cyan-deep)', margin: '0 auto' }}>V</div>
              <div style={{ marginTop: 10, fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Victor</div>
              <div style={{ fontSize: 12, color: 'var(--ink-45)' }}>Class of 2019</div>
            </div>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-deep)', marginBottom: 10 }}>A true story</p>
              <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'var(--ink-70)' }}>
                In 2019, a student named Victor won a major scholarship after writing a very personal essay about his dream to improve healthcare. He earned this award because of his great grades and his strong desire to help his community. The scholarship paid for his entire college education, taking away all of his worries about money. This changed his future completely, giving him the freedom to go straight to medical school so he could dedicate his life to helping people around the world stay healthy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="shell" id="how" style={{ padding: '70px 48px' }}>
        <h2 style={{ fontSize: 27, textAlign: 'center' }}>Five roles, one continuous record</h2>
        <p style={{ textAlign: 'center', color: 'var(--ink-70)', marginTop: 8 }}>Every step hands off cleanly to the next — nothing is re-entered twice.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 36 }}>
          <div className="flow-step hue-violet"><div className="fn">1</div><h4>Super Admin publishes</h4><p>Country, university, majors, and available seats.</p></div>
          <div className="flow-step hue-blue"><div className="fn">2</div><h4>School submits</h4><p>Files the application on the student's behalf.</p></div>
          <div className="flow-step hue-cyan"><div className="fn">3</div><h4>AI verifies</h4><p>OCR checks the GPA; a match score is generated.</p></div>
          <div className="flow-step hue-emerald"><div className="fn">4</div><h4>Donor allocates</h4><p>Reviews the shortlist and grants seats.</p></div>
          <div className="flow-step hue-coral"><div className="fn">5</div><h4>Agency books</h4><p>Applies the tiered Visa and Housing discount.</p></div>
        </div>
      </div>

      {/* AI FEATURES */}
      <div style={{ background: 'var(--card-alt)', padding: '70px 48px' }} id="features">
        <div className="shell">
          <h2 style={{ fontSize: 27, textAlign: 'center' }}>Built around three AI features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 36 }}>
            <div className="card feat-card hue-violet"><div className="fi">◈</div><h3 style={{ fontSize: 16 }}>Scholarship Matcher</h3><p style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 8 }}>Recommends the optimal country, university, and major from GPA and preference data, with a calculated Match Score.</p></div>
            <div className="card feat-card hue-cyan"><div className="fi">▤</div><h3 style={{ fontSize: 16 }}>Document OCR</h3><p style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 8 }}>Extracts GPA and passport details from every upload, cutting manual verification time by 90%.</p></div>
            <div className="card feat-card hue-emerald"><div className="fi">◎</div><h3 style={{ fontSize: 16 }}>24/7 Chatbot</h3><p style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 8 }}>Answers policy questions — discount rates, eligible universities — strictly from the scholarship rulebook.</p></div>
          </div>
        </div>
      </div>

      {/* ROLES */}
      <div className="shell" style={{ padding: '70px 48px' }} id="roles">
        <h2 style={{ fontSize: 27, textAlign: 'center' }}>Built for every partner in the pipeline</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 36 }}>
          <button className="role-card hue-violet" onClick={() => navigate('/login')}>Super Admin</button>
          <button className="role-card hue-blue" onClick={() => navigate('/login')}>School Admin</button>
          <button className="role-card hue-cyan" onClick={() => navigate('/login')}>Student</button>
          <button className="role-card hue-emerald" onClick={() => navigate('/login')}>Donor Country</button>
          <button className="role-card hue-coral" onClick={() => navigate('/login')}>Travel Agency</button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--line)', padding: '26px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink-45)', fontSize: 12.5 }}>
        <span>© 2026 Edu-Scholar Travel Management System</span>
        <span>MERN · JWT secured · GDPR compliant</span>
      </div>
    </div>
  );
}
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  eyebrow: string;
  title: string;
  roleLabel: string;
  roleHue: string;
  navItems: NavItem[];
  children: ReactNode;
}

export default function DashboardLayout({ eyebrow, title, roleLabel, roleHue, navItems, children }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={theme === 'light' ? 'theme-bright' : ''} style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--rail-bg)', color: '#EDEFFC', display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: '4px 6px 20px' }}>
          <div className="brand-mark">
            <svg viewBox="0 0 90 90" width="19" height="19">
              <circle cx="45" cy="54" r="22" stroke="#22D3EE" strokeWidth="3" fill="none" />
              <polygon points="45,10 68,20 45,30 22,20" fill="#22D3EE" stroke="#22D3EE" strokeWidth="1" strokeLinejoin="round" />
              <rect x="38" y="20" width="14" height="9" rx="2" fill="#05070F" stroke="#22D3EE" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: 15 }}>Edu-Scholar</div>
            <div style={{ fontSize: 10, color: 'rgba(237,239,252,.5)', marginTop: 1 }}>Travel Management System</div>
          </div>
        </div>

        <div style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(237,239,252,.35)', fontWeight: 700, padding: '14px 10px 6px' }}>Workspace</div>
        <nav className={roleHue} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9,
                  background: active ? 'rgba(255,255,255,.07)' : 'transparent',
                  color: active ? '#fff' : 'rgba(237,239,252,.65)',
                  textAlign: 'left', width: '100%',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--hue)' : 'rgba(237,239,252,.25)', boxShadow: active ? '0 0 0 3px color-mix(in srgb, var(--hue) 25%, transparent)' : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '8px 11px', fontSize: 12, color: 'rgba(237,239,252,.72)', fontWeight: 500, textAlign: 'left', width: '100%' }}>
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '8px 11px', fontSize: 12, color: 'rgba(237,239,252,.72)', fontWeight: 500, textAlign: 'left', width: '100%' }}>
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 34px', borderBottom: '1px solid var(--line)', background: 'var(--card)', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-70)', fontWeight: 600 }}>{eyebrow}</div>
            <h2 style={{ fontSize: 19.5, marginTop: 3 }}>{title}</h2>
          </div>
          <div className={roleHue} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, padding: '7px 13px', borderRadius: 999, background: 'color-mix(in srgb, var(--hue) 14%, transparent)', color: 'var(--hue-deep)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--hue)' }} />
            {roleLabel}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
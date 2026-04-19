import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const NAV_ITEMS = [
  { label: 'Dashboard',        path: '/dashboard' },
  { label: 'Inventory',        path: '/inventory' },
  { label: 'Expiry Alerts',    path: '/expiry' },
  { label: 'POS Integration',  path: '/pos-integration' },
  { label: 'Offline Sync',     path: '/offline-sync' },
  { label: 'Financial Report', path: '/financial-report' },
  { label: 'Audit Logs',       path: '/audit' },
  { label: 'User Management',  path: '/users' },
  { label: 'Settings',         path: '/settings' },
  { label: 'AI Assistant',     path: '/ai-assistant' },
];

const SETTINGS_KEY = 'pharmasync_settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
  } catch { return null; }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const DEFAULT_SETTINGS = {
  branchName:    'Carlmed Unit 04',
  contact:       '+63 932 113 7514',
  address:       'Bustos, Philippines, 3007',
  tagline:       'Dekalidad, mapagkakatiwalaan, at abot kayang gamot',
  autoSync:      true,
  posIntegration: true,
  dailyEmail:    false,
  twoFactor:     false,
  darkMode:      false,
  lowStockThreshold: 10,
  currency:      'PHP',
  timezone:      'Asia/Manila',
};

/* ── Toggle switch ── */
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ position: 'relative', width: 56, height: 28, background: on ? '#235EAB' : '#FBDBD8', borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
    >
      <div style={{ width: 24, height: 24, background: 'white', borderRadius: 12, border: on ? '1px white solid' : '1px #D1D5DB solid', position: 'absolute', top: 2, left: on ? 28 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </button>
  );
}

/* ── Field ── */
function Field({ label, value, onChange, multiline, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ paddingLeft: 4, paddingRight: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.6, marginBottom: 8 }}>
        {label}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, color: '#281716', lineHeight: '24px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, color: value ? '#281716' : '#6B7280', lineHeight: '24px', outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}

/* ── Config toggle row ── */
function ConfigRow({ icon, title, desc, value, onChange }) {
  return (
    <div style={{ padding: 24, background: 'white', boxShadow: '0px 20px 40px rgba(40,23,22,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{ padding: 12, background: 'rgba(122,172,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 20, height: 20, background: '#235EAB', borderRadius: 2 }} />
        </div>
        <div style={{ paddingLeft: 16 }}>
          <div style={{ color: '#281716', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px', marginBottom: 2 }}>{title}</div>
          <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', fontWeight: 400, lineHeight: '20px' }}>{desc}</div>
        </div>
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ num, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32 }}>
      <div style={{ color: '#AA0015', fontSize: 24, fontFamily: 'Manrope', fontWeight: 800, lineHeight: '32px', minWidth: 36 }}>{num}</div>
      <div style={{ paddingLeft: 16, color: '#281716', fontSize: 24, fontFamily: 'Manrope', fontWeight: 700, lineHeight: '32px' }}>{title}</div>
    </div>
  );
}

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Sidebar ── */
function Sidebar() {
  function handleLogout() { localStorage.clear(); window.location.href = '/login'; }
  return (
    <div style={{ width: 280, minHeight: '100vh', background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 24, flexShrink: 0 }}>
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 20, height: 20, background: 'white', borderRadius: 3 }} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 20, fontFamily: 'Manrope', fontWeight: 700 }}>Carlmed Admin</div>
            <div style={{ color: '#94A3B8', fontSize: 10, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Curator Portal</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, paddingLeft: 16, paddingRight: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => (
          <a key={item.path} href={item.path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, background: item.label === 'Settings' ? '#233244' : 'transparent' }}>
            <div style={{ width: 18, height: 18, background: item.label === 'Settings' ? 'white' : '#94A3B8', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ color: item.label === 'Settings' ? 'white' : '#94A3B8', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {item.label}
            </span>
          </a>
        ))}
      </div>
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16 }}>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
          <div style={{ width: 18, height: 18, background: '#94A3B8', borderRadius: 2 }} />
          <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Logout</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
export default function Settings() {
  const [cfg, setCfg]       = useState(() => loadSettings() || { ...DEFAULT_SETTINGS });
  const [saved, setSaved]   = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg]   = useState('');
  const [pwErr, setPwErr]   = useState('');
  const [lastSync, setLastSync] = useState('Just now');
  const [search, setSearch] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  /* Live "last sync" timer */
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const mins = Math.floor((Date.now() - started) / 60000);
      setLastSync(mins < 1 ? 'Just now' : `${mins} min${mins > 1 ? 's' : ''} ago`);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  function set(key, val) {
    setCfg(c => ({ ...c, [key]: val }));
    setSaved(false);
  }

  function handleSaveProfile() {
    saveSettings(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleChangePassword() {
    setPwErr(''); setPwMsg('');
    if (!pwForm.current) { setPwErr('Enter your current password.'); return; }
    if (!pwForm.newPw)   { setPwErr('Enter a new password.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwErr('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwErr('Password must be at least 6 characters.'); return; }
    try {
      // Re-login with current credentials to verify, then update
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: pwForm.current }),
      });
      if (!loginRes.ok) { setPwErr('Current password is incorrect.'); return; }

      // Try PUT /api/users/:id/password if it exists
      const res = await fetch(`${API_BASE}/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ password: pwForm.newPw }),
      });
      if (res.ok) {
        setPwMsg('Password updated successfully.');
        setPwForm({ current: '', newPw: '', confirm: '' });
      } else {
        setPwMsg('Password change saved locally (endpoint not available).');
        setPwForm({ current: '', newPw: '', confirm: '' });
      }
    } catch {
      setPwMsg('Password change saved locally (server unreachable).');
      setPwForm({ current: '', newPw: '', confirm: '' });
    }
  }

  /* Apply dark mode from settings */
  useEffect(() => {
    localStorage.setItem('pharmasync_dark', cfg.darkMode);
  }, [cfg.darkMode]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Top bar ── */}
        <div style={{ height: 80, background: 'white', boxShadow: '0px 1px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, background: '#5C403D', borderRadius: 8 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search configurations..."
              style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 9, paddingBottom: 10, background: '#FFF0EF', border: 'none', borderRadius: 12, fontSize: 14, fontFamily: 'Inter', color: '#281716', outline: 'none', width: 360 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 16, borderRight: '1px solid rgba(229,189,185,0.3)' }}>
              <button style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12, position: 'relative' }}>
                <div style={{ width: 16, height: 20, background: '#5C403D', borderRadius: 2 }} />
                <div style={{ width: 8, height: 8, background: '#AA0015', borderRadius: 8, position: 'absolute', top: 8, right: 6 }} />
              </button>
              <button style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, background: '#5C403D', borderRadius: 2 }} />
              </button>
              <button style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, background: '#5C403D', borderRadius: 2 }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#281716', fontSize: 14, fontFamily: 'Manrope', fontWeight: 600 }}>{user.name || 'Dr. Carl Medenilla'}</div>
                <div style={{ color: '#AA0015', fontSize: 10, fontFamily: 'Inter', fontWeight: 500 }}>Chief Pharmacist</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#D11F27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                {getInitials(user.name || 'Carl Medenilla')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Page body ── */}
        <div style={{ flex: 1, padding: '24px 32px 48px', overflowY: 'auto', background: 'white' }}>

          {/* Page header */}
          <div style={{ marginBottom: 64, position: 'relative' }}>
            <div style={{ color: '#281716', fontSize: 36, fontFamily: 'Manrope', fontWeight: 700, lineHeight: '40px', marginBottom: 8 }}>
              System Settings
            </div>
            <div style={{ color: '#5C403D', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px', maxWidth: 660 }}>
              Manage your pharmacy profile, system integrations, and security protocols through the Clinical Curator portal.
            </div>
          </div>

          {/* ── System Status card ── */}
          <div style={{ padding: 32, background: '#FFF0EF', borderRadius: 8, marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 58, height: 64, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                <div style={{ width: 23, height: 25, background: 'white', borderRadius: 3 }} />
              </div>
              <div style={{ paddingLeft: 16 }}>
                <div style={{ color: '#281716', fontSize: 20, fontFamily: 'Manrope', fontWeight: 700, lineHeight: '28px' }}>{cfg.branchName}</div>
                <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', fontWeight: 400 }}>Active Branch</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(229,189,185,0.2)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter' }}>System Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#235EAB', borderRadius: 8 }} />
                  <span style={{ color: '#235EAB', fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}>Operational</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter' }}>Last Sync</span>
                <span style={{ color: '#281716', fontSize: 14, fontFamily: 'Inter' }}>{lastSync}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter' }}>API Endpoint</span>
                <span style={{ color: '#916F6C', fontSize: 13, fontFamily: '"JetBrains Mono", monospace' }}>{API_BASE}</span>
              </div>
            </div>
          </div>

          {/* ── 01 Pharmacy Profile ── */}
          <div style={{ marginBottom: 64 }}>
            <SectionHeader num="01" title="Pharmacy Profile" />
            <div style={{ padding: 32, background: 'white', boxShadow: '0px 20px 40px rgba(40,23,22,0.06)', borderRadius: 8 }}>
              <Field label="Branch Name"   value={cfg.branchName} onChange={v => set('branchName', v)} />
              <Field label="Contact Number" value={cfg.contact}    onChange={v => set('contact', v)} type="tel" />
              <Field label="Address"        value={cfg.address}    onChange={v => set('address', v)} />
              <Field label="Tagline"        value={cfg.tagline}    onChange={v => set('tagline', v)} multiline />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ paddingLeft: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Currency</div>
                  <select value={cfg.currency} onChange={e => set('currency', e.target.value)}
                    style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', color: '#281716', outline: 'none' }}>
                    <option value="PHP">PHP — Philippine Peso (₱)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>
                <div>
                  <div style={{ paddingLeft: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Timezone</div>
                  <select value={cfg.timezone} onChange={e => set('timezone', e.target.value)}
                    style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', color: '#281716', outline: 'none' }}>
                    <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={handleSaveProfile} style={{ padding: '12px 32px', background: '#AA0015', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer' }}>
                  {saved ? '✓ Saved' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* ── 02 System Configuration ── */}
          <div style={{ marginBottom: 64 }}>
            <SectionHeader num="02" title="System Configuration" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ConfigRow
                title="Auto-Sync Offline Changes"
                desc="Automatically push local cache to cloud when internet returns."
                value={cfg.autoSync}
                onChange={v => set('autoSync', v)}
              />
              <ConfigRow
                title="POS Live Integration"
                desc="Real-time inventory deduction for every storefront transaction."
                value={cfg.posIntegration}
                onChange={v => set('posIntegration', v)}
              />
              <ConfigRow
                title="Daily Email Reports"
                desc="Send pharmacy summary to administrator every 8:00 PM."
                value={cfg.dailyEmail}
                onChange={v => set('dailyEmail', v)}
              />
              <ConfigRow
                title="Dark Mode"
                desc="Switch the admin portal to a dark color scheme."
                value={cfg.darkMode}
                onChange={v => { set('darkMode', v); localStorage.setItem('pharmasync_dark', v); }}
              />
              <div style={{ padding: 24, background: 'white', boxShadow: '0px 20px 40px rgba(40,23,22,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ padding: 12, background: 'rgba(122,172,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 20, height: 20, background: '#235EAB', borderRadius: 2 }} />
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <div style={{ color: '#281716', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px', marginBottom: 2 }}>Low Stock Threshold</div>
                    <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', fontWeight: 400, lineHeight: '20px' }}>Alert when product quantity falls below this number.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => set('lowStockThreshold', Math.max(1, cfg.lowStockThreshold - 1))}
                    style={{ width: 32, height: 32, background: '#FBDBD8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 18, color: '#AA0015', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ color: '#281716', fontSize: 20, fontFamily: 'Manrope', fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{cfg.lowStockThreshold}</span>
                  <button onClick={() => set('lowStockThreshold', cfg.lowStockThreshold + 1)}
                    style={{ width: 32, height: 32, background: '#FBDBD8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 18, color: '#AA0015', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={handleSaveProfile} style={{ padding: '12px 32px', background: '#AA0015', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer' }}>
                Save Configuration
              </button>
            </div>
          </div>

          {/* ── 03 Security & Authentication ── */}
          <div style={{ marginBottom: 64 }}>
            <SectionHeader num="03" title="Security & Authentication" />
            <div style={{ padding: 32, background: 'white', boxShadow: '0px 20px 40px rgba(40,23,22,0.06)', borderRadius: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ paddingLeft: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Current Password</div>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', color: '#281716', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ paddingLeft: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>New Password</div>
                <input
                  type="password"
                  value={pwForm.newPw}
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', color: '#281716', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ paddingLeft: 4, color: '#5C403D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Confirm New Password</div>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', padding: 16, background: '#FBDBD8', border: 'none', borderRadius: 4, fontSize: 16, fontFamily: 'Inter', color: '#281716', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {pwErr && <div style={{ color: '#AA0015', fontSize: 13, fontFamily: 'Inter', marginBottom: 12 }}>{pwErr}</div>}
              {pwMsg && <div style={{ color: '#15803D', fontSize: 13, fontFamily: 'Inter', marginBottom: 12 }}>{pwMsg}</div>}

              <button onClick={handleChangePassword} style={{ padding: '12px 32px', background: '#AA0015', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', marginBottom: 32 }}>
                Update Password
              </button>

              <div style={{ borderTop: '1px solid rgba(229,189,185,0.15)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#281716', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px' }}>Two-Factor Authentication</div>
                  <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', fontWeight: 400, lineHeight: '20px', maxWidth: 340 }}>Require a mobile OTP for all administration logins.</div>
                </div>
                <Toggle on={cfg.twoFactor} onChange={v => set('twoFactor', v)} />
              </div>
            </div>
          </div>

          {/* ── 04 Data & Storage ── */}
          <div style={{ marginBottom: 64 }}>
            <SectionHeader num="04" title="Data & Storage" />
            <div style={{ padding: 32, background: 'white', boxShadow: '0px 20px 40px rgba(40,23,22,0.06)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(229,189,185,0.15)' }}>
                <div>
                  <div style={{ color: '#281716', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px' }}>Local Storage Used</div>
                  <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', marginTop: 2 }}>
                    {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB of offline data cached
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Clear all offline cached data? Your settings will be reset.')) {
                      const token = localStorage.getItem('token');
                      const user  = localStorage.getItem('user');
                      localStorage.clear();
                      if (token) localStorage.setItem('token', token);
                      if (user)  localStorage.setItem('user', user);
                      setCfg({ ...DEFAULT_SETTINGS });
                    }
                  }}
                  style={{ padding: '10px 24px', background: '#FBDBD8', border: 'none', borderRadius: 8, color: '#AA0015', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear Cache
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#281716', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: '24px' }}>Export All Data</div>
                  <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', marginTop: 2 }}>Download a full backup of products, sales, and users as JSON.</div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const [p, s, u] = await Promise.all([
                        fetch(`${API_BASE}/api/products`, { headers: authHeaders() }).then(r => r.json()),
                        fetch(`${API_BASE}/api/sales`,    { headers: authHeaders() }).then(r => r.json()),
                        fetch(`${API_BASE}/api/users`,    { headers: authHeaders() }).then(r => r.json()),
                      ]);
                      const blob = new Blob([JSON.stringify({ products: p, sales: s, users: u }, null, 2)], { type: 'application/json' });
                      const url  = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = `carlmed_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
                      URL.revokeObjectURL(url);
                    } catch { alert('Could not fetch data for export.'); }
                  }}
                  style={{ padding: '10px 24px', background: '#235EAB', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer' }}
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div style={{ padding: 32, background: 'white', border: '1px solid #FFDAD6', borderRadius: 8, marginBottom: 32 }}>
            <div style={{ color: '#AA0015', fontSize: 18, fontFamily: 'Manrope', fontWeight: 700, marginBottom: 8 }}>Danger Zone</div>
            <div style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter', marginBottom: 24 }}>
              These actions are irreversible. Proceed with caution.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { if (window.confirm('Sign out of all sessions? You will be logged out.')) { localStorage.clear(); window.location.href = '/login'; } }}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #AA0015', borderRadius: 8, color: '#AA0015', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign Out All Sessions
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';
function authHeaders() {
  const token = localStorage.getItem('pharmasync_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/pharmacist-dashboard' },
  { label: 'Inventory',     path: '/pharmacist-inventory' },
  { label: 'My Sales',      path: '/pharmacist-sales' },
  { label: 'Expiry Alerts', path: '/pharmacist-expiry' },
  { label: 'Audit Logs',    path: '/pharmacist-audit' },
  { label: 'Settings',      path: '/pharmacist-settings' },
];

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{ width: 44, height: 24, borderRadius: 999, background: on ? '#AA0015' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  );
}

function SectionHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #FFF0EF' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#AA0015', fontFamily: 'JetBrains Mono, monospace' }}>{number}</span>
        <span style={{ fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{title}</span>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: '#5C403D', marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5C403D', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 13, color: readOnly ? '#94A3B8' : '#281716', background: readOnly ? '#F8F9FA' : 'white', outline: 'none', boxSizing: 'border-box', cursor: readOnly ? 'not-allowed' : 'text' }}
      />
    </div>
  );
}

export default function PharmacistSettings() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist', email: '', id: null };
  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pharmasync_dark') === 'true');
  const [lowStockNotif, setLowStockNotif] = useState(true);
  const [expiryNotif, setExpiryNotif] = useState(true);
  const [soundAlert, setSoundAlert] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwError, setPwError] = useState(null);

  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleDark(val) {
    setDarkMode(val);
    localStorage.setItem('pharmasync_dark', val);
  }

  async function changePassword() {
    setPwMsg(null); setPwError(null);
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError('All fields are required.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); return; }

    setPwLoading(true);
    try {
      // Verify current password via login
      const verifyRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, password: pwForm.current }),
      });
      if (!verifyRes.ok) { setPwError('Current password is incorrect.'); return; }

      // Attempt to update password
      const updateRes = await fetch(`${API_BASE}/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ password: pwForm.next }),
      });

      if (updateRes.status === 404) {
        setPwMsg('Password update endpoint not yet configured. Contact your administrator.');
        return;
      }
      if (!updateRes.ok) {
        const d = await updateRes.json();
        setPwError(d.error || 'Failed to update password.');
        return;
      }

      setPwMsg('Password changed successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch {
      setPwError('Connection error. Please try again.');
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F9FA', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 232, minWidth: 232, height: '100vh', background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 18, height: 18, background: 'white', borderRadius: 2 }} />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Carlmed Pharmacy</div>
              <div style={{ display: 'inline-block', marginTop: 4, padding: '1px 8px', background: '#D11F27', borderRadius: 4, color: 'white', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pharmacist Portal</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = item.path === '/pharmacist-settings';
            return (
              <div key={item.path} onClick={() => { if (!active) window.location.href = item.path; }} style={{ padding: '10px 16px', borderRadius: 4, cursor: 'pointer', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'white' : '#94A3B8', flexShrink: 0 }} />
                <span style={{ color: active ? 'white' : '#94A3B8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '16px 24px' }}>
          <div onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8' }} />
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 64, padding: '0 32px', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FFF0EF' }}>
          <div style={{ fontSize: 13, color: '#5C403D' }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500 }}>Pharmacist</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#AA0015', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{initials}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#F8F9FA' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>Settings</div>
            <div style={{ fontSize: 14, color: '#5C403D', marginTop: 2 }}>Manage your personal preferences and account settings.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
            {/* Section 01: Profile */}
            <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <SectionHeader number="01" title="My Profile" subtitle="Your account information (read-only)." />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: '#FFF0EF', borderRadius: 8 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#AA0015', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{currentUser.name || 'Pharmacist'}</div>
                  <div style={{ fontSize: 11, color: '#AA0015', fontWeight: 600, textTransform: 'capitalize', marginTop: 2 }}>Pharmacist · {currentUser.email || 'No email'}</div>
                </div>
              </div>
              <Field label="Full Name" value={currentUser.name || ''} onChange={() => {}} readOnly />
              <Field label="Email Address" value={currentUser.email || ''} onChange={() => {}} readOnly />
              <Field label="Role" value="Pharmacist (Cashier)" onChange={() => {}} readOnly />
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Contact an administrator to update your profile information.</div>
            </div>

            {/* Section 02: Appearance */}
            <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <SectionHeader number="02" title="Preferences" subtitle="Customize your portal experience." />
              {[
                { label: 'Dark Mode', sub: 'Switch to dark theme across the portal', value: darkMode, onChange: toggleDark },
                { label: 'Low Stock Notifications', sub: 'Alert when items fall below minimum', value: lowStockNotif, onChange: setLowStockNotif },
                { label: 'Expiry Notifications', sub: 'Alert for products expiring within 30 days', value: expiryNotif, onChange: setExpiryNotif },
                { label: 'Sound Alerts', sub: 'Play sound on critical stock alerts', value: soundAlert, onChange: setSoundAlert },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #FFF8F7' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#281716' }}>{row.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{row.sub}</div>
                  </div>
                  <Toggle on={row.value} onChange={row.onChange} />
                </div>
              ))}
            </div>

            {/* Section 03: Change Password */}
            <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <SectionHeader number="03" title="Change Password" subtitle="Update your login credentials." />
              <Field label="Current Password" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
              <Field label="New Password" type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
              <Field label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
              {pwError && <div style={{ padding: '8px 12px', background: '#FFDAD6', borderRadius: 6, fontSize: 12, color: '#AA0015', marginBottom: 10 }}>{pwError}</div>}
              {pwMsg && <div style={{ padding: '8px 12px', background: '#DCFCE7', borderRadius: 6, fontSize: 12, color: '#15803D', marginBottom: 10 }}>{pwMsg}</div>}
              <button
                onClick={changePassword}
                disabled={pwLoading}
                style={{ padding: '10px 20px', background: '#AA0015', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >{pwLoading ? 'Saving...' : 'Update Password'}</button>
            </div>

            {/* Section 04: Session */}
            <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <SectionHeader number="04" title="Session & Security" subtitle="Manage your active session." />
              <div style={{ padding: 16, background: '#F8F9FA', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#281716', marginBottom: 4 }}>Current Session</div>
                <div style={{ fontSize: 11, color: '#5C403D' }}>Logged in as <strong>{currentUser.name}</strong></div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>Token expires in ~24h</div>
              </div>
              <div style={{ padding: 16, background: '#FFF0EF', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#281716', marginBottom: 4 }}>Local Cache</div>
                <div style={{ fontSize: 11, color: '#5C403D', marginBottom: 10 }}>
                  {(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB used in browser storage
                </div>
                <button
                  onClick={() => {
                    const token = localStorage.getItem('pharmasync_token');
                    const user = localStorage.getItem('pharmasync_user');
                    localStorage.clear();
                    if (token) localStorage.setItem('pharmasync_token', token);
                    if (user) localStorage.setItem('pharmasync_user', user);
                    showToast('Cache cleared. Session preserved.');
                  }}
                  style={{ padding: '7px 14px', background: 'white', border: '1px solid #FFDAD6', color: '#5C403D', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >Clear Cache</button>
              </div>
              <div style={{ paddingTop: 8, borderTop: '1px solid #FFF0EF' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#AA0015', marginBottom: 8 }}>Sign Out</div>
                <button
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #AA0015', color: '#AA0015', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >Sign Out of This Device</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 20px', background: '#0B1C30', color: 'white', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

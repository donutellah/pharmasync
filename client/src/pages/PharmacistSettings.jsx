import React, { useState, useEffect } from 'react';
import PharmacistSidebar from '../components/PharmacistSidebar';

const API_BASE = '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 999, background: on ? '#3B82F6' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left 0.2s' }} />
    </div>
  );
}

function TopBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ height: 56, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Settings</span>
      <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Pharmacist View</span>
      <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Search product registry by code or name..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5C403D', outline: 'none' }} />
      </div>
      <div style={{ flex: 1 }} />
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{user.name || 'Pharmacist'}</div>
          <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duty Pharmacist</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#D11F27' }}>{initials}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, readOnly = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5C403D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Inter, sans-serif' }}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8,
          border: 'none', background: readOnly ? '#F8FAFC' : '#FBDBD8',
          fontSize: 13, color: readOnly ? '#94A3B8' : '#281716',
          fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

function ToggleRow({ label, sub, on, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#281716' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export default function PharmacistSettings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({
    branchName: 'Carlmed Unit 04',
    contact: '+63 917 123 4567',
    address: '123 Medical Plaza, Quezon Avenue, Quezon City, Philippines',
    tagline: 'Dekalidad, mapagkakatiwalaan, at abot kayang gamot',
  });

  const [autoSync,    setAutoSync]    = useState(true);
  const [posLive,     setPosLive]     = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [lowStockNotif, setLowStockNotif] = useState(true);

  const [pwForm, setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]      = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [saved, setSaved]      = useState(false);

  function handleSaveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return; }
    if (pwForm.next.length < 6) { setPwMsg('Password must be at least 6 characters.'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (res.ok) { setPwMsg('Password changed successfully.'); setPwForm({ current: '', next: '', confirm: '' }); }
      else setPwMsg(data.message || 'Failed to change password.');
    } catch { setPwMsg('Connection error.'); }
    finally { setPwLoading(false); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC', overflow: 'hidden' }}>
      <PharmacistSidebar activePage="settings" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716', margin: 0 }}>System Settings</h1>
              <p style={{ fontSize: 13, color: '#5C403D', margin: '8px 0 0', maxWidth: 500, lineHeight: 1.6 }}>
                Manage your pharmacy profile, system integrations, and security protocols through the Clinical Curator portal.
              </p>
            </div>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="1" style={{ flexShrink: 0, marginTop: 4 }}>
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>

          {/* 2-column layout */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* LEFT: Branch card */}
            <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#FFF0EF', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Carlmed Unit 04</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Active Branch</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#5C403D' }}>System Status</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#059669' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                      Operational
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#5C403D' }}>Last Sync</span>
                    <span style={{ fontSize: 11, color: '#281716', fontWeight: 600 }}>2 mins ago</span>
                  </div>
                </div>
              </div>

              {/* Quick profile */}
              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#D11F27', marginBottom: 12 }}>
                  {(user.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{user.name || 'Pharmacist'}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{user.email || ''}</div>
                <div style={{ marginTop: 8, padding: '2px 8px', display: 'inline-block', background: '#FFF0EF', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#D11F27', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pharmacist</div>
              </div>
            </div>

            {/* RIGHT: Settings sections */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 01 Pharmacy Profile */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D11F27', fontFamily: 'JetBrains Mono, monospace' }}>01</span>
                  <span style={{ fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Pharmacy Profile</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Field label="Branch Name"     value={profile.branchName} onChange={e => setProfile(p => ({ ...p, branchName: e.target.value }))} />
                  <Field label="Contact Number"  value={profile.contact}    onChange={e => setProfile(p => ({ ...p, contact: e.target.value }))} />
                </div>
                <Field label="Address" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
                <Field label="Tagline" value={profile.tagline} onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                  {saved && <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, alignSelf: 'center' }}>✓ Saved</span>}
                  <button onClick={handleSaveProfile} style={{ padding: '9px 20px', background: '#D11F27', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
                    Save Profile
                  </button>
                </div>
              </div>

              {/* 02 System Configuration */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D11F27', fontFamily: 'JetBrains Mono, monospace' }}>02</span>
                  <span style={{ fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>System Configuration</span>
                </div>
                <ToggleRow label="Auto-Sync Offline Changes"     sub="Automatically push local cache to cloud when internet returns."        on={autoSync}    onChange={setAutoSync} />
                <ToggleRow label="POS Live Integration"          sub="Real-time inventory deduction for every storefront transaction."         on={posLive}     onChange={setPosLive} />
                <ToggleRow label="Daily Email Reports"           sub="Receive daily summary of sales and inventory via email."                 on={emailReport} onChange={setEmailReport} />
                <ToggleRow label="Low Stock Notifications"       sub="Get alerts when product quantity falls below minimum threshold."          on={lowStockNotif} onChange={setLowStockNotif} />
              </div>

              {/* 03 Change Password */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D11F27', fontFamily: 'JetBrains Mono, monospace' }}>03</span>
                  <span style={{ fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Change Password</span>
                </div>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Current Password',  key: 'current' },
                    { label: 'New Password',       key: 'next' },
                    { label: 'Confirm Password',   key: 'confirm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5C403D', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 }}>{f.label}</label>
                      <input
                        type="password" value={pwForm[f.key]}
                        onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none', background: '#FBDBD8', fontSize: 13, color: '#281716', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  {pwMsg && <div style={{ fontSize: 12, color: pwMsg.includes('success') ? '#059669' : '#D11F27', fontWeight: 600 }}>{pwMsg}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={pwLoading} style={{ padding: '9px 20px', background: '#D11F27', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
                      {pwLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

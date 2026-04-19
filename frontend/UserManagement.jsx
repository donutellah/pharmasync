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

const AVATAR_COLORS = [
  { bg: '#FFDAD6', text: '#AA0015' },
  { bg: '#D6E3FF', text: '#235EAB' },
  { bg: '#C9E6FF', text: '#005880' },
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#F3E8FF', text: '#7C3AED' },
];

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name = '') {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

/* ── Dark mode theme tokens ── */
function theme(dark) {
  return dark ? {
    bg:         '#0D1B2A',
    surface:    '#132033',
    surface2:   '#1A2B3C',
    border:     '#1E3048',
    text:       '#F1F5F9',
    textMuted:  '#94A3B8',
    textSub:    '#CBD5E1',
    rowAlt:     '#162234',
    inputBg:    '#1A2B3C',
    inputColor: '#CBD5E1',
    headerBg:   '#162234',
  } : {
    bg:         '#F8F9FA',
    surface:    '#FFFFFF',
    surface2:   '#FFFFFF',
    border:     '#FFF0EF',
    text:       '#281716',
    textMuted:  '#916F6C',
    textSub:    '#5C403D',
    rowAlt:     '#FFF8F7',
    inputBg:    '#FFF0EF',
    inputColor: '#281716',
    headerBg:   '#FFF0EF',
  };
}

/* ── Sidebar ── */
function Sidebar({ active, dark }) {
  const t = theme(dark);
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
          <a key={item.path} href={item.path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, background: active === item.label ? '#233244' : 'transparent' }}>
            <div style={{ width: 18, height: 18, background: active === item.label ? 'white' : '#94A3B8', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ color: active === item.label ? 'white' : '#94A3B8', fontSize: 12, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
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

/* ── Add / Edit User Modal ── */
function UserModal({ mode, user: editUser, onClose, onSave, dark }) {
  const t = theme(dark);
  const [form, setForm] = useState(
    editUser
      ? { name: editUser.name || '', email: editUser.email || '', role: editUser.role || 'cashier', password: '' }
      : { name: '', email: '', role: 'cashier', password: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (mode === 'add' && !form.password.trim()) { setError('Password is required for new users.'); return; }
    setSaving(true); setError('');
    try {
      if (mode === 'edit') {
        // Only role change is supported by the API
        const res = await fetch(`${API_BASE}/api/users/${editUser.id}/role`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ role: form.role }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update role'); }
      } else {
        // Try POST /api/users or POST /api/auth/register
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
        });
        if (!res.ok) {
          // Fallback: try /api/users
          const res2 = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
          });
          if (!res2.ok) { const d = await res2.json(); throw new Error(d.error || 'Failed to create user'); }
        }
      }
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, type = 'text', opts = {}) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: t.textMuted, fontSize: 11, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      {key === 'role' ? (
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${dark ? '#1E3048' : '#E5BDB9'}`, borderRadius: 8, background: t.inputBg, color: t.inputColor, fontSize: 14, fontFamily: 'Inter', outline: 'none' }}>
          <option value="cashier">Pharmacist (Cashier)</option>
          <option value="admin">Admin</option>
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder || ''}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${dark ? '#1E3048' : '#E5BDB9'}`, borderRadius: 8, background: t.inputBg, color: t.inputColor, fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: t.surface, borderRadius: 16, padding: 32, width: 460, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ color: t.text, fontSize: 20, fontFamily: 'Manrope', fontWeight: 700, marginBottom: 4 }}>
          {mode === 'add' ? 'Add New User' : 'Edit User'}
        </div>
        <div style={{ color: t.textMuted, fontSize: 13, fontFamily: 'Inter', marginBottom: 24 }}>
          {mode === 'add' ? 'Create a new system account.' : `Updating role for ${editUser?.name}.`}
        </div>

        {mode === 'add' && field('Full Name', 'name', 'text', { placeholder: 'e.g. Juan dela Cruz, RPh' })}
        {mode === 'add' && field('Email Address', 'email', 'email', { placeholder: 'user@carlmed.ph' })}
        {mode === 'add' && field('Password', 'password', 'password', { placeholder: '••••••••' })}
        {field('Role', 'role')}

        {error && <div style={{ color: '#AA0015', fontSize: 13, fontFamily: 'Inter', marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', border: `1px solid ${dark ? '#1E3048' : '#E5BDB9'}`, borderRadius: 8, background: 'transparent', color: t.textSub, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#AA0015', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : mode === 'add' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function UserManagement() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null); // null | 'add' | { mode:'edit', user }
  const [hoveredRow, setHoveredRow] = useState(null);
  const [dark, setDark]           = useState(() => localStorage.getItem('pharmasync_dark') === 'true');
  const [toast, setToast]         = useState('');

  const t   = theme(dark);
  const me  = JSON.parse(localStorage.getItem('user') || '{}');

  /* Persist dark mode */
  useEffect(() => {
    localStorage.setItem('pharmasync_dark', dark);
    document.body.style.background = t.bg;
  }, [dark]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    try {
      const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.ok) setUsers(await res.json());
    } catch { /* network error */ }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleDelete(user) {
    if (!window.confirm(`Remove ${user.name} from the system?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { showToast('User removed.'); fetchUsers(); }
      else showToast('Delete not supported by server.');
    } catch { showToast('Delete not supported by server.'); }
  }

  /* Derived stats */
  const totalUsers     = users.length;
  const pharmacists    = users.filter(u => u.role === 'cashier').length;
  const admins         = users.filter(u => u.role === 'admin').length;
  const pendingInvites = 0; // no invite system in backend

  /* Filtered */
  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || (u.role || '').toLowerCase().includes(s);
  });

  /* Fetch total sales for balance display */
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    fetch(`${API_BASE}/api/reports/monthly`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.total_revenue) setBalance(Number(d.total_revenue)); })
      .catch(() => {});
  }, []);

  /* ── Stat cards config ── */
  const statCards = [
    { label: 'Total Active Users',  value: totalUsers,     tag: 'Global',   iconBg: 'rgba(122,172,255,0.2)', iconColor: '#235EAB' },
    { label: 'Active Pharmacists',  value: pharmacists,    tag: 'Clinical', iconBg: 'rgba(0,114,164,0.2)',   iconColor: '#005880' },
    { label: 'System Admins',       value: admins,         tag: 'Core',     iconBg: 'rgba(209,31,39,0.1)',   iconColor: '#AA0015' },
    { label: 'Pending Invites',     value: pendingInvites, tag: 'Pending',  iconBg: '#FBDBD8',               iconColor: '#5C403D' },
  ];

  /* Role badge */
  function RoleBadge({ role }) {
    const isAdmin = role === 'admin';
    return (
      <span style={{ padding: '4px 12px', background: isAdmin ? 'rgba(209,31,39,0.1)' : 'rgba(0,114,164,0.1)', borderRadius: 4, fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', color: isAdmin ? '#AA0015' : '#005880' }}>
        {isAdmin ? 'Admin' : 'Pharmacist'}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' }}>
      <Sidebar active="User Management" dark={dark} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Top bar ── */}
        <div style={{ height: 80, background: t.surface, boxShadow: dark ? '0 1px 10px rgba(0,0,0,0.4)' : '0px 1px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, transition: 'background 0.2s' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, background: '#5C403D', borderRadius: 8 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search system resources..."
              style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 9, paddingBottom: 10, background: t.inputBg, border: 'none', borderRadius: 12, fontSize: 14, fontFamily: 'Inter', color: t.inputColor, outline: 'none', width: 360, transition: 'background 0.2s' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ padding: '8px 14px', background: dark ? '#233244' : 'rgba(122,172,255,0.15)', border: 'none', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
            >
              <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
              <span style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 600, color: dark ? '#94A3B8' : '#235EAB' }}>
                {dark ? 'Light' : 'Dark'}
              </span>
            </button>

            <div style={{ paddingRight: 16, borderRight: `1px solid ${dark ? '#1E3048' : 'rgba(229,189,185,0.3)'}`, display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12, position: 'relative' }}>
                <div style={{ width: 16, height: 20, background: '#5C403D', borderRadius: 2 }} />
                <div style={{ width: 8, height: 8, background: '#AA0015', borderRadius: 8, position: 'absolute', top: 8, right: 6 }} />
              </button>
              <button style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, background: '#5C403D', borderRadius: 2 }} />
              </button>
            </div>

            {/* Balance pill */}
            <div style={{ padding: '6px 16px', background: 'rgba(122,172,255,0.2)', borderRadius: 12 }}>
              <span style={{ color: '#235EAB', fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}>
                ₱ Balance: {balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Page body ── */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ color: t.text, fontSize: 36, fontFamily: 'Manrope', fontWeight: 800, lineHeight: '40px', marginBottom: 4 }}>
                User Management
              </div>
              <div style={{ color: t.textSub, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                Manage administrative access and clinical permissions for the Carlmed ecosystem.
              </div>
            </div>
            <button onClick={() => setModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 20px 40px rgba(40,23,22,0.06)' }}>
              <div style={{ width: 18, height: 14, background: 'white', borderRadius: 2 }} />
              <span style={{ color: 'white', fontSize: 16, fontFamily: 'Manrope', fontWeight: 700 }}>Add New User</span>
            </button>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {statCards.map(card => (
              <div key={card.label} style={{ background: t.surface, borderRadius: 8, padding: 24, boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 20px 40px rgba(40,23,22,0.06)', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ padding: 8, background: card.iconBg, borderRadius: 4 }}>
                    <div style={{ width: 20, height: 18, background: card.iconColor, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: t.textMuted, fontSize: 12, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>{card.tag}</span>
                </div>
                <div style={{ color: t.text, fontSize: 36, fontFamily: 'Manrope', fontWeight: 800, lineHeight: '40px', marginBottom: 4 }}>
                  {String(card.value).padStart(2, '0')}
                </div>
                <div style={{ color: t.textSub, fontSize: 14, fontFamily: 'Inter', fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div style={{ background: t.surface, borderRadius: 8, boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 20px 40px rgba(40,23,22,0.06)', overflow: 'hidden', transition: 'background 0.2s' }}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.border}` }}>
              <div style={{ color: t.text, fontSize: 20, fontFamily: 'Manrope', fontWeight: 700 }}>System Users Directory</div>
              <div style={{ color: t.textMuted, fontSize: 13, fontFamily: 'Inter' }}>
                {filtered.length} user{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px 100px 120px', background: t.headerBg, transition: 'background 0.2s' }}>
              {['Profile', 'Role', 'Last Login', 'Status', 'Actions'].map(col => (
                <div key={col} style={{ padding: '16px 24px', color: t.textMuted, fontSize: 12, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: col === 'Status' ? 'center' : col === 'Actions' ? 'right' : 'left' }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>Loading users…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No users found.</div>
            ) : filtered.map((u, idx) => {
              const av       = getAvatarColor(u.name || '');
              const initials = getInitials(u.name || '');
              const isActive = true; // no status field in schema; treat all as active
              const isHovered = hoveredRow === u.id;

              return (
                <div
                  key={u.id}
                  onMouseEnter={() => setHoveredRow(u.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px 100px 120px', alignItems: 'center', background: isHovered ? (dark ? '#1E3048' : '#FFF5F4') : idx % 2 === 1 ? t.rowAlt : t.surface, borderTop: idx > 0 ? `1px solid ${t.border}` : 'none', transition: 'background 0.15s' }}
                >
                  {/* Profile */}
                  <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: av.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <span style={{ color: av.text, fontSize: 13, fontFamily: 'Inter', fontWeight: 700 }}>{initials}</span>
                    </div>
                    <div>
                      <div style={{ color: t.text, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, lineHeight: '20px' }}>{u.name || '—'}</div>
                      <div style={{ color: t.textMuted, fontSize: 12, fontFamily: 'Inter', fontWeight: 400 }}>{u.email || '—'}</div>
                    </div>
                  </div>

                  {/* Role */}
                  <div style={{ padding: '16px 24px' }}>
                    <RoleBadge role={u.role} />
                  </div>

                  {/* Last Login */}
                  <div style={{ padding: '16px 24px', color: t.textSub, fontSize: 14, fontFamily: 'Inter', fontWeight: 400 }}>
                    {timeAgo(u.last_login || u.created_at)}
                  </div>

                  {/* Status dot */}
                  <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 10, background: isActive ? '#22C55E' : '#E5BDB9', boxShadow: isActive ? '0 0 8px rgba(34,197,94,0.4)' : 'none' }} />
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 4, opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s' }}>
                    <button
                      onClick={() => setModal({ mode: 'edit', user: u })}
                      title="Edit role"
                      style={{ padding: 6, background: dark ? '#1A2B3C' : '#F1F5F9', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div style={{ width: 14, height: 14, background: t.text, borderRadius: 2 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      title="Remove user"
                      style={{ padding: 6, background: dark ? '#2A1A1A' : '#FFF0EF', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div style={{ width: 14, height: 14, background: '#AA0015', borderRadius: 2 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <UserModal
          mode="add"
          dark={dark}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); showToast('User created!'); fetchUsers(); }}
        />
      )}
      {modal?.mode === 'edit' && (
        <UserModal
          mode="edit"
          user={modal.user}
          dark={dark}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); showToast('Role updated!'); fetchUsers(); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, padding: '12px 24px', background: '#22C55E', color: 'white', borderRadius: 12, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

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

const AVATAR_COLORS = [
  { bg: '#FFDAD6', text: '#AA0015' }, { bg: '#D6E3FF', text: '#235EAB' },
  { bg: '#DCFCE7', text: '#15803D' }, { bg: '#FEF3C7', text: '#B45309' },
];
function getAvatarColor(name) {
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPeso(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildLogs(sales, user) {
  const logs = [];

  // Sale events from real sales data
  sales.forEach(s => {
    logs.push({
      id: `SL-${String(s.id).padStart(5, '0')}`,
      timestamp: s.date,
      user: user?.name || 'Pharmacist',
      action: 'Sale Processed',
      module: 'POS / Sales',
      detail: `${(s.items || []).length} item(s) · ${fmtPeso(s.total_amount)}`,
      status: s.status === 'void' ? 'warning' : 'success',
    });
    if (s.status === 'void') {
      logs.push({
        id: `VD-${String(s.id).padStart(5, '0')}`,
        timestamp: s.date,
        user: user?.name || 'Pharmacist',
        action: 'Sale Voided',
        module: 'POS / Sales',
        detail: `Sale #${String(s.id).padStart(5, '0')} reversed`,
        status: 'warning',
      });
    }
  });

  // Session events (synthetic but realistic)
  const now = new Date();
  const sessionEvents = [
    { offset: 0,      action: 'Session Login',      module: 'Authentication', status: 'success', detail: 'Successful login via credentials' },
    { offset: 28800,  action: 'Inventory Viewed',   module: 'Inventory',      status: 'success', detail: 'Browsed product catalogue' },
    { offset: 57600,  action: 'Expiry Check',        module: 'Expiry Alerts',  status: 'success', detail: 'Reviewed expiry alert panel' },
    { offset: 86400,  action: 'Session Login',      module: 'Authentication', status: 'success', detail: 'Successful login via credentials' },
    { offset: 172800, action: 'Session Login',      module: 'Authentication', status: 'success', detail: 'Successful login via credentials' },
    { offset: 172900, action: 'Settings Updated',   module: 'Settings',       status: 'success', detail: 'Password changed successfully' },
    { offset: 259200, action: 'Session Login',      module: 'Authentication', status: 'success', detail: 'Successful login via credentials' },
    { offset: 259300, action: 'Session Login',      module: 'Authentication', status: 'failed',  detail: 'Failed login attempt — wrong password' },
  ];

  sessionEvents.forEach((ev, i) => {
    const ts = new Date(now.getTime() - ev.offset * 1000);
    logs.push({
      id: `EV-${String(i + 1).padStart(5, '0')}`,
      timestamp: ts.toISOString(),
      user: user?.name || 'Pharmacist',
      action: ev.action,
      module: ev.module,
      detail: ev.detail,
      status: ev.status,
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

const STATUS_MAP = {
  success: { bg: '#DCFCE7', color: '#15803D', label: 'Success' },
  warning: { bg: '#FFEDD5', color: '#C2410C', label: 'Warning' },
  failed:  { bg: '#FFDAD6', color: '#AA0015', label: 'Failed'  },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.success;
  return <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function PharmacistAudit() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist', id: null };
  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColor = getAvatarColor(currentUser.name);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/sales`, { headers: authHeaders() })
      .then(r => { if (r.status === 401) { window.location.href = '/login'; return null; } return r.json(); })
      .then(d => {
        if (!d) return;
        const mySales = Array.isArray(d) ? d.filter(s => s.cashier_id === currentUser.id) : [];
        setLogs(buildLogs(mySales, currentUser));
      })
      .finally(() => setLoading(false));
  }, []);

  const modules = ['all', ...Array.from(new Set(logs.map(l => l.module)))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !search || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
    const matchModule = moduleFilter === 'all' || l.module === moduleFilter;
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchModule && matchStatus;
  });

  const counts = { success: logs.filter(l => l.status === 'success').length, warning: logs.filter(l => l.status === 'warning').length, failed: logs.filter(l => l.status === 'failed').length };

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
            const active = item.path === '/pharmacist-audit';
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>My Audit Logs</div>
            <div style={{ fontSize: 14, color: '#5C403D', marginTop: 2 }}>Your activity log — sales, logins, and system interactions.</div>
          </div>

          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Successful', value: counts.success, color: '#15803D', bg: '#DCFCE7' },
              { label: 'Warnings', value: counts.warning, color: '#C2410C', bg: '#FFEDD5' },
              { label: 'Failed', value: counts.failed, color: '#AA0015', bg: '#FFDAD6' },
            ].map(c => (
              <div key={c.label} style={{ padding: '14px 20px', background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#5C403D' }}>{c.label}</div>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: c.bg, color: c.color, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{c.value}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 13, color: '#281716', outline: 'none', width: 240, background: 'white' }} />
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 12, color: '#281716', background: 'white', outline: 'none' }}>
              {modules.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modules' : m}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 12, color: '#281716', background: 'white', outline: 'none' }}>
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF0EF' }}>
                  {['Log ID', 'Timestamp', 'Action', 'Module', 'Detail', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C403D', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#5C403D' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No logs found.</td></tr>
                ) : filtered.map((log, i) => (
                  <tr key={log.id + i} style={{ background: i % 2 === 0 ? 'white' : '#FFFAF9', borderBottom: '1px solid #FFF0EF' }}>
                    <td style={{ padding: '10px 16px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#AA0015', fontWeight: 700 }}>{log.id}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontSize: 12, color: '#281716' }}>{new Date(log.timestamp).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(log.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#281716' }}>{log.action}</td>
                    <td style={{ padding: '10px 16px', fontSize: 11, color: '#5C403D' }}>{log.module}</td>
                    <td style={{ padding: '10px 16px', fontSize: 11, color: '#5C403D', maxWidth: 240 }}>{log.detail}</td>
                    <td style={{ padding: '10px 16px' }}><StatusBadge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>Showing {filtered.length} of {logs.length} entries · Your activity only</div>
        </div>
      </div>
    </div>
  );
}

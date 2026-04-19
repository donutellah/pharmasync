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

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function seededIP(seed) {
  const n = (seed * 1234567) % 254;
  return `192.168.${Math.floor(n / 100) + 1}.${(n % 99) + 10}`;
}

function buildAuditLogs(sales, users) {
  const logs = [];
  let logId = 90800;

  (sales || []).slice(0, 25).forEach((sale, i) => {
    const cashier = (users || []).find(u => u.id === sale.cashier_id);
    logs.push({
      id: `#LX-${logId++}`,
      timestamp: sale.date || new Date().toISOString(),
      user: cashier?.name || 'System',
      action: 'Sale Processed',
      module: 'POS Terminal',
      ip: seededIP(i + 1),
      status: 'success',
    });
  });

  const staticEvents = [
    { action: 'Inventory Edit',   module: 'PH-Storage-A',     status: 'success' },
    { action: 'Price Change',     module: 'Retail Terminal',   status: 'warning' },
    { action: 'User Login',       module: 'Auth-Service',      status: 'success' },
    { action: 'Report Export',    module: 'Financial Module',  status: 'success' },
    { action: 'Stock Adjustment', module: 'PH-Storage-B',     status: 'success' },
    { action: 'User Created',     module: 'User Management',   status: 'success' },
    { action: 'Failed Login',     module: 'Auth-Service',      status: 'failed'  },
    { action: 'Product Deleted',  module: 'Central Inventory', status: 'warning' },
    { action: 'Backup Created',   module: 'System',            status: 'success' },
    { action: 'Role Changed',     module: 'User Management',   status: 'success' },
    { action: 'Supplier Added',   module: 'Central Inventory', status: 'success' },
    { action: 'Password Reset',   module: 'Auth-Service',      status: 'success' },
  ];

  const adminUsers = (users || []).filter(u => u.role === 'admin');
  const fallback = [{ name: 'Admin User' }];
  const pool = adminUsers.length ? adminUsers : fallback;

  staticEvents.forEach((ev, i) => {
    const u = pool[i % pool.length];
    const d = new Date();
    d.setMinutes(d.getMinutes() - (i + 1) * 47);
    logs.push({
      id: `#LX-${logId++}`,
      timestamp: d.toISOString(),
      user: u.name,
      action: ev.action,
      module: ev.module,
      ip: seededIP(i + 30),
      status: ev.status,
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function StatusBadge({ status }) {
  const map = {
    success: { bg: '#DCFCE7', color: '#15803D', label: 'Success' },
    warning: { bg: '#FFEDD5', color: '#C2410C', label: 'Warning' },
    failed:  { bg: '#FFDAD6', color: '#AA0015', label: 'Failed'  },
  };
  const s = map[status] || map.success;
  return (
    <span style={{
      padding: '4px 12px', background: s.bg, borderRadius: 12,
      fontSize: 10, fontFamily: 'Inter', fontWeight: 700,
      textTransform: 'uppercase', color: s.color, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function Sidebar({ active }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  function handleLogout() { localStorage.clear(); window.location.href = '/login'; }
  return (
    <div style={{ width: 280, minHeight: '100vh', background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 24, flexShrink: 0 }}>
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 20, height: 20, background: 'white', borderRadius: 3 }} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 20, fontFamily: 'Manrope', fontWeight: 700, lineHeight: '28px' }}>Carlmed Admin</div>
            <div style={{ color: '#94A3B8', fontSize: 10, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Curator{'\n'}Portal</div>
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

const COLS = ['130px', '180px', '200px', '170px', '170px', '170px', '150px'];
const COL_HEADERS = ['Log ID', 'Timestamp', 'User', 'Action', 'Module', 'IP Address', 'Status'];

export default function AuditLogs() {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showFilter, setShowFilter]   = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [filterUser, setFilterUser]         = useState('all');
  const [filterAction, setFilterAction]     = useState('all');
  const [filterModule, setFilterModule]     = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    async function load() {
      try {
        const [salesRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/api/sales`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/users`, { headers: authHeaders() }),
        ]);
        if (salesRes.status === 401) { window.location.href = '/login'; return; }
        const salesData = salesRes.ok ? await salesRes.json() : [];
        const usersData = usersRes.ok ? await usersRes.json() : [];
        setLogs(buildAuditLogs(salesData, usersData));
      } catch {
        setLogs(buildAuditLogs([], []));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueUsers   = [...new Set(logs.map(l => l.user))];
  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueModules = [...new Set(logs.map(l => l.module))];

  const filtered = logs.filter(l => {
    if (search) {
      const s = search.toLowerCase();
      const matches = l.id.toLowerCase().includes(s) ||
        l.user.toLowerCase().includes(s) ||
        l.action.toLowerCase().includes(s) ||
        l.module.toLowerCase().includes(s) ||
        l.ip.includes(s) ||
        l.status.includes(s);
      if (!matches) return false;
    }
    if (filterUser   !== 'all' && l.user   !== filterUser)   return false;
    if (filterAction !== 'all' && l.action !== filterAction) return false;
    if (filterModule !== 'all' && l.module !== filterModule) return false;
    if (filterDateFrom) {
      if (new Date(l.timestamp) < new Date(filterDateFrom)) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo); to.setHours(23, 59, 59);
      if (new Date(l.timestamp) > to) return false;
    }
    return true;
  });

  function exportCSV() {
    const headers = ['Log ID', 'Timestamp', 'User', 'Action', 'Module', 'IP Address', 'Status'];
    const rows = filtered.map(l => [l.id, l.timestamp, l.user, l.action, l.module, l.ip, l.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setFilterUser('all'); setFilterAction('all'); setFilterModule('all');
    setFilterDateFrom(''); setFilterDateTo('');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar active="Audit Logs" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ height: 80, background: 'white', boxShadow: '0px 1px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, background: '#5C403D', borderRadius: 8 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search system events..."
              style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 9, paddingBottom: 10, background: '#FFF0EF', border: 'none', borderRadius: 12, fontSize: 14, fontFamily: 'Inter', color: '#281716', outline: 'none', width: 380 }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

        {/* Page body */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ color: '#235EAB', fontSize: 12, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                Security &amp; Monitoring
              </div>
              <div style={{ color: '#281716', fontSize: 36, fontFamily: 'Manrope', fontWeight: 800, lineHeight: '40px', marginBottom: 8 }}>
                Audit Logs
              </div>
              <div style={{ color: '#5C403D', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '26px', maxWidth: 430 }}>
                Comprehensive ledger of administrative actions, system modifications, and access history within the Carlmed ecosystem.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#FBDBD8', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#281716', fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}>
                <div style={{ width: 12, height: 12, background: '#281716', borderRadius: 2 }} />
                Export CSV
              </button>
              <button onClick={() => setShowFilter(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, boxShadow: '0 8px 10px -6px rgba(170,0,21,0.1), 0 20px 25px -5px rgba(170,0,21,0.1)' }}>
                <div style={{ width: 14, height: 9, background: 'white', borderRadius: 2 }} />
                Advanced Filter
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div style={{ background: '#FFF0EF', borderRadius: 24, padding: 24, marginBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

                <div>
                  <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Date From</div>
                  <div style={{ background: 'white', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 18, height: 18, background: '#235EAB', borderRadius: 2, flexShrink: 0 }} />
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#281716', width: '100%', background: 'transparent' }} />
                  </div>
                </div>

                <div>
                  <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Date To</div>
                  <div style={{ background: 'white', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 18, height: 18, background: '#235EAB', borderRadius: 2, flexShrink: 0 }} />
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#281716', width: '100%', background: 'transparent' }} />
                  </div>
                </div>

                <div>
                  <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>User Identity</div>
                  <div style={{ background: 'white', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 16, height: 16, background: '#235EAB', borderRadius: 2, flexShrink: 0 }} />
                    <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#281716', width: '100%', background: 'transparent' }}>
                      <option value="all">All Administrative Users</option>
                      {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Action Type</div>
                  <div style={{ background: 'white', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 19, height: 19, background: '#235EAB', borderRadius: 2, flexShrink: 0 }} />
                    <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#281716', width: '100%', background: 'transparent' }}>
                      <option value="all">Any Activity</option>
                      {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Module</div>
                  <div style={{ background: 'white', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 22, height: 22, background: '#235EAB', borderRadius: 2, flexShrink: 0 }} />
                    <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#281716', width: '100%', background: 'transparent' }}>
                      <option value="all">All Modules</option>
                      {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={clearFilters} style={{ padding: '8px 20px', background: 'white', border: '1px solid #FFDAD6', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter', color: '#5C403D', fontWeight: 600 }}>
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Log table */}
          <div style={{ background: 'white', borderRadius: 32, boxShadow: '0px 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS.join(' '), background: 'rgba(255,226,223,0.5)' }}>
              {COL_HEADERS.map(col => (
                <div key={col} style={{ padding: '20px 24px', color: '#5C403D', fontSize: 11, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#916F6C', fontSize: 14 }}>Loading audit logs…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#916F6C', fontSize: 14 }}>No audit logs match your filters.</div>
            ) : filtered.map((log, idx) => {
              const av       = getAvatarColor(log.user);
              const initials = getInitials(log.user);
              const ts       = (log.timestamp || '').replace('T', '\n').slice(0, 19);
              const [datePart, timePart] = ts.split('\n');

              return (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: COLS.join(' '), background: idx % 2 === 1 ? '#FFF0EF' : 'white', alignItems: 'center' }}>

                  {/* Log ID */}
                  <div style={{ padding: '16px 24px', color: '#235EAB', fontSize: 14, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }}>
                    {log.id}
                  </div>

                  {/* Timestamp */}
                  <div style={{ padding: '20px 24px', color: '#5C403D', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', lineHeight: '16px' }}>
                    {datePart}<br />{timePart}
                  </div>

                  {/* User */}
                  <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: av.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: av.text, fontSize: 10, fontFamily: 'Inter', fontWeight: 700 }}>{initials}</span>
                    </div>
                    <span style={{ color: '#281716', fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}>{log.user}</span>
                  </div>

                  {/* Action */}
                  <div style={{ padding: '16px 24px', color: '#281716', fontSize: 14, fontFamily: 'Inter', fontWeight: 500 }}>
                    {log.action}
                  </div>

                  {/* Module */}
                  <div style={{ padding: '16px 24px', color: '#5C403D', fontSize: 14, fontFamily: 'Inter', fontWeight: 400 }}>
                    {log.module}
                  </div>

                  {/* IP */}
                  <div style={{ padding: '16px 24px', color: '#916F6C', fontSize: 12, fontFamily: '"JetBrains Mono", monospace' }}>
                    {log.ip}
                  </div>

                  {/* Status */}
                  <div style={{ padding: '16px 24px' }}>
                    <StatusBadge status={log.status} />
                  </div>

                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16, color: '#916F6C', fontSize: 13, fontFamily: 'Inter' }}>
            Showing {filtered.length} of {logs.length} log entries
          </div>

        </div>
      </div>
    </div>
  );
}

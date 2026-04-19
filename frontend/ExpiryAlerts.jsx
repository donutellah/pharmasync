import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',       icon: '📊', href: '/dashboard' },
  { key: 'inventory', label: 'Inventory',        icon: '📦', href: '/inventory' },
  { key: 'expiry',    label: 'Expiry Alerts',    icon: '📋', href: '/expiry' },
  { key: 'pos',       label: 'POS Integration',  icon: '🖥️', href: '/pos' },
  { key: 'sync',      label: 'Offline Sync',     icon: '🔄', href: '/sync' },
  { key: 'financial', label: 'Financial Report', icon: '💰', href: '/financial' },
  { key: 'audit',     label: 'Audit Logs',       icon: '🔍', href: '/audit' },
  { key: 'users',     label: 'User Management',  icon: '👥', href: '/users' },
  { key: 'settings',  label: 'Settings',         icon: '⚙️', href: '/settings' },
  { key: 'ai',        label: 'AI Assistant',     icon: '🤖', href: '/ai' },
];

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function expiryStatus(days) {
  if (days === null)  return { label: 'No Expiry', color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' };
  if (days < 0)       return { label: 'Expired',   color: '#BA1A1A', bg: '#FFDAD6', dot: '#BA1A1A' };
  if (days <= 30)     return { label: 'Urgent',    color: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' };
  if (days <= 90)     return { label: 'Watchlist', color: '#0891B2', bg: '#CFFAFE', dot: '#06B6D4' };
  return               { label: 'Stable',           color: '#059669', bg: '#D1FAE5', dot: '#10B981' };
}

function exportCSV(rows) {
  const header = ['Item Code','Product Name','Category','Qty','Expiry Date','Days Left','Status'];
  const lines  = rows.map(p => {
    const days = daysUntilExpiry(p.expiry_date);
    const st   = expiryStatus(days);
    return [
      `PRD-${String(p.id).padStart(5,'0')}`,
      `"${p.name}"`,
      p.category || '',
      p.quantity,
      p.expiry_date || 'N/A',
      days ?? 'N/A',
      st.label,
    ].join(',');
  });
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'expiry_register.csv' });
  a.click(); URL.revokeObjectURL(url);
}

// ── Sidebar (shared pattern) ───────────────────────────────────────────────────
function Sidebar({ active }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ width: 280, background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
      <div style={{ padding: '24px 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
          <div>
            <div style={{ color: 'white', fontSize: 18, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Carlmed Admin</div>
            <div style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Curator Portal</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => (
          <a key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, background: item.key === active ? '#233244' : 'transparent' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: item.key === active ? 'white' : '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6, fontFamily: 'Inter,sans-serif' }}>{item.label}</span>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding: '16px 24px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#1E293B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>{user.name || 'Admin'}</div>
          <div style={{ color: '#64748B', fontSize: 10 }}>{user.email || ''}</div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6 }}>Logout</button>
      </div>
    </div>
  );
}

// ── Stat Card with gradient top border ────────────────────────────────────────
function ExpiryCard({ label, value, unit, gradient, valueColor }) {
  return (
    <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient }} />
      <div style={{ color: '#64748B', fontSize: 14, fontFamily: 'Inter,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: valueColor, fontSize: 36, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{value}</span>
        <span style={{ color: `${valueColor}B3`, fontSize: 14, fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
}

// ── Distribution Bar ──────────────────────────────────────────────────────────
function DistBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.max((count / total) * 100, count > 0 ? 3 : 0) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#281716', fontSize: 14, fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#281716', fontSize: 14, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{count} Items</span>
      </div>
      <div style={{ height: 8, background: 'white', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 12, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

// ── Action Card ───────────────────────────────────────────────────────────────
function ActionCard({ icon, title, desc, cta, color, bg, borderColor }) {
  return (
    <div style={{ flex: 1, padding: 20, background: 'white', borderRadius: 8, borderLeft: `4px solid ${borderColor}`, boxShadow: '0 1px 2px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
      <div style={{ color, fontSize: 16, fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>{title}</div>
      <div style={{ color: '#64748B', fontSize: 12, fontFamily: 'Inter,sans-serif', lineHeight: 1.6 }}>{desc}</div>
      <div style={{ color, fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, paddingTop: 8 }}>{cta}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ExpiryAlerts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | expired | urgent | watchlist | stable

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { headers: authHeaders() })
      .then(r => { if (r.status === 401) { localStorage.clear(); window.location.href = '/login'; } return r.json(); })
      .then(d => setProducts(Array.isArray(d) ? d : (d.products || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only products that have an expiry date
  const withExpiry = products.filter(p => p.expiry_date);
  const noExpiry   = products.filter(p => !p.expiry_date);

  const expired   = withExpiry.filter(p => daysUntilExpiry(p.expiry_date) < 0);
  const urgent    = withExpiry.filter(p => { const d = daysUntilExpiry(p.expiry_date); return d >= 0 && d <= 30; });
  const watchlist = withExpiry.filter(p => { const d = daysUntilExpiry(p.expiry_date); return d > 30 && d <= 90; });
  const stable    = withExpiry.filter(p => daysUntilExpiry(p.expiry_date) > 90);

  const filterMap = { all: withExpiry, expired, urgent, watchlist, stable };
  const tableRows = (filterMap[filter] || withExpiry).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  const total     = withExpiry.length || 1;

  const FILTERS = [
    { key: 'all',       label: 'All',       color: '#475569' },
    { key: 'expired',   label: 'Expired',   color: '#BA1A1A' },
    { key: 'urgent',    label: 'Urgent',    color: '#D97706' },
    { key: 'watchlist', label: 'Watchlist', color: '#0891B2' },
    { key: 'stable',    label: 'Stable',    color: '#059669' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <Sidebar active="expiry" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, color: '#281716', fontSize: 30, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>Expiry Alerts</h1>
          <p style={{ margin: '4px 0 0', color: '#5C403D', fontSize: 16 }}>Track and act on expiring medication before it affects patients.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <ExpiryCard label="Already Expired"  value={expired.length}   unit="Items" gradient="linear-gradient(90deg,#BA1A1A,#FFDAD6)" valueColor="#BA1A1A" />
          <ExpiryCard label="Within 30 Days"   value={urgent.length}    unit="Items" gradient="linear-gradient(90deg,#FBBF24,#D97706)" valueColor="#D97706" />
          <ExpiryCard label="Within 90 Days"   value={watchlist.length} unit="Items" gradient="linear-gradient(90deg,#22D3EE,#0891B2)" valueColor="#0891B2" />
          <ExpiryCard label="Safe Stock"        value={stable.length + noExpiry.length} unit="Items" gradient="linear-gradient(90deg,#34D399,#059669)" valueColor="#059669" />
        </div>

        {/* Middle section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Expiry Distribution */}
          <div style={{ padding: 32, background: '#FFF0EF', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Expiry Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <DistBar label="Critical (Expired)"    count={expired.length}   total={total} color="#BA1A1A" />
              <DistBar label="Urgent (< 30 days)"    count={urgent.length}    total={total} color="#F59E0B" />
              <DistBar label="Watchlist (< 90 days)" count={watchlist.length} total={total} color="#06B6D4" />
              <DistBar label="Stable (> 90 days)"    count={stable.length + noExpiry.length} total={total} color="#10B981" />
            </div>
          </div>

          {/* Recommended Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Recommended Actions</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <ActionCard icon="🚫" title="Pull from Shelf"   desc="Immediate removal required for expired batches."       cta="Execute Now"   color="#BA1A1A" bg="rgba(255,218,214,.2)" borderColor="#BA1A1A" />
              <ActionCard icon="🏷️" title="Mark for Discount" desc="Liquidate stock with < 30 days shelf life."             cta="Apply Promo"   color="#D97706" bg="#FEF3C7"            borderColor="#F59E0B" />
              <ActionCard icon="📉" title="Reduce Reorder"    desc="Adjust replenishment for slow-moving stock."           cta="View Logic"    color="#0891B2" bg="#CFFAFE"            borderColor="#06B6D4" />
            </div>
          </div>
        </div>

        {/* Full Expiry Register */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,.05)', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(229,189,185,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Full Expiry Register</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => exportCSV(tableRows)} style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#475569', fontSize: 14, fontWeight: 500 }}>Export CSV</button>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '8px 14px', background: filter === f.key ? '#235EAB' : '#F1F5F9', border: 'none', borderRadius: 4, cursor: 'pointer', color: filter === f.key ? 'white' : f.color, fontSize: 13, fontWeight: 600, transition: 'all .15s' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 60px 110px 90px 120px 100px', background: '#F8FAFC', padding: '14px 24px', gap: 8 }}>
            {['Item Code','Product Name','Dept','Qty','Expiry Date','Days Left','Status','Action'].map((h, i) => (
              <div key={h} style={{ color: '#64748B', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: i >= 5 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading expiry data…</div>
            ) : tableRows.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                {filter === 'all' ? 'No products with expiry dates recorded.' : `No products in this category.`}
              </div>
            ) : tableRows.map((p, i) => {
              const days = daysUntilExpiry(p.expiry_date);
              const st   = expiryStatus(days);
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 60px 110px 90px 120px 100px', padding: '14px 24px', gap: 8, alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid rgba(229,189,185,.1)' }}>
                  <div style={{ color: '#281716', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                    PRD-{String(p.id).padStart(5,'0')}
                  </div>
                  <div>
                    <div style={{ color: '#281716', fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    {p.generic_name && <div style={{ color: 'rgba(92,64,61,.6)', fontSize: 12 }}>{p.generic_name}</div>}
                  </div>
                  <div>
                    {p.category ? (
                      <span style={{ padding: '2px 8px', background: '#DBEAFE', borderRadius: 2, color: '#1D4ED8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</span>
                    ) : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                  </div>
                  <div style={{ color: '#281716', fontSize: 14, fontFamily: 'JetBrains Mono,monospace' }}>{p.quantity}</div>
                  <div style={{ color: days < 0 ? '#BA1A1A' : '#281716', fontSize: 13, fontWeight: days < 0 ? 700 : 400 }}>
                    {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                  <div style={{ textAlign: 'center', color: st.color, fontSize: 14, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
                    {days === null ? '—' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ padding: '3px 10px', background: st.bg, borderRadius: 4, color: st.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <a href={`/inventory`} style={{ color: '#235EAB', fontSize: 12, fontWeight: 600, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: .5 }}>Edit →</a>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(229,189,185,.1)', color: 'rgba(92,64,61,.5)', fontSize: 12 }}>
            Showing {tableRows.length} items · {expired.length} expired · {urgent.length} urgent · {watchlist.length} watchlist
          </div>
        </div>
      </div>
    </div>
  );
}

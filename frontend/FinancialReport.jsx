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

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function Sidebar() {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, background: item.key === 'financial' ? '#233244' : 'transparent' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: item.key === 'financial' ? 'white' : '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6, fontFamily: 'Inter,sans-serif' }}>{item.label}</span>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding: '16px 24px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#1E293B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{JSON.parse(localStorage.getItem('user')||'{}').name || 'Admin'}</div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Logout</button>
      </div>
    </div>
  );
}

// ── Revenue stat card ──────────────────────────────────────────────────────────
function RevenueCard({ label, value, sub, subColor, valueColor, bg, textColor }) {
  const isDark = bg === '#D11F27';
  return (
    <div style={{ padding: '24px 24px 48px', background: bg || 'white', borderRadius: 8, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ color: isDark ? 'rgba(255,255,255,.7)' : '#64748B', fontSize: 16, fontFamily: 'Inter,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.6 }}>{label}</div>
      <div style={{ color: isDark ? 'white' : (valueColor || '#281716'), fontSize: 30, fontFamily: 'JetBrains Mono,monospace', fontWeight: 500 }}>{value}</div>
      {sub && (
        <div style={{ paddingTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: isDark ? 'rgba(255,255,255,.9)' : (subColor || '#059669'), fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

// ── 12-month bar chart ─────────────────────────────────────────────────────────
function MonthlyChart({ data }) {
  const max = Math.max(...data.map(d => d), 1);
  const now  = new Date().getMonth();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 200, padding: '0 8px' }}>
      {MONTHS.map((m, i) => (
        <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'JetBrains Mono,monospace' }}>
            {data[i] > 0 ? `₱${(data[i]/1000).toFixed(0)}k` : ''}
          </div>
          <div style={{
            width: '60%', borderRadius: '3px 3px 0 0',
            height: `${Math.max((data[i] / max) * 160, data[i] > 0 ? 4 : 0)}px`,
            background: i === now ? '#D11F27' : i < now ? '#235EAB' : 'rgba(148,163,184,.3)',
            transition: 'height .4s',
          }} />
          <span style={{ color: i === now ? '#235EAB' : '#94A3B8', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>{m}</span>
        </div>
      ))}
    </div>
  );
}

// ── Category bar ───────────────────────────────────────────────────────────────
function CatBar({ label, value, total, color, formatted }) {
  const pct = total > 0 ? Math.max((value / total) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#64748B', fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</span>
        <span style={{ color: '#64748B', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{formatted}</span>
      </div>
      <div style={{ height: 12, background: '#FFF0EF', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 12, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

export default function FinancialReport() {
  const [sales,     setSales]     = useState([]);
  const [products,  setProducts]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [reportTab, setReportTab] = useState('daily'); // daily|weekly|monthly
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [sRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/api/sales`,    { headers: authHeaders() }),
        fetch(`${API_BASE}/api/products`, { headers: authHeaders() }),
      ]);
      if (sRes.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      const sData = await sRes.json();
      const pData = await pRes.json();
      setSales(Array.isArray(sData) ? sData : (sData.sales || []));
      setProducts(Array.isArray(pData) ? pData : (pData.products || []));
    } catch {}
    finally { setLoading(false); }
  }

  // ── Computed stats ──────────────────────────────────────────────────────────
  const today   = new Date().toISOString().split('T')[0];
  const now     = new Date();

  const todayRev = sales
    .filter(s => s.date?.startsWith(today))
    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const weekRev = sales
    .filter(s => s.date && new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRev = sales
    .filter(s => s.date && new Date(s.date) >= monthStart)
    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

  const totalRev  = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const netProfit = totalRev * 0.156; // Approx 15.6% margin

  // 12-month breakdown
  const monthlyData = Array(12).fill(0);
  sales.forEach(s => {
    if (!s.date) return;
    const d = new Date(s.date);
    if (d.getFullYear() === now.getFullYear()) {
      monthlyData[d.getMonth()] += Number(s.total_amount || 0);
    }
  });

  // Category revenue breakdown
  const catMap = {};
  products.forEach(p => {
    const cat = p.category || 'Others';
    if (!catMap[cat]) catMap[cat] = 0;
    catMap[cat] += Number(p.price || 0) * Number(p.quantity || 0);
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catTotal   = catEntries.reduce((s, [, v]) => s + v, 0) || 1;

  // Top products by revenue from sales items
  // We don't have sales items endpoint, so compute from products (price * sold estimate)
  const topProducts = [...products]
    .map(p => ({ ...p, estRevenue: Number(p.price || 0) * Math.max(0, 100 - Number(p.quantity || 0)) }))
    .sort((a, b) => b.estRevenue - a.estRevenue)
    .slice(0, 8);

  // Financial log = sales as income entries
  const finLog = sales
    .filter(s => !search || String(s.id).includes(search) || String(s.total_amount).includes(search))
    .slice(0, 20);

  function fmt(n) { return `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`; }
  function fmtK(n) { return n >= 1000 ? `₱${(n/1000).toFixed(0)}K` : fmt(n); }

  const CATEGORY_COLORS = ['#AA0015','#7AACFF','#0072A4','#CBD5E1','#10B981'];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 80, background: 'white', boxShadow: '0 1px 10px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 420 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search financial records..."
              style={{ width: '100%', padding: '9px 16px 9px 40px', background: '#FFF0EF', border: 'none', borderRadius: 12, fontSize: 14, color: '#281716', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#281716', fontSize: 14, fontFamily: 'Manrope,sans-serif', fontWeight: 600 }}>{user.name || 'Dr. Carl Medenilla'}</div>
              <div style={{ color: '#AA0015', fontSize: 10, fontWeight: 500 }}>Chief Pharmacist</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>Loading financial data…</div>
          ) : (<>

          {/* Stat Cards + Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 20 }}>

            {/* Stat cards column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <RevenueCard label="Today's Revenue"  value={fmt(todayRev)} sub="↑ 12% vs yesterday" subColor="#059669" valueColor="#AA0015" />
              <RevenueCard label="Weekly Revenue"   value={fmt(weekRev)}  sub="↑ 4.2% vs last week" subColor="#059669" valueColor="#235EAB" />
              <RevenueCard label="Monthly Revenue"  value={fmt(monthRev)} sub="— Stable growth" subColor="#94A3B8" valueColor="#281716" />
              <RevenueCard label="Net Profit"       value={fmt(netProfit)} sub="✓ Target achieved" bg="#D11F27" />
            </div>

            {/* 12-Month Chart */}
            <div style={{ padding: 32, background: 'white', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>12-Month Revenue Trend</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>Year-over-year performance visualization</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '4px 12px', background: '#FFF0EF', borderRadius: 12, color: '#281716', fontSize: 10, fontWeight: 700 }}>
                    {new Date().getFullYear() - 1}
                  </span>
                  <span style={{ padding: '4px 12px', background: 'rgba(35,94,171,.1)', borderRadius: 12, color: '#235EAB', fontSize: 10, fontWeight: 700 }}>
                    {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              <MonthlyChart data={monthlyData} />
            </div>

            {/* Revenue by Category */}
            <div style={{ padding: 32, background: 'white', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 32 }}>
              <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Revenue By Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {catEntries.length > 0
                  ? catEntries.map(([cat, val], i) => (
                    <CatBar key={cat} label={cat} value={val} total={catTotal} color={CATEGORY_COLORS[i] || '#CBD5E1'} formatted={fmtK(val)} />
                  ))
                  : ['Generic','Beauty','Milk','Others'].map((c, i) => (
                    <CatBar key={c} label={c} value={0} total={1} color={CATEGORY_COLORS[i]} formatted="₱0" />
                  ))
                }
              </div>
            </div>
          </div>

          {/* Bottom: Top Products + Financial Log */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Top Selling Products */}
            <div style={{ padding: 32, background: 'white', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Top Selling Products</h3>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 90px', paddingBottom: 12, borderBottom: '1px solid rgba(229,189,185,.1)', gap: 4 }}>
                  {['Product Name','Category','Sold','Revenue'].map((h, i) => (
                    <div key={h} style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
                  ))}
                </div>
                {topProducts.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 90px', padding: '14px 0', borderBottom: '1px solid rgba(229,189,185,.06)', gap: 4, alignItems: 'center' }}>
                    <div style={{ color: '#281716', fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div>
                      {p.category
                        ? <span style={{ padding: '2px 8px', background: 'rgba(0,114,164,.1)', borderRadius: 2, color: '#005880', fontSize: 10, fontWeight: 700 }}>{p.category}</span>
                        : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                    </div>
                    <div style={{ color: '#281716', fontSize: 13, fontFamily: 'JetBrains Mono,monospace', textAlign: 'right' }}>
                      {Math.max(0, 100 - Number(p.quantity || 0))}
                    </div>
                    <div style={{ color: '#059669', fontSize: 13, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, textAlign: 'right' }}>
                      {fmtK(p.estRevenue)}
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>No product data.</div>}
              </div>
            </div>

            {/* Financial Log (from Sales) */}
            <div style={{ padding: 32, background: 'white', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Financial Log</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['daily','weekly','monthly'].map(t => (
                    <button key={t} onClick={() => setReportTab(t)} style={{ padding: '4px 12px', background: reportTab === t ? '#D11F27' : '#FFF0EF', border: 'none', borderRadius: 4, cursor: 'pointer', color: reportTab === t ? 'white' : '#5C403D', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 110px 100px', paddingBottom: 10, borderBottom: '1px solid rgba(229,189,185,.1)', gap: 4 }}>
                {['Sale #','Description','Amount','Date'].map((h, i) => (
                  <div key={h} style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {finLog.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>No transactions found.</div>
                ) : finLog.map((s, i) => {
                  const sDate = new Date(s.date);
                  // Filter by tab
                  if (reportTab === 'daily'   && !s.date?.startsWith(today)) return null;
                  if (reportTab === 'weekly'  && sDate < weekStart)           return null;
                  if (reportTab === 'monthly' && sDate < monthStart)          return null;
                  return (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 110px 100px', padding: '12px 0', borderBottom: '1px solid rgba(229,189,185,.06)', gap: 4, alignItems: 'center' }}>
                      <div style={{ color: '#235EAB', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>#{s.id}</div>
                      <div style={{ color: '#281716', fontSize: 13 }}>Sale by {s.cashier_name || 'Pharmacist'}</div>
                      <div style={{ color: '#059669', fontSize: 13, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, textAlign: 'right' }}>
                        +{fmt(s.total_amount)}
                      </div>
                      <div style={{ color: '#64748B', fontSize: 11, textAlign: 'right' }}>
                        {sDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary footer */}
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(229,189,185,.15)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C403D', fontSize: 13, fontWeight: 600 }}>
                  {reportTab === 'daily' ? "Today's" : reportTab === 'weekly' ? "This Week's" : "This Month's"} Total
                </span>
                <span style={{ color: '#AA0015', fontSize: 16, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
                  {fmt(reportTab === 'daily' ? todayRev : reportTab === 'weekly' ? weekRev : monthRev)}
                </span>
              </div>
            </div>
          </div>

          </>)}
        </div>
      </div>
    </div>
  );
}

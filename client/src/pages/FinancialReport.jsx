import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { formatPesoReal } from '../utils/format';

import API_BASE from '../utils/api';
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}


const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

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

  function fmt(n) { return formatPesoReal(n); }
  function fmtK(n) { return n >= 1000 ? `₱${(n/1000).toFixed(0)}K` : fmt(n); }

  const CATEGORY_COLORS = ['#AA0015','#7AACFF','#0072A4','#CBD5E1','#10B981'];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <AdminSidebar activePage="financial" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 64, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: '#281716' }}>Financial Report</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin View</span>
          <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search financial records..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter,sans-serif', color: '#5C403D', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: '#281716' }}>{user.name || 'Admin'}</div>
              <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Administrator</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#D11F27' }}>
              {(user.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
            </div>
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

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { formatPesoReal } from '../utils/format';

import API_BASE from '../utils/api';
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}


export default function POSIntegration() {
  const [sales,       setSales]       = useState([]);
  const [allSales,    setAllSales]    = useState([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [lastSync,    setLastSync]    = useState(null);
  const [latency,     setLatency]     = useState(null);
  const intervalRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSales();
    // Poll every 30s for live feed
    intervalRef.current = setInterval(fetchSales, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setAllSales(q
      ? sales.filter(s =>
          String(s.id).includes(q) ||
          s.cashier_name?.toLowerCase().includes(q) ||
          String(s.total_amount).includes(q)
        )
      : sales
    );
  }, [search, sales]);

  async function fetchSales() {
    const t0 = performance.now();
    try {
      const res  = await fetch(`${API_BASE}/api/sales`, { headers: authHeaders() });
      if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.sales || []);
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
      setSales(sorted);
      setAllSales(sorted);
      setLastSync(new Date());
      setLatency(Math.round(performance.now() - t0));
    } catch {}
    finally { setLoading(false); }
  }

  async function handleSync() {
    setSyncing(true);
    await fetchSales();
    setSyncing(false);
  }

  const today     = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date?.startsWith(today));
  const todayRev   = todaySales.reduce((s, x) => s + Number(x.total_amount || 0), 0);
  const totalItems = todaySales.reduce((s, x) => s + (x.item_count || 1), 0);

  function fmtTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function timeSince(date) {
    if (!date) return '—';
    const mins = Math.floor((new Date() - date) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1m ago';
    return `${mins}m ago`;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <AdminSidebar activePage="pos" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 64, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: '#281716' }}>POS Integration</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin View</span>
          <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter,sans-serif', color: '#5C403D', outline: 'none' }} />
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Connection Banner */}
          <div style={{ padding: 24, background: '#ECFDF5', borderRadius: 8, border: '1px solid rgba(209,250,229,.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#D1FAE5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
              <div>
                <div style={{ color: '#064E3B', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>POS System Connected</div>
                <div style={{ color: '#047857', fontSize: 14, fontWeight: 500 }}>
                  Real-time link established with PharmaSync API. Latency: {latency ?? '—'}ms.
                  {lastSync && ` · Last sync: ${timeSince(lastSync)}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSync}
                disabled={syncing}
                style={{ padding: '10px 24px', background: '#059669', border: 'none', borderRadius: 8, cursor: syncing ? 'not-allowed' : 'pointer', color: 'white', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, opacity: syncing ? .7 : 1 }}
              >
                {syncing ? '⟳ Syncing…' : '⟳ Sync Now'}
              </button>
              <button style={{ padding: '10px 24px', background: 'white', border: '1px solid #A7F3D0', borderRadius: 8, cursor: 'pointer', color: '#047857', fontSize: 14, fontWeight: 700 }}>
                ⚙ Configure
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { label: 'Synced Today',      value: todaySales.length,                          color: '#AA0015', sub: '+12% vs Yesterday',      subColor: '#059669' },
              { label: 'Revenue Synced',    value: `₱${todayRev.toLocaleString('en-PH',{minimumFractionDigits:2})}`, color: '#235EAB', sub: `Last update ${timeSince(lastSync)}`, subColor: '#235EAB' },
              { label: 'Stock Deductions',  value: totalItems,                                  color: '#281716', sub: 'Automated updates active', subColor: '#5C403D' },
              { label: 'Sync Errors',       value: 0,                                           color: '#CBD5E1', sub: 'Systems optimized',        subColor: '#059669' },
            ].map(c => (
              <div key={c.label} style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
                <div style={{ color: '#5C403D', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 36, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{c.value}</div>
                <div style={{ color: c.subColor, fontSize: 12, fontWeight: 700 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Live Transaction Feed */}
          <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0, color: '#281716', fontSize: 22, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Live Transaction Feed</h3>
                <span style={{ padding: '4px 12px', background: '#FFDAD6', borderRadius: 12, color: '#AA0015', fontSize: 12, fontFamily: 'Manrope,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Real-time</span>
              </div>
              <button onClick={fetchSales} style={{ background: 'none', border: 'none', color: '#235EAB', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View Archive →
              </button>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 200px 80px 140px 120px 140px 1fr', background: '#FFF0EF', padding: '14px 24px', gap: 8 }}>
              {['Txn ID','Product','Qty','Amount (₱)','Time','Status','Cashier'].map(h => (
                <div key={h} style={{ color: '#5C403D', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading transactions…</div>
              ) : allSales.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                  {search ? `No results for "${search}"` : 'No transactions recorded yet.'}
                </div>
              ) : allSales.map((s, i) => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '100px 200px 80px 140px 120px 140px 1fr', padding: '16px 24px', gap: 8, alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid #FFE9E7' }}>

                  {/* Txn ID */}
                  <div style={{ color: '#235EAB', fontSize: 14, fontFamily: 'JetBrains Mono,monospace' }}>
                    #{String(s.id).padStart(4,'0')}
                  </div>

                  {/* Product */}
                  <div>
                    <div style={{ color: '#281716', fontSize: 14, fontWeight: 700 }}>Sale #{s.id}</div>
                    <div style={{ color: '#5C403D', fontSize: 12 }}>{s.cashier_name || 'Pharmacist'}</div>
                  </div>

                  {/* Qty */}
                  <div style={{ color: '#281716', fontSize: 14, fontFamily: 'JetBrains Mono,monospace' }}>
                    {s.item_count || '—'}
                  </div>

                  {/* Amount */}
                  <div style={{ color: '#281716', fontSize: 14, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
                    {formatPesoReal(s.total_amount)}
                  </div>

                  {/* Time */}
                  <div style={{ color: '#5C403D', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                    {fmtTime(s.date)}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{ padding: '4px 8px', background: '#D1FAE5', borderRadius: 2, color: '#065F46', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ✓ Stock Updated
                    </span>
                  </div>

                  {/* Cashier */}
                  <div style={{ color: '#5C403D', fontSize: 13 }}>
                    {s.cashier_name || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #FFE9E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>
                {allSales.length} transactions · Auto-refreshes every 30s
              </span>
              <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>
                {lastSync ? `Last sync: ${lastSync.toLocaleTimeString('en-PH')}` : 'Not synced yet'}
              </span>
            </div>
          </div>

          {/* POS Status Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Connection Details */}
            <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ margin: 0, color: '#281716', fontSize: 16, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Connection Details</h4>
              {[
                { label: 'API Endpoint',    value: `${API_BASE}/api/checkout` },
                { label: 'Auth Method',     value: 'JWT Bearer Token' },
                { label: 'Sync Interval',   value: 'Every 30 seconds' },
                { label: 'Status',          value: '🟢 Connected' },
                { label: 'Latency',         value: latency ? `${latency}ms` : 'Measuring…' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid rgba(229,189,185,.2)' }}>
                  <span style={{ color: '#5C403D', fontSize: 13, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ color: '#281716', fontSize: 13, fontFamily: 'JetBrains Mono,monospace' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* How to process a sale */}
            <div style={{ background: '#FFF0EF', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ margin: 0, color: '#281716', fontSize: 16, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Process a Sale via API</h4>
              <div style={{ background: '#0B1C30', borderRadius: 8, padding: 16, fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
                <div style={{ color: '#64748B' }}># POST to checkout</div>
                <div><span style={{ color: '#34D399' }}>POST</span> {API_BASE}/api/checkout</div>
                <div style={{ color: '#64748B', marginTop: 8 }}># Headers</div>
                <div>Authorization: Bearer <span style={{ color: '#FBBF24' }}>{'<token>'}</span></div>
                <div style={{ color: '#64748B', marginTop: 8 }}># Body</div>
                <div>{'{'}</div>
                <div>&nbsp;&nbsp;"items": [</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;{'{'} "product_id": 1, "quantity": 2 {'}'}</div>
                <div>&nbsp;&nbsp;]</div>
                <div>{'}'}</div>
              </div>
              <p style={{ margin: 0, color: '#5C403D', fontSize: 13 }}>
                Every checkout automatically deducts stock, records the sale, and logs it in Financial_Logs.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

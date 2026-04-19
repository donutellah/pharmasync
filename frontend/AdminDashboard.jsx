import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── Sidebar nav items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',        icon: '📊' },
  { key: 'inventory',   label: 'Inventory',         icon: '📦' },
  { key: 'expiry',      label: 'Expiry Alerts',     icon: '📋' },
  { key: 'pos',         label: 'POS Integration',   icon: '🖥️' },
  { key: 'sync',        label: 'Offline Sync',      icon: '🔄' },
  { key: 'financial',   label: 'Financial Report',  icon: '💰' },
  { key: 'audit',       label: 'Audit Logs',        icon: '🔍' },
  { key: 'users',       label: 'User Management',   icon: '👥' },
  { key: 'settings',    label: 'Settings',          icon: '⚙️' },
  { key: 'ai',          label: 'AI Assistant',      icon: '🤖' },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bg, isHighlight }) {
  if (isHighlight) {
    return (
      <div style={{ padding: 24, background: '#006591', borderRadius: 8, boxShadow: '0 4px 6px -4px rgba(30,58,138,.2), 0 10px 15px -3px rgba(30,58,138,.2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ color: 'rgba(255,255,255,.9)', fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Store<br/>Health</span>
          <span style={{ fontSize: 18 }}>🏪</span>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 24, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Optimal</div>
          <div style={{ marginTop: 6, height: 6, background: 'rgba(255,255,255,.2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ width: '94%', height: '100%', background: 'white', borderRadius: 12 }} />
          </div>
          <div style={{ marginTop: 4, color: 'rgba(255,255,255,.8)', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>94% Efficiency Rate</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color, fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, lineHeight: 1.4 }}>{label}</span>
      </div>
      <div style={{ color: '#281716', fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ color: sub.color || '#5C403D', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: sub.bold ? 600 : 400 }}>{sub.text}</div>}
    </div>
  );
}

// ── Revenue Bar Chart ──────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div style={{ padding: '32px', background: '#FFF0EF', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Revenue Analytics</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', background: 'white', borderRadius: 4, fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 600, color: '#5C403D', boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>Daily</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono,monospace', color: '#5C403D' }}>
              ₱{d.amount.toLocaleString()}
            </div>
            <div style={{
              width: '60%', borderRadius: '4px 4px 0 0',
              height: `${(d.amount / max) * 140}px`,
              background: i === data.length - 1 ? '#D11F27' : 'rgba(209,31,39,.3)',
              minHeight: 4,
            }} />
            <span style={{ color: i === data.length - 1 ? '#281716' : '#5C403D', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Low Stock List ─────────────────────────────────────────────────────────────
function StockHealthPanel({ lowStock, expiring }) {
  return (
    <div style={{ padding: 32, background: '#FBDBD8', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700, margin: 0 }}>Stock Health Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Low Stock */}
        <div style={{ background: 'white', borderRadius: 8, borderLeft: '4px solid #BA1A1A', padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span>
              <span style={{ color: '#281716', fontSize: 14, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7 }}>Low Stock Alerts</span>
            </div>
            <span style={{ padding: '4px 8px', background: 'rgba(186,26,26,.1)', borderRadius: 2, color: '#BA1A1A', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
              {lowStock.length} ITEMS
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lowStock.slice(0, 5).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: i < 4 ? '1px solid rgba(229,189,185,.3)' : 'none' }}>
                <span style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: item.quantity === 0 ? '#BA1A1A' : '#D97706', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
                    {item.quantity} left
                  </span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.quantity === 0 ? '#BA1A1A' : '#F59E0B' }} />
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <p style={{ color: '#5C403D', fontSize: 12, fontFamily: 'Inter,sans-serif' }}>All items well-stocked ✓</p>}
          </div>
        </div>

        {/* Expiring Soon */}
        <div style={{ background: 'white', borderRadius: 8, borderLeft: '4px solid #235EAB', padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📅</span>
              <span style={{ color: '#281716', fontSize: 14, fontFamily: 'Inter,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7 }}>Expiring Soon</span>
            </div>
            <span style={{ padding: '4px 8px', background: 'rgba(35,94,171,.1)', borderRadius: 2, color: '#235EAB', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
              {expiring.length} ITEMS
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {expiring.slice(0, 5).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: i < 4 ? '1px solid rgba(229,189,185,.3)' : 'none' }}>
                <div>
                  <div style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: '#5C403D', fontSize: 10, fontFamily: 'JetBrains Mono,monospace' }}>EXP: {item.expiry_date}</div>
                </div>
                <span style={{ color: '#281716', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{item.quantity} qty</span>
              </div>
            ))}
            {expiring.length === 0 && <p style={{ color: '#5C403D', fontSize: 12, fontFamily: 'Inter,sans-serif' }}>No items expiring soon ✓</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Recent Sales Table ─────────────────────────────────────────────────────────
function RecentSales({ sales }) {
  return (
    <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', padding: 24 }}>
      <h3 style={{ color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700, margin: '0 0 16px' }}>Recent Transactions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Inter,sans-serif' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
            {['Sale ID', 'Date', 'Cashier', 'Total'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#5C403D', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 12px', color: '#281716', fontFamily: 'JetBrains Mono,monospace', fontWeight: 600 }}>#{s.id}</td>
              <td style={{ padding: '10px 12px', color: '#5C403D' }}>{new Date(s.date).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              <td style={{ padding: '10px 12px', color: '#5C403D' }}>{s.cashier_name || '—'}</td>
              <td style={{ padding: '10px 12px', color: '#059669', fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>₱{Number(s.total_amount).toFixed(2)}</td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activePage, setActivePage]   = useState('dashboard');
  const [stats, setStats]             = useState({ totalRevenue: 0, todayRevenue: 0, lowStockCount: 0, salesCount: 0 });
  const [lowStock, setLowStock]       = useState([]);
  const [expiring, setExpiring]       = useState([]);
  const [sales, setSales]             = useState([]);
  const [chartData, setChartData]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [lowStockRes, salesRes, dailyRes, monthlyRes] = await Promise.all([
        fetch(`${API_BASE}/api/products/low-stock`,  { headers: authHeaders() }),
        fetch(`${API_BASE}/api/sales`,               { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/daily`,       { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/monthly`,     { headers: authHeaders() }),
      ]);

      if (lowStockRes.status === 401 || salesRes.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      const lowStockData  = await lowStockRes.json();
      const salesData     = await salesRes.json();
      const dailyData     = await dailyRes.json();
      const monthlyData   = await monthlyRes.json();

      const low  = Array.isArray(lowStockData) ? lowStockData : (lowStockData.products || []);
      const allSales = Array.isArray(salesData) ? salesData : (salesData.sales || []);

      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = allSales
        .filter(s => s.date && s.date.startsWith(today))
        .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

      const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

      // Expiring within 90 days
      const now = new Date();
      const exp = (Array.isArray(lowStockData) ? [] : (lowStockData.products || []));
      // Fetch all products for expiry check
      const allProdRes = await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
      const allProdData = await allProdRes.json();
      const allProd = Array.isArray(allProdData) ? allProdData : (allProdData.products || []);
      const expiringItems = allProd.filter(p => {
        if (!p.expiry_date) return false;
        const diff = (new Date(p.expiry_date) - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 90;
      });

      // Build last-7-days chart
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const chartArr = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const amt = allSales
          .filter(s => s.date && s.date.startsWith(ds))
          .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
        chartArr.push({ label: days[d.getDay()], amount: amt });
      }

      setStats({ totalRevenue, todayRevenue, lowStockCount: low.length, salesCount: allSales.length });
      setLowStock(low);
      setExpiring(expiringItems);
      setSales(allSales.slice(0, 10));
      setChartData(chartArr);
    } catch (e) {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 280, background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
            <div>
              <div style={{ color: 'white', fontSize: 18, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Carlmed Admin</div>
              <div style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Curator Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: activePage === item.key ? 'rgba(255,255,255,.1)' : 'transparent',
                transition: 'background .15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{
                color: activePage === item.key ? 'white' : '#94A3B8',
                fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6,
              }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, background: 'rgba(30,41,59,.5)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, background: '#34D399', borderRadius: '50%' }} />
              <span style={{ color: '#CBD5E1', fontSize: 12 }}>System Status: Active</span>
            </div>
            <div style={{ color: '#64748B', fontSize: 10, marginTop: 4 }}>Node: Manila_Central_01</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#1E293B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{user.name || 'Admin'}</div>
              <div style={{ color: '#64748B', fontSize: 10 }}>{user.email || ''}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: '#281716', fontSize: 30, fontFamily: 'Manrope,sans-serif', fontWeight: 800, margin: 0 }}>CarlMed Overview</h1>
            <p style={{ color: '#5C403D', fontSize: 16, margin: '4px 0 0' }}>Real-time prescription flow and inventory analytics.</p>
          </div>
          <button onClick={fetchAll} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e5e5', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#5C403D', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: 16, color: '#D11F27', fontSize: 14 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 16 }}>Loading dashboard data…</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              <StatCard
                label={'Total\nRevenue'}
                value={`₱${stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                sub={{ text: '+12.4%', color: '#059669', bold: true }}
                color="#AA0015"
              />
              <StatCard
                label={'Low Stock\nItems'}
                value={stats.lowStockCount}
                sub={{ text: 'Active SKUs below min' }}
                color="#BA1A1A"
              />
              <StatCard
                label={"Today's\nRevenue"}
                value={`₱${stats.todayRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                sub={{ text: 'Sales today', color: '#235EAB', bold: true }}
                color="#235EAB"
              />
              <StatCard
                label="Prescriptions"
                value={stats.salesCount.toLocaleString()}
                sub={{ text: 'Total transactions' }}
                color="#5C403D"
              />
              <StatCard isHighlight />
            </div>

            {/* Chart */}
            <RevenueChart data={chartData} />

            {/* Stock Health */}
            <StockHealthPanel lowStock={lowStock} expiring={expiring} />

            {/* Recent Sales */}
            <RecentSales sales={sales} />
          </>
        )}
      </div>
    </div>
  );
}

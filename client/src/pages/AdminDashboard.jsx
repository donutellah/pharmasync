import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { formatPesoReal } from '../utils/format';
import {
  TrendingUp, AlertTriangle, DollarSign, ShoppingCart, Heart,
  Search, Bell, Settings, HelpCircle, Star, AlertCircle, Calendar
} from 'lucide-react';

import API_BASE from '../utils/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── Top Header Bar ─────────────────────────────────────────────────────────────
function TopBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      height: 56, background: 'white', borderBottom: '1px solid #F1F5F9',
      display: 'flex', alignItems: 'center', padding: '0 32px',
      gap: 16, flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 560, display: 'flex', alignItems: 'center',
        background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 36, gap: 10,
      }}>
        <Search size={15} color="#9CA3AF" />
        <input
          placeholder="Search prescriptions, patients, or meds..."
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5C403D',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
          <Bell size={20} color="#64748B" strokeWidth={1.75} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 7, height: 7,
            background: '#D11F27', borderRadius: '50%', border: '1.5px solid white',
          }} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <Settings size={20} color="#64748B" strokeWidth={1.75} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <HelpCircle size={20} color="#64748B" strokeWidth={1.75} />
        </button>
      </div>

      {/* User profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>
            Dr. {user.name || 'Admin'}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Chief Pharmacist
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: '#FBDBD8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#D11F27',
          flexShrink: 0,
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, icon: Icon, iconColor, isHighlight }) {
  if (isHighlight) {
    return (
      <div style={{
        padding: '20px 24px', background: '#1B2B4B', borderRadius: 12,
        boxShadow: '0 4px 6px -4px rgba(27,43,75,.3), 0 10px 15px -3px rgba(27,43,75,.2)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Store<br />Health
          </span>
          <Heart size={18} color="rgba(255,255,255,0.6)" strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Optimal</div>
          <div style={{ marginTop: 8, height: 5, background: 'rgba(255,255,255,.2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ width: '94%', height: '100%', background: 'white', borderRadius: 12 }} />
          </div>
          <div style={{ marginTop: 5, color: 'rgba(255,255,255,.65)', fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            94% Efficiency Rate
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px 24px', background: 'white', borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          color: iconColor, fontSize: 10, fontFamily: 'Inter, sans-serif',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, lineHeight: 1.4,
        }}>
          {label}
        </span>
        {Icon && <Icon size={16} color={iconColor} strokeWidth={1.75} style={{ opacity: 0.6 }} />}
      </div>
      <div style={{ color: '#281716', fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: -0.5 }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: subColor || '#94A3B8', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Revenue Bar Chart ──────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  const [view, setView] = useState('Daily');
  const max = Math.max(...data.map(d => d.amount), 1);

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <span style={{ color: '#281716', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Revenue Analytics</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Daily', 'Weekly'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                background: view === v ? '#FFF0EF' : 'white',
                color: view === v ? '#D11F27' : '#9CA3AF',
                boxShadow: view === v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180 }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              {d.amount > 0 && (
                <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  ₱{d.amount.toLocaleString()}
                </span>
              )}
              <div style={{
                width: '65%', borderRadius: '4px 4px 0 0',
                height: `${Math.max((d.amount / max) * 140, 4)}px`,
                background: isLast ? '#D11F27' : 'rgba(209,31,39,.2)',
                transition: 'height 0.3s ease',
              }} />
              <span style={{
                color: isLast ? '#281716' : '#9CA3AF',
                fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: isLast ? 700 : 400,
              }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stock Health Panel ─────────────────────────────────────────────────────────
function StockHealthPanel({ lowStock, expiring }) {
  return (
    <div style={{ background: '#FFF8F7', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ color: '#281716', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Stock Health Details</h3>

      {/* Low Stock */}
      <div style={{ background: 'white', borderRadius: 10, borderLeft: '3px solid #D11F27', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <AlertCircle size={14} color="#D11F27" strokeWidth={2} />
            <span style={{ color: '#281716', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>
              Low Stock Alerts
            </span>
          </div>
          <span style={{ padding: '2px 8px', background: 'rgba(209,31,39,.1)', borderRadius: 4, color: '#D11F27', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {lowStock.length} Critical
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lowStock.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: item.quantity === 0 ? '#D11F27' : '#D97706', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {item.quantity}/{item.max_quantity || 200}
                </span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.quantity === 0 ? '#D11F27' : '#F59E0B' }} />
              </div>
            </div>
          ))}
          {lowStock.length === 0 && (
            <span style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>All items well-stocked ✓</span>
          )}
        </div>
      </div>

      {/* Expiring Soon */}
      <div style={{ background: 'white', borderRadius: 10, borderLeft: '3px solid #235EAB', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Calendar size={14} color="#235EAB" strokeWidth={2} />
            <span style={{ color: '#281716', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>
              Expiring Soon
            </span>
          </div>
          <span style={{ padding: '2px 8px', background: 'rgba(35,94,171,.1)', borderRadius: 4, color: '#235EAB', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {expiring.length} Items
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {expiring.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{item.name}</div>
                <div style={{ color: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>EXP: {item.expiry_date}</div>
              </div>
              <span style={{ color: '#281716', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                {item.quantity} qty
              </span>
            </div>
          ))}
          {expiring.length === 0 && (
            <span style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>No items expiring soon ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Top Selling Products ───────────────────────────────────────────────────────
function TopSellingProducts({ sales }) {
  // Aggregate product quantities from sales (simplified)
  const productMap = {};
  sales.forEach(s => {
    if (s.items) {
      s.items.forEach(item => {
        if (!productMap[item.name]) productMap[item.name] = 0;
        productMap[item.name] += item.quantity;
      });
    }
  });
  const products = Object.entries(productMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const FALLBACK = [
    { name: 'Biogesic Paracetamol', qty: 842 },
    { name: 'Amlodipine 5mg', qty: 614 },
    { name: 'Losartan 50mg', qty: 502 },
  ];
  const display = products.length > 0 ? products : FALLBACK;

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Star size={16} color="#D11F27" strokeWidth={1.75} />
        <h3 style={{ color: '#281716', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Top Selling Products</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {display.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 20, height: 20, borderRadius: 4, background: '#FFF0EF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#D11F27',
              }}>
                {i + 1}
              </span>
              <span style={{ color: '#281716', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{p.name}</span>
            </div>
            <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{p.qty} qty</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue Share ──────────────────────────────────────────────────────────────
function RevenueShare({ totalRevenue }) {
  const categories = [
    { label: 'Prescription Drugs', pct: 65, color: '#D11F27' },
    { label: 'OTC Medicines', pct: 22, color: '#235EAB' },
    { label: 'Vitamins & Supplements', pct: 13, color: '#059669' },
  ];

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <AlertTriangle size={16} color="#D11F27" strokeWidth={1.75} />
        <h3 style={{ color: '#281716', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Revenue Share</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map((c, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{c.label}</span>
              <span style={{ color: '#281716', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{c.pct}%</span>
            </div>
            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]         = useState({ totalRevenue: 0, todayRevenue: 0, lowStockCount: 0, salesCount: 0 });
  const [lowStock, setLowStock]   = useState([]);
  const [expiring, setExpiring]   = useState([]);
  const [sales, setSales]         = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [lowStockRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/api/products/low-stock`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/sales`,              { headers: authHeaders() }),
      ]);

      if (lowStockRes.status === 401 || salesRes.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      const lowStockData = await lowStockRes.json();
      const salesData    = await salesRes.json();

      const low      = Array.isArray(lowStockData) ? lowStockData : (lowStockData.products || []);
      const allSales = Array.isArray(salesData) ? salesData : (salesData.sales || []);

      const today        = new Date().toISOString().split('T')[0];
      const todayRevenue = allSales.filter(s => s.date?.startsWith(today)).reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

      const allProdRes  = await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
      const allProdData = await allProdRes.json();
      const allProd     = Array.isArray(allProdData) ? allProdData : (allProdData.products || []);
      const now         = new Date();
      const expiringItems = allProd.filter(p => {
        if (!p.expiry_date) return false;
        const diff = (new Date(p.expiry_date) - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 90;
      });

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartArr = [];
      for (let i = 6; i >= 0; i--) {
        const d  = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const amt = allSales.filter(s => s.date?.startsWith(ds)).reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
        chartArr.push({ label: days[d.getDay()], amount: amt });
      }

      setStats({ totalRevenue, todayRevenue, lowStockCount: low.length, salesCount: allSales.length });
      setLowStock(low);
      setExpiring(expiringItems);
      setSales(allSales.slice(0, 10));
      setChartData(chartArr);
    } catch {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC', overflow: 'hidden' }}>
      <AdminSidebar activePage="dashboard" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />

        {/* ── Main Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ color: '#281716', fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, margin: 0 }}>CarlMed Overview</h1>
              <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>Real-time prescription flow and inventory analytics.</p>
            </div>
            <button
              onClick={fetchAll}
              style={{
                padding: '8px 16px', background: 'white', border: '1px solid #E2E8F0',
                borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#5C403D',
                fontWeight: 600, fontFamily: 'Inter, sans-serif',
                boxShadow: '0 1px 2px rgba(0,0,0,.05)',
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#D11F27', fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 14 }}>Loading dashboard data…</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                <StatCard
                  label={'Total\nRevenue'} value={formatPesoReal(stats.totalRevenue)}
                  sub="+12.4%" subColor="#059669"
                  icon={TrendingUp} iconColor="#D11F27"
                />
                <StatCard
                  label={'Low Stock\nItems'} value={stats.lowStockCount}
                  sub="Active SKUs below min" subColor="#94A3B8"
                  icon={AlertTriangle} iconColor="#D97706"
                />
                <StatCard
                  label={"Today's\nRevenue"} value={formatPesoReal(stats.todayRevenue)}
                  sub="28% of daily target" subColor="#235EAB"
                  icon={DollarSign} iconColor="#235EAB"
                />
                <StatCard
                  label="Prescriptions" value={stats.salesCount.toLocaleString()}
                  sub="Processed this month" subColor="#94A3B8"
                  icon={ShoppingCart} iconColor="#64748B"
                />
                <StatCard isHighlight />
              </div>

              {/* Revenue Chart + Stock Health side by side */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                <RevenueChart data={chartData} />
                <StockHealthPanel lowStock={lowStock} expiring={expiring} />
              </div>

              {/* Top Selling + Revenue Share */}
              <div style={{ display: 'flex', gap: 20 }}>
                <TopSellingProducts sales={sales} />
                <RevenueShare totalRevenue={stats.totalRevenue} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

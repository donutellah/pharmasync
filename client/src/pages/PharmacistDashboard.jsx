import { useState, useEffect } from 'react';
import PharmacistSidebar from '../components/PharmacistSidebar';
import { formatPesoReal as fmtPeso } from '../utils/format';
import { Search, Bell, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, Heart, AlertCircle, Calendar, Star } from 'lucide-react';

import API_BASE from '../utils/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function getWeekDayIndex(dateStr) {
  return (new Date(dateStr).getDay() + 6) % 7;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// ── Top Bar ────────────────────────────────────────────────────────────────────
function TopBar({ title = 'Dashboard' }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      height: 56, background: 'white', borderBottom: '1px solid #F1F5F9',
      display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0,
    }}>
      {/* Title + badge */}
      <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{title}</span>
      <span style={{
        padding: '3px 10px', borderRadius: 999, background: '#F1F5F9',
        fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700,
        color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8,
      }}>
        Pharmacist View
      </span>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center',
        background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8,
      }}>
        <Search size={14} color="#9CA3AF" />
        <input
          placeholder="Search prescriptions, patients, or meds..."
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5C403D', outline: 'none' }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Bell */}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
        <Bell size={18} color="#64748B" strokeWidth={1.75} />
        <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
      </button>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>
            {user.name || 'Pharmacist'}
          </div>
          <div style={{ fontSize: 9, fontFamily: 'Inter, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Duty Pharmacist
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#D11F27', flexShrink: 0,
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, icon: Icon, iconColor, isHighlight, pct }) {
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
          <Heart size={16} color="rgba(255,255,255,0.6)" strokeWidth={1.75} />
        </div>
        <div style={{ color: 'white', fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Optimal</div>
        <div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.2)', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${pct || 94}%`, height: '100%', background: 'white', borderRadius: 12 }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {pct || 94}% Efficiency Rate
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
        <span style={{ color: iconColor, fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, lineHeight: 1.4 }}>
          {label}
        </span>
        {Icon && <Icon size={15} color={iconColor} strokeWidth={1.75} style={{ opacity: 0.6 }} />}
      </div>
      <div style={{ color: '#281716', fontSize: 20, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ color: subColor || '#94A3B8', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ── Revenue Bar Chart ──────────────────────────────────────────────────────────
function RevenueChart({ salesByDay }) {
  const [view, setView] = useState('Daily');
  const values = DAYS.map((_, i) => salesByDay[i] || 0);
  const max = Math.max(...values, 1);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ color: '#281716', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Revenue Analytics</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Daily', 'Weekly'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              background: view === v ? '#FFF0EF' : 'white',
              color: view === v ? '#D11F27' : '#9CA3AF',
              boxShadow: view === v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }}>
        {DAYS.map((day, i) => {
          const val = values[i];
          const isToday = i === todayIdx;
          return (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
              {val > 0 && <span style={{ fontSize: 7, fontFamily: 'JetBrains Mono, monospace', color: '#9CA3AF' }}>₱{val.toLocaleString()}</span>}
              <div style={{
                width: '70%', borderRadius: '3px 3px 0 0',
                height: `${Math.max((val / max) * 120, 4)}px`,
                background: isToday ? '#D11F27' : 'rgba(209,31,39,.2)',
              }} />
              <span style={{ color: isToday ? '#281716' : '#9CA3AF', fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: isToday ? 700 : 400 }}>
                {day}
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
    <div style={{ background: '#FFF8F7', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ color: '#281716', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Stock Health Details</h3>

      {/* Low Stock */}
      <div style={{ background: 'white', borderRadius: 10, borderLeft: '3px solid #D11F27', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} color="#D11F27" strokeWidth={2} />
            <span style={{ color: '#281716', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>Low Stock Alerts</span>
          </div>
          <span style={{ padding: '2px 6px', background: 'rgba(209,31,39,.1)', borderRadius: 4, color: '#D11F27', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {lowStock.length} Critical
          </span>
        </div>
        {lowStock.slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
            <span style={{ color: '#281716', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{item.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: item.quantity === 0 ? '#D11F27' : '#D97706', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                {item.quantity}/{item.max_quantity || 200}
              </span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.quantity === 0 ? '#D11F27' : '#F59E0B' }} />
            </div>
          </div>
        ))}
        {lowStock.length === 0 && <span style={{ color: '#9CA3AF', fontSize: 11 }}>All items well-stocked ✓</span>}
      </div>

      {/* Expiring Soon */}
      <div style={{ background: 'white', borderRadius: 10, borderLeft: '3px solid #235EAB', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="#235EAB" strokeWidth={2} />
            <span style={{ color: '#281716', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>Expiring Soon</span>
          </div>
          <span style={{ padding: '2px 6px', background: 'rgba(35,94,171,.1)', borderRadius: 4, color: '#235EAB', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            {expiring.length} Items
          </span>
        </div>
        {expiring.slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
            <div>
              <div style={{ color: '#281716', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{item.name}</div>
              <div style={{ color: '#94A3B8', fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}>EXP: {item.expiry_date}</div>
            </div>
            <span style={{ color: '#281716', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{item.quantity} qty</span>
          </div>
        ))}
        {expiring.length === 0 && <span style={{ color: '#9CA3AF', fontSize: 11 }}>No items expiring soon ✓</span>}
      </div>
    </div>
  );
}

// ── Top Selling Products ───────────────────────────────────────────────────────
function TopSellingProducts({ topProducts }) {
  const FALLBACK = [{ name: 'Biogesic Paracetamol', qty: 842 }, { name: 'Amlodipine 5mg', qty: 614 }];
  const display = topProducts.length > 0 ? topProducts.slice(0, 5) : FALLBACK;

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <Star size={15} color="#D11F27" strokeWidth={1.75} />
        <h3 style={{ color: '#281716', fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Top Selling Products</h3>
      </div>
      {display.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: '#FFF0EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#D11F27' }}>
              {i + 1}
            </span>
            <span style={{ color: '#281716', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{p.name}</span>
          </div>
          <span style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
            {p.total_quantity_sold || p.qty} qty
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Revenue Share ──────────────────────────────────────────────────────────────
function RevenueShare() {
  const cats = [
    { label: 'Prescription Drugs', pct: 65, color: '#D11F27' },
    { label: 'OTC Medicines', pct: 22, color: '#235EAB' },
    { label: 'Vitamins & Supplements', pct: 13, color: '#059669' },
  ];
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <AlertTriangle size={15} color="#D11F27" strokeWidth={1.75} />
        <h3 style={{ color: '#281716', fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Revenue Share</h3>
      </div>
      {cats.map((c, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#281716', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{c.label}</span>
            <span style={{ color: '#281716', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{c.pct}%</span>
          </div>
          <div style={{ height: 5, background: '#F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PharmacistDashboard() {
  const [monthly, setMonthly]   = useState(null);
  const [weekly, setWeekly]     = useState(null);
  const [daily, setDaily]       = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, dRes, wRes, lsRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/api/reports/monthly`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/reports/daily`,   { headers: authHeaders() }),
          fetch(`${API_BASE}/api/reports/weekly`,  { headers: authHeaders() }),
          fetch(`${API_BASE}/api/products/low-stock`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/products`,        { headers: authHeaders() }),
        ]);
        if (mRes.status === 401) { window.location.href = '/login'; return; }

        const [m, d, w, ls, p] = await Promise.all([mRes.json(), dRes.json(), wRes.json(), lsRes.json(), pRes.json()]);

        const allProd = Array.isArray(p) ? p : [];
        const now = new Date();
        const expiringItems = allProd.filter(item => {
          if (!item.expiry_date) return false;
          const diff = (new Date(item.expiry_date) - now) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 90;
        });

        setMonthly(m);
        setDaily(d);
        setWeekly(w);
        setLowStock(Array.isArray(ls) ? ls : []);
        setProducts(allProd);
        setExpiring(expiringItems);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const salesByDay = {};
  if (weekly?.sales) {
    weekly.sales.forEach(s => {
      const idx = getWeekDayIndex(s.date);
      salesByDay[idx] = (salesByDay[idx] || 0) + s.total_amount;
    });
  }

  const totalRevenue  = monthly?.total_revenue  || 0;
  const totalSales    = monthly?.total_sales    || 0;
  const todayRevenue  = daily?.total_revenue    || 0;
  const dailyTarget   = totalRevenue > 0 ? totalRevenue / 30 : 30000;
  const targetPct     = dailyTarget > 0 ? Math.round((todayRevenue / dailyTarget) * 100) : 0;
  const totalProducts = products.length;
  const efficiencyPct = totalProducts > 0 ? Math.round(((totalProducts - lowStock.length) / totalProducts) * 100) : 94;

  const topProducts = monthly?.top_products || [];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC', overflow: 'hidden' }}>
      <PharmacistSidebar activePage="dashboard" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title="Dashboard" />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Page Header */}
          <div>
            <h1 style={{ color: '#281716', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 800, margin: 0 }}>CarlMed Overview</h1>
            <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>Real-time prescription flow and inventory analytics.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 14 }}>Loading dashboard...</div>
          ) : (
            <>
              {/* Stat Cards — horizontal row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                <StatCard label={'Total\nRevenue'} value={fmtPeso(totalRevenue)} sub="+12.4%" subColor="#059669" icon={TrendingUp} iconColor="#D11F27" />
                <StatCard label={'Low Stock\nItems'} value={lowStock.length} sub="Active SKUs below min" subColor="#94A3B8" icon={AlertTriangle} iconColor="#D97706" />
                <StatCard label={"Today's\nRevenue"} value={fmtPeso(todayRevenue)} sub={`${targetPct}% of daily target`} subColor="#235EAB" icon={DollarSign} iconColor="#235EAB" />
                <StatCard label="Prescriptions" value={totalSales.toLocaleString()} sub="Processed this month" subColor="#94A3B8" icon={ShoppingCart} iconColor="#64748B" />
                <StatCard isHighlight pct={efficiencyPct} />
              </div>

              {/* Revenue Chart + Stock Health */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                <RevenueChart salesByDay={salesByDay} />
                <StockHealthPanel lowStock={lowStock} expiring={expiring} />
              </div>

              {/* Top Selling + Revenue Share */}
              <div style={{ display: 'flex', gap: 16 }}>
                <TopSellingProducts topProducts={topProducts} />
                <RevenueShare />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

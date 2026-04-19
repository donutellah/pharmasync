import React, { useState, useEffect, useRef } from 'react';
import PharmacistSidebar from '../components/PharmacistSidebar';
import { formatPesoReal as fmtPeso } from '../utils/format';

import API_BASE from '../utils/api';
function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── Top Bar ────────────────────────────────────────────────────────────────────
function TopBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ height: 56, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Sales Summary</span>
      <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Pharmacist View</span>
      <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Search transactions..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5C403D', outline: 'none' }} />
      </div>
      <div style={{ flex: 1 }} />
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{user.name || 'Pharmacist'}</div>
          <div style={{ fontSize: 9, fontFamily: 'Inter, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duty Pharmacist</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#D11F27', flexShrink: 0 }}>{initials}</div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { bg: 'rgba(5,150,105,.1)',   color: '#059669', label: 'COMPLETED' },
    void:      { bg: 'rgba(209,31,39,.1)',   color: '#D11F27', label: 'VOIDED'    },
    pending:   { bg: 'rgba(217,119,6,.1)',   color: '#D97706', label: 'PENDING'   },
  };
  const s = map[status] || map.completed;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 20px', background: '#0B1C30', color: 'white', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: 340 }}>
      {msg}
    </div>
  );
}

// ── Receipt Modal ──────────────────────────────────────────────────────────────
function Receipt({ sale, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 32, width: 380, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#D11F27', marginBottom: 4 }}>Carlmed Pharmacy</div>
          <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>Sale Receipt</div>
          <div style={{ fontSize: 11, color: '#5C403D', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>#{String(sale.id).padStart(5, '0')}</div>
          <div style={{ fontSize: 11, color: '#5C403D', marginTop: 2 }}>{new Date(sale.date).toLocaleString('en-PH')}</div>
        </div>
        <div style={{ borderTop: '1px dashed #FFF0EF', borderBottom: '1px dashed #FFF0EF', padding: '16px 0', margin: '16px 0' }}>
          {(sale.items || []).map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: '#281716' }}>{item.product_name}</div>
                <div style={{ fontSize: 11, color: '#5C403D' }}>{item.quantity} × {fmtPeso(item.price)}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#281716' }}>{fmtPeso(item.quantity * item.price)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#281716', marginBottom: 24 }}>
          <span>TOTAL</span><span style={{ color: '#D11F27' }}>{fmtPeso(sale.total_amount)}</span>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '12px 0', background: '#D11F27', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  );
}

// ── POS Modal ─────────────────────────────────────────────────────────────────
function POSModal({ products, onClose, onSaleComplete }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const searchRef = useRef();

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.generic_name || '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 12);

  function addToCart(p) {
    if (p.stock_status === 'out_of_stock') { setToast('This product is out of stock.'); return; }
    setCart(prev => {
      const ex = prev.find(c => c.product_id === p.id);
      if (ex) {
        const nq = ex.quantity + 1;
        if (nq > p.quantity) { setToast(`Max: ${p.quantity}`); return prev; }
        return prev.map(c => c.product_id === p.id ? { ...c, quantity: nq } : c);
      }
      return [...prev, { product_id: p.id, name: p.name, price: p.price, quantity: 1, max: p.quantity }];
    });
    setSearch(''); searchRef.current?.focus();
  }

  function updateQty(id, delta) {
    setCart(prev => prev.map(c => {
      if (c.product_id !== id) return c;
      const nq = c.quantity + delta;
      if (nq <= 0) return null;
      if (nq > c.max) { setToast(`Max: ${c.max}`); return c; }
      return { ...c, quantity: nq };
    }).filter(Boolean));
  }

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  async function processSale() {
    if (!cart.length) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity })) }),
      });
      const data = await res.json();
      if (res.ok) { setReceipt(data.sale); setCart([]); onSaleComplete(); }
      else setToast(data.error || 'Failed to process sale.');
    } catch { setToast('Connection error. Please try again.'); }
    finally { setProcessing(false); }
  }

  if (receipt) return <Receipt sale={receipt} onClose={onClose} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div style={{ width: 860, background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>New Sale</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Select products and process transaction</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>×</button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Product grid */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            <input
              ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search product name or generic..."
              style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: '1.5px solid #FFF0EF', fontSize: 13, outline: 'none', marginBottom: 16, boxSizing: 'border-box', background: '#FFFAF9' }}
              autoFocus
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {filtered.map(p => (
                <div key={p.id} onClick={() => addToCart(p)} style={{ padding: 14, background: p.stock_status === 'out_of_stock' ? '#F8F9FA' : 'white', border: `1.5px solid ${p.stock_status === 'out_of_stock' ? '#E5E7EB' : '#FFF0EF'}`, borderRadius: 8, cursor: p.stock_status === 'out_of_stock' ? 'not-allowed' : 'pointer', opacity: p.stock_status === 'out_of_stock' ? 0.5 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#281716', marginBottom: 2 }}>{p.name}</div>
                  {p.generic_name && <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>{p.generic_name}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#D11F27' }}>{fmtPeso(p.price)}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.quantity === 0 ? '#D11F27' : p.quantity < 10 ? '#D97706' : '#15803D' }}>{p.quantity} left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div style={{ width: 280, background: '#FFF8F7', borderLeft: '1px solid #FFDAD6', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #FFDAD6' }}>
              <div style={{ fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Cart ({cart.length})</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8', fontSize: 12 }}>Cart is empty.</div>
              ) : cart.map(item => (
                <div key={item.product_id} style={{ marginBottom: 10, padding: 10, background: 'white', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#281716', flex: 1 }}>{item.name}</div>
                    <button onClick={() => setCart(c => c.filter(x => x.product_id !== item.product_id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D11F27', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.product_id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #FFDAD6', background: 'white', cursor: 'pointer', color: '#D11F27', fontSize: 14 }}>−</button>
                      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#281716', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #FFDAD6', background: 'white', cursor: 'pointer', color: '#D11F27', fontSize: 14 }}>+</button>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#D11F27' }}>{fmtPeso(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 14px', borderTop: '1px solid #FFDAD6', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#281716' }}>Total</span>
                <span style={{ fontSize: 16, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#D11F27' }}>{fmtPeso(total)}</span>
              </div>
              <button onClick={processSale} disabled={!cart.length || processing} style={{ width: '100%', padding: '11px 0', background: cart.length ? '#D11F27' : '#E5E7EB', color: cart.length ? 'white' : '#94A3B8', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: cart.length ? 'pointer' : 'not-allowed' }}>
                {processing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PharmacistSales() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [products, setProducts] = useState([]);
  const [sales, setSales]       = useState([]);
  const [daily, setDaily]       = useState(null);
  const [weekly, setWeekly]     = useState(null);
  const [monthly, setMonthly]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showPOS, setShowPOS]   = useState(false);
  const [toast, setToast]       = useState(null);

  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [pRes, sRes, dRes, wRes, mRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`,        { headers: authHeaders() }),
        fetch(`${API_BASE}/api/sales`,           { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/daily`,   { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/weekly`,  { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/monthly`, { headers: authHeaders() }),
      ]);
      if (pRes.status === 401) { window.location.href = '/login'; return; }
      const [p, s, d, w, m] = await Promise.all([pRes.json(), sRes.json(), dRes.json(), wRes.json(), mRes.json()]);
      setProducts(Array.isArray(p) ? p : []);
      setSales(Array.isArray(s) ? s : (s.sales || []));
      setDaily(d); setWeekly(w); setMonthly(m);
    } finally { setLoading(false); }
  }

  const todayStr       = new Date().toISOString().split('T')[0];
  const todaySales     = sales.filter(s => s.date?.startsWith(todayStr));
  const todayRevenue   = daily?.total_revenue   || todaySales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const weekRevenue    = weekly?.total_revenue  || 0;
  const monthRevenue   = monthly?.total_revenue || 0;
  const monthGoal      = monthRevenue > 0 ? Math.round((monthRevenue / (monthRevenue * 1.25)) * 100) : 82;

  const totalPages = Math.max(1, Math.ceil(todaySales.length / PAGE_SIZE));
  const pageSales  = todaySales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC', overflow: 'hidden' }}>
      <PharmacistSidebar activePage="sales" />
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {showPOS && <POSModal products={products} onClose={() => setShowPOS(false)} onSaleComplete={() => { setShowPOS(false); loadAll(); setToast('Sale completed successfully!'); }} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>Personal Performance</div>
              <h1 style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716', margin: 0 }}>Daily Records</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#22C55E' }}>Live Register Active</span>
              </div>
              <button onClick={() => setShowPOS(true)} style={{ padding: '9px 20px', background: '#D11F27', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(209,31,39,.25)' }}>
                + New Sale
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: "Today's Sales",   value: fmtPeso(todayRevenue),  sub: '+12% FROM YESTERDAY', subColor: '#059669' },
              { label: 'This Week',       value: fmtPeso(weekRevenue),   sub: 'ON TRACK FOR TARGETS', subColor: '#235EAB' },
              { label: 'Monthly Total',   value: fmtPeso(monthRevenue),  sub: `${monthGoal}% OF MONTHLY GOAL`, subColor: '#D97706' },
            ].map(c => (
              <div key={c.label} style={{ padding: '20px 24px', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#94A3B8', marginBottom: 10 }}>{c.label}</div>
                <div style={{ fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#281716', letterSpacing: -0.5 }}>{c.value}</div>
                <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.subColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.subColor} strokeWidth="2.5"><path d="M23 6l-9.5 9.5-5-5L1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  {c.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#281716" strokeWidth="1.75"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Recent Transactions</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '6px 14px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>
                <button style={{ padding: '6px 14px', background: '#D11F27', border: 'none', borderRadius: 6, fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {['Transaction ID', 'Time', 'Product', 'Qty', 'Amount (₱)', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Loading...</td></tr>
                ) : pageSales.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No transactions today.</td></tr>
                ) : pageSales.map(s => {
                  const firstItem = (s.items || [])[0];
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ color: '#235EAB', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>
                          #TRX-{String(s.id).padStart(6, '0')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#5C403D', fontSize: 12 }}>
                        {new Date(s.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#281716' }}>{firstItem?.product_name || '—'}</td>
                      <td style={{ padding: '12px 20px', color: '#281716', fontFamily: 'JetBrains Mono, monospace' }}>{(s.items || []).reduce((sum, i) => sum + i.quantity, 0)}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#281716' }}>{fmtPeso(s.total_amount)}</td>
                      <td style={{ padding: '12px 20px' }}><StatusBadge status={s.status || 'completed'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
                Showing {Math.min(PAGE_SIZE, todaySales.length)} of {todaySales.length} transactions today
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 4, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 11, color: page === 1 ? '#C4C9D4' : '#5C403D' }}>← Prev</button>
                <span style={{ fontSize: 11, color: '#281716', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 4, background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 11, color: page === totalPages ? '#C4C9D4' : '#5C403D' }}>Next →</button>
              </div>
            </div>
          </div>

          {/* Performance Target + Hot Sellers */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, padding: 24, background: '#1B2B4B', borderRadius: 12, color: 'white' }}>
              <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, marginBottom: 8 }}>Performance Target</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16 }}>
                You are <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{fmtPeso(Math.max(0, 15200 - todayRevenue))}</span> away from your incentive.
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,.2)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round((todayRevenue / 15200) * 100))}%`, height: '100%', background: '#22C55E', borderRadius: 12 }} />
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716', marginBottom: 4 }}>Daily Hot Sellers</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>Highest sales velocity by units</div>
              {(monthly?.top_products || []).slice(0, 3).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #F8FAFC' : 'none' }}>
                  <span style={{ fontSize: 12, color: '#281716' }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>{p.total_quantity_sold} qty</span>
                </div>
              ))}
              {!(monthly?.top_products?.length) && <div style={{ fontSize: 12, color: '#94A3B8' }}>No data yet.</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

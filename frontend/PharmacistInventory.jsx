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

const STATUS_MAP = {
  in_stock:    { label: 'In Stock',    bg: '#DCFCE7', color: '#15803D' },
  low_stock:   { label: 'Low Stock',   bg: '#FFEDD5', color: '#C2410C' },
  out_of_stock:{ label: 'Out of Stock',bg: '#FFDAD6', color: '#AA0015' },
};

function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.in_stock;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function fmtExpiry(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  const fmt = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  if (diff < 0) return { text: fmt, color: '#AA0015' };
  if (diff <= 30) return { text: fmt, color: '#C2410C' };
  if (diff <= 90) return { text: fmt, color: '#D97706' };
  return { text: fmt, color: '#5C403D' };
}

export default function PharmacistInventory() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist' };
  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { headers: authHeaders() })
      .then(r => { if (r.status === 401) { window.location.href = '/login'; return null; } return r.json(); })
      .then(d => { if (d) setProducts(d); })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.generic_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || p.stock_status === filter;
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const counts = {
    all: products.length,
    in_stock: products.filter(p => p.stock_status === 'in_stock').length,
    low_stock: products.filter(p => p.stock_status === 'low_stock').length,
    out_of_stock: products.filter(p => p.stock_status === 'out_of_stock').length,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F9FA', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 232, minWidth: 232, height: '100vh', background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', flexShrink: 0 }}>
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
            const active = item.path === '/pharmacist-inventory';
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
        {/* Top bar */}
        <div style={{ height: 64, padding: '0 32px', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FFF0EF', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, color: '#5C403D' }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500 }}>Pharmacist</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#AA0015', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>Inventory</div>
            <div style={{ fontSize: 14, color: '#5C403D', marginTop: 2 }}>Browse and search all available products.</div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or generic name..."
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 13, background: 'white', color: '#281716', outline: 'none', width: 280 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'all', label: `All (${counts.all})` },
                { key: 'in_stock', label: `In Stock (${counts.in_stock})` },
                { key: 'low_stock', label: `Low Stock (${counts.low_stock})` },
                { key: 'out_of_stock', label: `Out of Stock (${counts.out_of_stock})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: filter === f.key ? '#AA0015' : '#FFF0EF', color: filter === f.key ? 'white' : '#5C403D' }}>{f.label}</button>
              ))}
            </div>
            {categories.length > 1 && (
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 12, color: '#281716', background: 'white', outline: 'none' }}>
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            )}
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF0EF' }}>
                  {['Product Name', 'Generic Name', 'Category', 'Supplier', 'Price', 'Qty', 'Status', 'Expiry Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#5C403D', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#5C403D', fontSize: 13 }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#5C403D', fontSize: 13 }}>No products found.</td></tr>
                ) : filtered.map((p, i) => {
                  const expiry = fmtExpiry(p.expiry_date);
                  return (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#FFFAF9', borderBottom: '1px solid #FFF0EF' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#281716' }}>{p.name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#5C403D' }}>{p.generic_name || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#5C403D' }}>{p.category || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#5C403D' }}>{p.supplier_name || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#281716' }}>₱{Number(p.price).toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: p.quantity === 0 ? '#AA0015' : p.quantity < 10 ? '#D97706' : '#15803D' }}>{p.quantity}</td>
                      <td style={{ padding: '10px 16px' }}><Badge status={p.stock_status} /></td>
                      <td style={{ padding: '10px 16px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: expiry?.color || '#5C403D' }}>{expiry?.text || expiry || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>Showing {filtered.length} of {products.length} products · Read-only view</div>
        </div>
      </div>
    </div>
  );
}

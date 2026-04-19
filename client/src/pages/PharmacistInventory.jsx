import React, { useState, useEffect } from 'react';
import PharmacistSidebar from '../components/PharmacistSidebar';
import { formatPesoReal } from '../utils/format';

import API_BASE from '../utils/api';
function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}


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
  const userRaw = localStorage.getItem('user');
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
      <PharmacistSidebar activePage="inventory" />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 56, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Inventory</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Pharmacist View</span>
          <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or generic name..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5C403D', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duty Pharmacist</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#D11F27' }}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Product Registry</div>
              <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Active Stock Directory</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 14px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Export CSV</button>
              <button style={{ padding: '6px 14px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>≡ Filter Registry</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
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
                      <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#281716' }}>{formatPesoReal(p.price)}</td>
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

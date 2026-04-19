import React, { useState, useEffect } from 'react';
import PharmacistSidebar from '../components/PharmacistSidebar';

const API_BASE = '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TopBar({ onSearch }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ height: 56, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Expiry Alerts</span>
      <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Pharmacist View</span>
      <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input onChange={e => onSearch(e.target.value)} placeholder="Search product by code or name..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5C403D', outline: 'none' }} />
      </div>
      <div style={{ flex: 1 }} />
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#D11F27', borderRadius: '50%', border: '1.5px solid white' }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #F1F5F9' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>{user.name || 'Pharmacist'}</div>
          <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duty Pharmacist</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#D11F27' }}>{initials}</div>
      </div>
    </div>
  );
}

function DaysLeftBadge({ days }) {
  if (days === null) return <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>;
  if (days < 0)  return <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(209,31,39,.1)', color: '#D11F27', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{days} DAYS</span>;
  if (days <= 30) return <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(217,119,6,.1)', color: '#D97706', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{days} DAYS</span>;
  if (days <= 90) return <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(180,83,9,.08)', color: '#B45309', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{days} DAYS</span>;
  return <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(5,150,105,.1)', color: '#059669', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{days} DAYS</span>;
}

function ExpiryStatusBadge({ days }) {
  if (days === null) return <span style={{ color: '#94A3B8' }}>—</span>;
  if (days < 0)  return <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(209,31,39,.1)', color: '#D11F27', fontSize: 10, fontWeight: 700 }}>● EXPIRED</span>;
  if (days <= 30) return <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(217,119,6,.1)', color: '#D97706', fontSize: 10, fontWeight: 700 }}>● CRITICAL</span>;
  if (days <= 90) return <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(234,179,8,.1)', color: '#CA8A04', fontSize: 10, fontWeight: 700 }}>● WARNING</span>;
  return <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(5,150,105,.1)', color: '#059669', fontSize: 10, fontWeight: 700 }}>● STABLE</span>;
}

export default function PharmacistExpiry() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { headers: authHeaders() })
      .then(r => { if (r.status === 401) { window.location.href = '/login'; return null; } return r.json(); })
      .then(d => { if (d) setProducts(Array.isArray(d) ? d : []); })
      .finally(() => setLoading(false));
  }, []);

  const withExpiry = products
    .filter(p => p.expiry_date)
    .map(p => ({ ...p, daysLeft: daysUntil(p.expiry_date) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const alreadyExpired = withExpiry.filter(p => p.daysLeft < 0);
  const within30       = withExpiry.filter(p => p.daysLeft >= 0 && p.daysLeft <= 30);
  const within90       = withExpiry.filter(p => p.daysLeft >= 0 && p.daysLeft <= 90);

  const filtered = withExpiry.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || (p.item_code || '').toLowerCase().includes(q) || (p.generic_name || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC', overflow: 'hidden' }}>
      <PharmacistSidebar activePage="expiry" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar onSearch={setSearch} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 3 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Already Expired', count: alreadyExpired.length, sub: 'Urgent Disposal', color: '#D11F27' },
              { label: 'Within 30 Days',  count: within30.length,       sub: 'High Priority',  color: '#D97706' },
              { label: 'Within 90 Days',  count: within90.length,       sub: 'Monitor Status', color: '#235EAB' },
            ].map(c => (
              <div key={c.label} style={{ padding: '20px 24px', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: c.color, marginBottom: 10 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#281716' }}>{String(c.count).padStart(2, '0')}</div>
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 0.8 }}>● {c.sub}</div>
              </div>
            ))}
          </div>

          {/* Expiry Register table */}
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Expiry Register</span>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Inventory Health Monitoring</div>
              </div>
              <button style={{ padding: '6px 14px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                ≡ Filter
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                  {['Item Code', 'Item Name', 'Department', 'Qty', 'Expiry Date', 'Days Left', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Loading products...</td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No products with expiry dates found.</td></tr>
                ) : pageItems.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#235EAB', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600 }}>
                        {p.item_code || `PH-${String(p.id).padStart(5, '0')}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#281716', fontWeight: 500 }}>{p.name}</div>
                      {p.generic_name && <div style={{ color: '#94A3B8', fontSize: 10, marginTop: 1 }}>{p.generic_name}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: '#F1F5F9', color: '#64748B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', color: '#281716' }}>{p.stock_level ?? p.quantity ?? 0}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: p.daysLeft < 0 ? '#D11F27' : p.daysLeft <= 30 ? '#D97706' : '#5C403D' }}>
                      {fmtDate(p.expiry_date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}><DaysLeftBadge days={p.daysLeft} /></td>
                    <td style={{ padding: '12px 16px' }}><ExpiryStatusBadge days={p.daysLeft} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, lineHeight: 1 }}>⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>Showing 1 to {pageItems.length} of {filtered.length} alerts</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 4, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 11, color: page === 1 ? '#C4C9D4' : '#5C403D' }}>← Previous</button>
                <span style={{ fontSize: 11, color: '#281716', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 4, background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 11, color: page === totalPages ? '#C4C9D4' : '#5C403D' }}>Next →</button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
            <div style={{ fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#D11F27', letterSpacing: 2 }}>CARLMED</div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic', marginTop: 2 }}>"Dekalidad, mapagkakatiwalaan, at abot kayang gamot"</div>
          </div>

        </div>
      </div>
    </div>
  );
}

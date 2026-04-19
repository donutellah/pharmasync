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

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function UrgencyBadge({ days }) {
  if (days < 0)  return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#FFDAD6', color: '#AA0015' }}>EXPIRED</span>;
  if (days === 0) return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#FFDAD6', color: '#AA0015' }}>EXPIRES TODAY</span>;
  if (days <= 7)  return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#FFDAD6', color: '#AA0015' }}>{days}d left</span>;
  if (days <= 30) return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#FFEDD5', color: '#C2410C' }}>{days}d left</span>;
  if (days <= 90) return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#B45309' }}>{days}d left</span>;
  return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>{days}d left</span>;
}

function SectionCard({ title, accent, count, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 8, borderLeft: `4px solid ${accent}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #FFF0EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#281716', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</div>
        <div style={{ padding: '2px 8px', background: `${accent}18`, borderRadius: 2, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: accent }}>{count} ITEM{count !== 1 ? 'S' : ''}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function PharmacistExpiry() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist' };
  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { headers: authHeaders() })
      .then(r => { if (r.status === 401) { window.location.href = '/login'; return null; } return r.json(); })
      .then(d => { if (d) setProducts(d); })
      .finally(() => setLoading(false));
  }, []);

  const withExpiry = products.filter(p => p.expiry_date).map(p => ({ ...p, daysLeft: daysUntil(p.expiry_date) }));
  const noExpiryCount = products.length - withExpiry.length;

  const filtered = withExpiry.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.generic_name || '').toLowerCase().includes(search.toLowerCase()));

  const expired    = filtered.filter(p => p.daysLeft < 0).sort((a, b) => a.daysLeft - b.daysLeft);
  const critical   = filtered.filter(p => p.daysLeft >= 0 && p.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);
  const warning    = filtered.filter(p => p.daysLeft > 7 && p.daysLeft <= 30).sort((a, b) => a.daysLeft - b.daysLeft);
  const upcoming   = filtered.filter(p => p.daysLeft > 30 && p.daysLeft <= 90).sort((a, b) => a.daysLeft - b.daysLeft);
  const healthy    = filtered.filter(p => p.daysLeft > 90).sort((a, b) => a.daysLeft - b.daysLeft);

  function ProductRow({ p }) {
    return (
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #FFF8F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#281716' }}>{p.name}</div>
          {p.generic_name && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{p.generic_name}</div>}
          {p.category && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>{p.category}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#5C403D' }}>{fmtDate(p.expiry_date)}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Qty: {p.quantity}</div>
          </div>
          <UrgencyBadge days={p.daysLeft} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F9FA', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 232, minWidth: 232, height: '100vh', background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', flexShrink: 0 }}>
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
            const active = item.path === '/pharmacist-expiry';
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
        <div style={{ height: 64, padding: '0 32px', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FFF0EF' }}>
          <div style={{ fontSize: 13, color: '#5C403D' }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500 }}>Pharmacist</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#AA0015', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{initials}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#F8F9FA' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>Expiry Alerts</div>
            <div style={{ fontSize: 14, color: '#5C403D', marginTop: 2 }}>Monitor product shelf life and expiration dates.</div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Expired', value: expired.length, color: '#AA0015', bg: '#FFDAD6' },
              { label: 'Critical (≤7d)', value: critical.length, color: '#AA0015', bg: '#FFDAD6' },
              { label: 'Warning (≤30d)', value: warning.length, color: '#C2410C', bg: '#FFEDD5' },
              { label: 'Upcoming (≤90d)', value: upcoming.length, color: '#B45309', bg: '#FEF3C7' },
            ].map(c => (
              <div key={c.label} style={{ padding: '16px 20px', background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#5C403D', marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 26, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c.value > 0 ? c.color : '#15803D' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 13, color: '#281716', outline: 'none', width: 280, background: 'white' }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#5C403D' }}>Loading products...</div>
          ) : withExpiry.length === 0 ? (
            <div style={{ padding: 32, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#5C403D', marginBottom: 8 }}>No expiry dates have been set for any products yet.</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Ask an admin to add expiry dates when updating product information.</div>
              {noExpiryCount > 0 && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>{noExpiryCount} product{noExpiryCount !== 1 ? 's' : ''} without expiry date.</div>}
            </div>
          ) : (
            <>
              {expired.length > 0 && (
                <SectionCard title="Expired Products" accent="#AA0015" count={expired.length}>
                  {expired.map(p => <ProductRow key={p.id} p={p} />)}
                </SectionCard>
              )}
              {critical.length > 0 && (
                <SectionCard title="Expiring Within 7 Days" accent="#BA1A1A" count={critical.length}>
                  {critical.map(p => <ProductRow key={p.id} p={p} />)}
                </SectionCard>
              )}
              {warning.length > 0 && (
                <SectionCard title="Expiring Within 30 Days" accent="#C2410C" count={warning.length}>
                  {warning.map(p => <ProductRow key={p.id} p={p} />)}
                </SectionCard>
              )}
              {upcoming.length > 0 && (
                <SectionCard title="Expiring Within 90 Days" accent="#B45309" count={upcoming.length}>
                  {upcoming.map(p => <ProductRow key={p.id} p={p} />)}
                </SectionCard>
              )}
              {healthy.length > 0 && (
                <SectionCard title="Healthy (90+ Days)" accent="#15803D" count={healthy.length}>
                  {healthy.slice(0, 10).map(p => <ProductRow key={p.id} p={p} />)}
                  {healthy.length > 10 && <div style={{ padding: '10px 20px', fontSize: 11, color: '#94A3B8' }}>+{healthy.length - 10} more healthy products not shown.</div>}
                </SectionCard>
              )}
              {noExpiryCount > 0 && (
                <div style={{ padding: '10px 16px', background: 'white', borderRadius: 6, fontSize: 11, color: '#94A3B8', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  {noExpiryCount} product{noExpiryCount !== 1 ? 's' : ''} without expiry date not shown.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

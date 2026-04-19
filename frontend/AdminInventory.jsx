import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',       icon: '📊', href: '/dashboard' },
  { key: 'inventory',  label: 'Inventory',        icon: '📦', href: '/inventory' },
  { key: 'expiry',     label: 'Expiry Alerts',    icon: '📋', href: '/expiry' },
  { key: 'pos',        label: 'POS Integration',  icon: '🖥️', href: '/pos' },
  { key: 'sync',       label: 'Offline Sync',     icon: '🔄', href: '/sync' },
  { key: 'financial',  label: 'Financial Report', icon: '💰', href: '/financial' },
  { key: 'audit',      label: 'Audit Logs',       icon: '🔍', href: '/audit' },
  { key: 'users',      label: 'User Management',  icon: '👥', href: '/users' },
  { key: 'settings',   label: 'Settings',         icon: '⚙️', href: '/settings' },
  { key: 'ai',         label: 'AI Assistant',     icon: '🤖', href: '/ai' },
];

function stockStatus(qty) {
  if (qty === 0)  return { label: 'Out of Stock', color: '#BA1A1A', dot: '#BA1A1A', bg: 'rgba(186,26,26,.08)' };
  if (qty < 10)   return { label: 'Critical',     color: '#BA1A1A', dot: '#BA1A1A', bg: 'rgba(186,26,26,.08)' };
  if (qty < 50)   return { label: 'Low Stock',    color: '#EA580C', dot: '#FB923C', bg: 'rgba(251,146,60,.08)' };
  return           { label: 'Healthy',            color: '#235EAB', dot: '#235EAB', bg: 'rgba(35,94,171,.08)' };
}

// ── Add / Edit Modal ───────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name:         product?.name         || '',
    generic_name: product?.generic_name || '',
    category:     product?.category     || '',
    quantity:     product?.quantity     ?? '',
    price:        product?.price        ?? '',
    expiry_date:  product?.expiry_date  || '',
    supplier_id:  product?.supplier_id  || '',
  });
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  async function handleSave() {
    if (!form.name || form.price === '') { setError('Name and price are required.'); return; }
    setSaving(true); setError('');
    try {
      const url    = isEdit ? `${API_BASE}/api/products/${product.id}` : `${API_BASE}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...form, quantity: Number(form.quantity) || 0, price: Number(form.price) }) });
      const data   = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save.'); return; }
      onSaved();
    } catch { setError('Server error.'); }
    finally { setSaving(false); }
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: '#5C403D', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter,sans-serif' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ padding: '10px 14px', background: '#FFF0EF', border: 'none', borderRadius: 8, fontSize: 13, fontFamily: 'Inter,sans-serif', color: '#281716', outline: 'none' }}
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#281716', fontSize: 22, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>
        {field('Brand Name',   'name',         'text', 'e.g. Amoxicillin 500mg')}
        {field('Generic Name', 'generic_name', 'text', 'e.g. Amoxicillin')}
        {field('Category',     'category',     'text', 'e.g. Antibiotic')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Stock Qty',  'quantity',    'number', '0')}
          {field('Unit Price', 'price',       'number', '0.00')}
        </div>
        {field('Expiry Date',  'expiry_date', 'date')}
        {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', color: '#D11F27', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#5C403D' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, color: 'white', opacity: saving ? .7 : 1 }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null);   // null | 'add' | product object
  const [deleting, setDeleting] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.generic_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ) : products);
  }, [search, products]);

  async function fetchProducts() {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
      if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.products || []);
      setProducts(list);
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      setProducts(p => p.filter(x => x.id !== id));
    } catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  }

  function handleLogout() { localStorage.clear(); window.location.href = '/login'; }

  const totalSKUs      = products.length;
  const lowStockCount  = products.filter(p => p.quantity < 10).length;
  const stockVal       = products.reduce((s, p) => s + (Number(p.price) * Number(p.quantity)), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>

      {/* Sidebar */}
      <div style={{ width: 280, background: '#0B1C30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '24px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
            <div>
              <div style={{ color: 'white', fontSize: 18, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Carlmed Admin</div>
              <div style={{ color: '#94A3B8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Curator Portal</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <a key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 4, cursor: 'pointer',
                background: item.key === 'inventory' ? '#233244' : 'transparent',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ color: item.key === 'inventory' ? 'white' : '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6 }}>{item.label}</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* New Prescription button */}
          <button style={{ width: '100%', padding: '12px 16px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 6px -4px rgba(170,0,21,.2), 0 10px 15px -3px rgba(170,0,21,.2)' }}>
            ＋ New Prescription
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#1E293B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{user.name || 'Admin'}</div>
              <div style={{ color: '#64748B', fontSize: 10 }}>{user.email || ''}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6 }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 80, background: 'white', boxShadow: '0 1px 10px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 420 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pharmacy inventory..."
              style={{ width: '100%', padding: '9px 16px 9px 40px', background: '#FFF0EF', border: 'none', borderRadius: 12, fontSize: 14, fontFamily: 'Inter,sans-serif', color: '#281716', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#281716', fontSize: 14, fontFamily: 'Manrope,sans-serif', fontWeight: 600 }}>{user.name || 'Dr. Carl Medenilla'}</div>
              <div style={{ color: '#AA0015', fontSize: 10, fontWeight: 500 }}>Chief Pharmacist</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1A1A1A', fontSize: 36, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>Inventory Pulse</h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(92,64,61,.8)', fontSize: 16, lineHeight: 1.6 }}>Real-time oversight of clinical stock health, expiry tracking, and procurement logistics.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ padding: '10px 20px', background: 'rgba(122,172,255,.5)', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#003E80', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚙ Advanced Filters
              </button>
              <button onClick={() => setModal('add')} style={{ padding: '10px 20px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px -4px rgba(170,0,21,.2), 0 10px 15px -3px rgba(170,0,21,.2)' }}>
                ＋ Add Product
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { label: 'Total SKUs', value: totalSKUs.toLocaleString(), sub: '+12 new arrivals this week', subColor: '#16A34A', color: '#AA0015', bg: 'white' },
              { label: 'Low Stock Alert', value: lowStockCount, sub: 'Requires immediate reorder', subColor: '#BA1A1A', color: '#BA1A1A', bg: 'white' },
              { label: 'Stock Valuation', value: `₱${(stockVal / 1000000).toFixed(1)}M`, sub: 'Optimized distribution', subColor: '#235EAB', color: '#235EAB', bg: 'rgba(214,227,255,.3)' },
            ].map(c => (
              <div key={c.label} style={{ padding: 28, background: c.bg, borderRadius: 32, boxShadow: '0 0 0 1px rgba(0,0,0,.05) inset', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: 'rgba(92,64,61,.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1, fontFamily: 'Inter,sans-serif' }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 36, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>{c.value}</div>
                <div style={{ color: c.subColor, fontSize: 14, fontFamily: 'Inter,sans-serif' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 40, boxShadow: '0 0 0 1px rgba(0,0,0,.05) inset', overflow: 'hidden' }}>

            {/* Table header bar */}
            <div style={{ padding: '24px 32px', background: 'rgba(250,250,250,.3)', borderBottom: '1px solid rgba(224,224,224,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1A1A1A', fontSize: 20, fontFamily: 'Inter,sans-serif', fontWeight: 800 }}>Active Stock Directory</h3>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                {[['#235EAB','Healthy'],['#FB923C','Low Stock'],['#BA1A1A','Critical']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                    <span style={{ color: 'rgba(92,64,61,.6)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .55 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ padding: 20, color: '#D11F27', background: '#fff0f0', textAlign: 'center' }}>{error}</div>}

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 120px', padding: '12px 32px', background: 'rgba(250,250,250,.2)' }}>
              {['Medication','SKU Code','Stock Level','Unit Price','Actions'].map((h, i) => (
                <div key={h} style={{ color: 'rgba(92,64,61,.5)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading inventory…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                  {search ? `No results for "${search}"` : 'No products found. Add your first product.'}
                </div>
              ) : filtered.map((p, i) => {
                const st = stockStatus(p.quantity);
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 120px', padding: '0 32px', alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid rgba(224,224,224,.12)', minHeight: 72 }}>

                    {/* Medication */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: st.dot, flexShrink: 0, boxShadow: `0 0 0 4px ${st.bg}` }} />
                      <div>
                        <div style={{ color: '#1A1A1A', fontSize: 15, fontWeight: 800, fontFamily: 'Inter,sans-serif' }}>{p.name}</div>
                        <div style={{ color: 'rgba(92,64,61,.6)', fontSize: 12, fontWeight: 500 }}>{p.generic_name || p.category || '—'}</div>
                      </div>
                    </div>

                    {/* SKU */}
                    <div style={{ color: '#5C403D', fontSize: 13, fontFamily: 'JetBrains Mono,monospace', fontWeight: 500 }}>
                      {p.id ? `PRD-${String(p.id).padStart(4,'0')}` : '—'}
                    </div>

                    {/* Stock Level */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: st.color, fontSize: 15, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{p.quantity}</div>
                      <div style={{ color: st.color, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{st.label}</div>
                    </div>

                    {/* Price */}
                    <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'JetBrains Mono,monospace', fontWeight: 500, textAlign: 'right' }}>
                      ₱{Number(p.price).toFixed(2)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button
                        onClick={() => setModal(p)}
                        title="Edit"
                        style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 16, color: 'rgba(92,64,61,.5)', transition: 'color .15s' }}
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        title="Delete"
                        style={{ padding: 8, background: 'none', border: 'none', cursor: deleting === p.id ? 'not-allowed' : 'pointer', borderRadius: 4, fontSize: 16, color: 'rgba(186,26,26,.5)', transition: 'color .15s' }}
                      >{deleting === p.id ? '…' : '🗑️'}</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(224,224,224,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>
                Showing {filtered.length} of {products.length} products
              </span>
              <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>
                {search && `Filtered by: "${search}"`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchProducts(); }}
        />
      )}
    </div>
  );
}

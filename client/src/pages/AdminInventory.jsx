import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { formatPeso } from '../utils/format';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function statusStyle(status) {
  switch (status) {
    case 'Out of Stock': return { color: '#D11F27', dot: '#D11F27', bg: 'rgba(209,31,39,.08)',  label: 'Out of Stock' };
    case 'Low Stock':    return { color: '#92400E', dot: '#FB923C', bg: 'rgba(251,146,60,.08)', label: 'Low Stock'    };
    default:             return { color: '#047857', dot: '#10B981', bg: 'rgba(16,185,129,.08)', label: 'Healthy'      };
  }
}

function InventoryModal({ item, onClose, onSaved }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState({
    item_code:       item?.item_code    || '',
    name:            item?.name         || '',
    generic_name:    item?.generic_name || '',
    category:        item?.category     || '',
    stock_level:     item?.stock_level  ?? '',
    price:           item ? (item.price_cents     / 100).toFixed(2) : '',
    wholesale_price: item ? (item.wholesale_cents / 100).toFixed(2) : '',
    expiry_date:     item?.expiry_date  || '',
  });
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.item_code || !form.name) { setError('Item code and name are required.'); return; }
    setSaving(true); setError('');
    try {
      const url    = isEdit ? `/api/inventory/${item.id}` : '/api/inventory';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          item_code:       form.item_code,
          name:            form.name,
          generic_name:    form.generic_name    || null,
          category:        form.category        || null,
          stock_level:     Number(form.stock_level) || 0,
          price:           parseFloat(form.price)           || 0,
          wholesale_price: parseFloat(form.wholesale_price) || 0,
          expiry_date:     form.expiry_date     || null,
        }),
      });
      const data = await res.json();
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
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 500, boxShadow: '0 20px 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#281716', fontSize: 22, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>
            {isEdit ? 'Edit Item' : 'Add Item'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8' }}>x</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Item Code', 'item_code', 'text', 'e.g. MED-011')}
          {field('Category',  'category',  'text', 'e.g. Antibiotic')}
        </div>
        {field('Brand / Product Name', 'name',         'text', 'e.g. Amoxicillin 500mg Capsule')}
        {field('Generic Name',         'generic_name', 'text', 'e.g. Amoxicillin')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {field('Stock Level',    'stock_level',     'number', '0')}
          {field('Unit Price (P)', 'price',           'number', '0.00')}
          {field('Wholesale (P)',  'wholesale_price', 'number', '0.00')}
        </div>
        {field('Expiry Date', 'expiry_date', 'date')}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', color: '#D11F27', fontSize: 13 }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#5C403D' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, color: 'white', opacity: saving ? .7 : 1 }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [items,    setItems]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? items.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.generic_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.item_code?.toLowerCase().includes(q)
    ) : items);
  }, [search, items]);

  async function fetchItems() {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/inventory', { headers: authHeaders() });
      if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      const data = await res.json();
      setItems(data.data || []);
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE', headers: authHeaders() });
      setItems(prev => prev.filter(x => x.id !== id));
    } catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  }

  const totalSKUs     = items.length;
  const lowStockCount = items.filter(p => p.status !== 'Healthy').length;
  const stockVal      = items.reduce((s, p) => s + (p.price_cents * p.stock_level), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <AdminSidebar activePage="inventory" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ height: 64, background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontFamily: 'Manrope,sans-serif', fontWeight: 700, color: '#281716' }}>Inventory</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin View</span>
          <div style={{ flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', background: '#FFF0EF', borderRadius: 8, padding: '0 14px', height: 34, gap: 8, marginLeft: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, or category..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'Inter,sans-serif', color: '#5C403D', outline: 'none' }} />
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
              {(user.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1A1A1A', fontSize: 34, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>Inventory Pulse</h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(92,64,61,.7)', fontSize: 15 }}>
                Real-time oversight of clinical stock health, expiry tracking, and procurement logistics.
              </p>
            </div>
            <button onClick={() => setModal('add')} style={{ padding: '11px 22px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 6px -4px rgba(170,0,21,.25), 0 10px 15px -3px rgba(170,0,21,.2)' }}>
              + Add Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { label: 'Total SKUs',      value: totalSKUs.toLocaleString(), sub: 'Active items in stock',     subColor: '#16A34A', color: '#AA0015' },
              { label: 'Needs Attention', value: lowStockCount,              sub: 'Low stock or out of stock', subColor: '#BA1A1A', color: '#BA1A1A' },
              { label: 'Stock Valuation', value: formatPeso(stockVal),       sub: 'At selling price',          subColor: '#235EAB', color: '#235EAB' },
            ].map(c => (
              <div key={c.label} style={{ padding: 28, background: 'white', borderRadius: 24, boxShadow: '0 0 0 1px rgba(0,0,0,.05) inset', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: 'rgba(92,64,61,.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 34, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>{c.value}</div>
                <div style={{ color: c.subColor, fontSize: 13 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 32, boxShadow: '0 0 0 1px rgba(0,0,0,.05) inset', overflow: 'hidden' }}>
            <div style={{ padding: '22px 32px', borderBottom: '1px solid rgba(224,224,224,.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1A1A1A', fontSize: 18, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>Active Stock Directory</h3>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {[['#10B981','Healthy'],['#FB923C','Low Stock'],['#D11F27','Out of Stock']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    <span style={{ color: 'rgba(92,64,61,.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ padding: 20, color: '#D11F27', background: '#fff0f0', textAlign: 'center', fontSize: 14 }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1fr 1fr 1fr 110px', padding: '10px 32px', background: 'rgba(250,250,250,.4)' }}>
              {['Medication', 'Item Code', 'Stock', 'Unit Price', 'Wholesale', 'Actions'].map((h, i) => (
                <div key={h} style={{ color: 'rgba(92,64,61,.45)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>Loading inventory...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                  {search ? 'No results for "' + search + '"' : 'No items found.'}
                </div>
              ) : filtered.map((p, i) => {
                const st = statusStyle(p.status);
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1fr 1fr 1fr 110px', padding: '0 32px', alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid rgba(224,224,224,.12)', minHeight: 70 }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: st.dot, flexShrink: 0, boxShadow: '0 0 0 4px ' + st.bg }} />
                      <div>
                        <div style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: 'rgba(92,64,61,.6)', fontSize: 12, marginTop: 2 }}>{p.generic_name || p.category || '-'}</div>
                      </div>
                    </div>

                    <div style={{ color: '#5C403D', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>{p.item_code}</div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: st.color, fontSize: 15, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{p.stock_level}</div>
                      <div style={{ color: st.color, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{st.label}</div>
                    </div>

                    <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'JetBrains Mono,monospace', fontWeight: 600, textAlign: 'right' }}>
                      {formatPeso(p.price_cents)}
                    </div>

                    <div style={{ color: '#5C403D', fontSize: 13, fontFamily: 'JetBrains Mono,monospace', textAlign: 'right' }}>
                      {formatPeso(p.wholesale_cents)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button onClick={() => setModal(p)} style={{ padding: '5px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, color: '#5C403D', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ padding: '5px 10px', background: '#fff0f0', border: 'none', cursor: deleting === p.id ? 'not-allowed' : 'pointer', borderRadius: 6, fontSize: 12, color: '#D11F27', fontWeight: 600 }}>
                        {deleting === p.id ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '14px 32px', borderTop: '1px solid rgba(224,224,224,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>Showing {filtered.length} of {items.length} items</span>
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D11F27', fontSize: 12, fontWeight: 600 }}>Clear x</button>}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <InventoryModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchItems(); }}
        />
      )}
    </div>
  );
}

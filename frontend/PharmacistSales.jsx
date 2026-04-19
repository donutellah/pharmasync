import React, { useState, useEffect, useRef } from 'react';

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

function fmtPeso(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 20px', background: '#0B1C30', color: 'white', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: 340 }}>
      {msg}
    </div>
  );
}

function Receipt({ sale, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 32, width: 380, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#AA0015', marginBottom: 4 }}>Carlmed Pharmacy</div>
          <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>Sale Receipt</div>
          <div style={{ fontSize: 11, color: '#5C403D', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>#{String(sale.id).padStart(5, '0')}</div>
          <div style={{ fontSize: 11, color: '#5C403D', marginTop: 2 }}>{new Date(sale.date).toLocaleString('en-PH')}</div>
        </div>
        <div style={{ borderTop: '1px dashed #FFF0EF', borderBottom: '1px dashed #FFF0EF', padding: '16px 0', margin: '16px 0' }}>
          {sale.items.map(item => (
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
          <span>TOTAL</span>
          <span style={{ color: '#AA0015' }}>{fmtPeso(sale.total_amount)}</span>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '12px 0', background: '#AA0015', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </div>
  );
}

export default function PharmacistSales() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist', id: null };
  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [tab, setTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const searchRef = useRef();

  useEffect(() => {
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/sales`, { headers: authHeaders() }),
        ]);
        if (pRes.status === 401) { window.location.href = '/login'; return; }
        const [p, s] = await Promise.all([pRes.json(), sRes.json()]);
        setProducts(p);
        const mySales = Array.isArray(s) ? s.filter(sale => sale.cashier_id === currentUser.id) : [];
        setSales(mySales);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.generic_name || '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 12);

  function addToCart(product) {
    if (product.stock_status === 'out_of_stock') { setToast('This product is out of stock.'); return; }
    setCart(prev => {
      const existing = prev.find(c => c.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.quantity) { setToast(`Max available: ${product.quantity}`); return prev; }
        return prev.map(c => c.product_id === product.id ? { ...c, quantity: newQty } : c);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, max: product.quantity }];
    });
    setSearch('');
    searchRef.current?.focus();
  }

  function updateQty(product_id, delta) {
    setCart(prev => prev.map(c => {
      if (c.product_id !== product_id) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > c.max) { setToast(`Max available: ${c.max}`); return c; }
      return { ...c, quantity: newQty };
    }).filter(Boolean));
  }

  function removeFromCart(product_id) {
    setCart(prev => prev.filter(c => c.product_id !== product_id));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  async function processSale() {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/sales`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity })) }),
      });
      const data = await res.json();
      if (res.ok) {
        setReceipt(data.sale);
        setCart([]);
        // Refresh my sales
        const sRes = await fetch(`${API_BASE}/api/sales`, { headers: authHeaders() });
        const s = await sRes.json();
        setSales(Array.isArray(s) ? s.filter(sale => sale.cashier_id === currentUser.id) : []);
        // Refresh products (inventory updated)
        const pRes = await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
        setProducts(await pRes.json());
      } else {
        setToast(data.error || 'Failed to process sale.');
      }
    } catch {
      setToast('Connection error. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  const filteredSales = sales.filter(s => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return String(s.id).includes(q) || (s.items || []).some(i => i.product_name?.toLowerCase().includes(q));
  });

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
            const active = item.path === '/pharmacist-sales';
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
        <div style={{ height: 64, padding: '0 32px', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FFF0EF' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ key: 'new', label: 'New Sale' }, { key: 'history', label: 'My Sales History' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t.key ? '#AA0015' : '#FFF0EF', color: tab === t.key ? 'white' : '#5C403D' }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500 }}>Pharmacist</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#AA0015', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{initials}</div>
          </div>
        </div>

        {tab === 'new' ? (
          /* ── New Sale POS ── */
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>
            {/* Product search panel */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', background: 'white' }}>
              <div style={{ fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716', marginBottom: 4 }}>New Sale</div>
              <div style={{ fontSize: 13, color: '#5C403D', marginBottom: 20 }}>Search for a product and add it to the cart.</div>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search product name or generic name..."
                autoFocus
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #FFF0EF', fontSize: 13, color: '#281716', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#5C403D' }}>Loading products...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      style={{
                        padding: 14, background: p.stock_status === 'out_of_stock' ? '#F8F9FA' : 'white',
                        border: `1.5px solid ${p.stock_status === 'out_of_stock' ? '#E5E7EB' : '#FFF0EF'}`,
                        borderRadius: 8, cursor: p.stock_status === 'out_of_stock' ? 'not-allowed' : 'pointer',
                        opacity: p.stock_status === 'out_of_stock' ? 0.5 : 1,
                        transition: 'box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { if (p.stock_status !== 'out_of_stock') e.currentTarget.style.boxShadow = '0 2px 8px rgba(170,0,21,0.12)'; }}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#281716', marginBottom: 2, lineHeight: '18px' }}>{p.name}</div>
                      {p.generic_name && <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>{p.generic_name}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#AA0015' }}>₱{Number(p.price).toFixed(2)}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: p.quantity === 0 ? '#AA0015' : p.quantity < 10 ? '#D97706' : '#15803D' }}>{p.quantity} left</span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && search && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 32, color: '#94A3B8', fontSize: 13 }}>No products found for "{search}"</div>
                  )}
                  {!search && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 16, color: '#94A3B8', fontSize: 12 }}>
                      {products.length > 12 ? `Showing 12 of ${products.length} products. Type to search.` : ''}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart panel */}
            <div style={{ background: '#FFF0EF', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #FFDAD6' }}>
              <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #FFDAD6' }}>
                <div style={{ fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>
                  Cart <span style={{ fontSize: 12, fontWeight: 400, color: '#5C403D' }}>({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 13 }}>Cart is empty.<br />Click a product to add.</div>
                ) : cart.map(item => (
                  <div key={item.product_id} style={{ marginBottom: 12, padding: 12, background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#281716', flex: 1, paddingRight: 8 }}>{item.name}</div>
                      <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AA0015', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item.product_id, -1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #FFDAD6', background: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AA0015' }}>−</button>
                        <span style={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#281716', minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, 1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #FFDAD6', background: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AA0015' }}>+</button>
                      </div>
                      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#AA0015' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>₱{Number(item.price).toFixed(2)} each · max {item.max}</div>
                  </div>
                ))}
              </div>
              {/* Total + Process */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #FFDAD6', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#281716' }}>Total</span>
                  <span style={{ fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#AA0015' }}>{fmtPeso(total)}</span>
                </div>
                <button
                  onClick={processSale}
                  disabled={cart.length === 0 || processing}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 8, border: 'none', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    background: cart.length === 0 ? '#E5E7EB' : '#AA0015', color: cart.length === 0 ? '#94A3B8' : 'white',
                    fontSize: 14, fontWeight: 700, transition: 'background 0.15s',
                  }}
                >{processing ? 'Processing...' : 'Process Sale'}</button>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} style={{ width: '100%', marginTop: 8, padding: '10px 0', borderRadius: 8, border: '1px solid #FFDAD6', background: 'transparent', color: '#5C403D', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Clear Cart</button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Sales History ── */
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716' }}>My Sales History</div>
                <div style={{ fontSize: 13, color: '#5C403D', marginTop: 2 }}>{sales.length} transactions processed by you</div>
              </div>
              <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search by ID or product..." style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #FFF0EF', fontSize: 13, color: '#281716', outline: 'none', width: 240 }} />
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#5C403D' }}>Loading...</div>
            ) : filteredSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 14 }}>No sales found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredSales.map(s => (
                  <div key={s.id} style={{ padding: '16px 20px', background: 'white', borderRadius: 8, border: '1px solid #FFF0EF', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#AA0015' }}>#{String(s.id).padStart(5, '0')}</span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{timeAgo(s.date)}</span>
                          {s.status === 'void' && <span style={{ padding: '1px 6px', background: '#FFDAD6', color: '#AA0015', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>VOID</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#5C403D' }}>{new Date(s.date).toLocaleString('en-PH')}</div>
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(s.items || []).map(item => (
                            <span key={item.id} style={{ padding: '2px 8px', background: '#FFF0EF', borderRadius: 999, fontSize: 11, color: '#5C403D' }}>
                              {item.product_name} ×{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: s.status === 'void' ? '#94A3B8' : '#281716', textDecoration: s.status === 'void' ? 'line-through' : 'none' }}>{fmtPeso(s.total_amount)}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{(s.items || []).length} item{(s.items || []).length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {receipt && <Receipt sale={receipt} onClose={() => setReceipt(null)} />}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

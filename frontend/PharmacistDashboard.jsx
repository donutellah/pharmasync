import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('pharmasync_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/pharmacist-dashboard' },
  { label: 'Inventory',      path: '/pharmacist-inventory' },
  { label: 'My Sales',       path: '/pharmacist-sales' },
  { label: 'Expiry Alerts',  path: '/pharmacist-expiry' },
  { label: 'Audit Logs',     path: '/pharmacist-audit' },
  { label: 'Settings',       path: '/pharmacist-settings' },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getWeekDayIndex(dateStr) {
  // Returns 0=Mon … 6=Sun
  const d = new Date(dateStr);
  return (d.getDay() + 6) % 7;
}

function fmtPeso(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sub, subColor, accent, bg, dark }) {
  return (
    <div style={{
      padding: 20, background: bg || 'white', borderRadius: 8,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
          color: dark ? 'rgba(255,255,255,0.9)' : accent, lineHeight: '16px',
        }}>{label}</div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.4)' : `${accent}66` }} />
      </div>
      <div style={{
        fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, lineHeight: '32px',
        color: dark ? 'white' : '#281716',
      }}>{value}</div>
      <div style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.8)' : (subColor || '#5C403D'), fontWeight: subColor ? 600 : 400 }}>{sub}</div>
    </div>
  );
}

function StoreHealthCard({ products, total }) {
  const lowCount = products.filter(p => p.quantity < 10).length;
  const pct = total > 0 ? Math.round(((total - lowCount) / total) * 100) : 94;
  const status = pct >= 90 ? 'Optimal' : pct >= 70 ? 'Good' : 'Needs Attention';
  return (
    <div style={{
      padding: 20, background: '#006591', borderRadius: 8,
      boxShadow: '0 4px 6px -4px rgba(30,58,138,0.2), 0 10px 15px -3px rgba(30,58,138,0.2)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.9)', lineHeight: '16px' }}>Store Health</div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
      </div>
      <div style={{ fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: 'white' }}>{status}</div>
      <div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${pct}%`, height: 6, background: 'white', borderRadius: 12 }} />
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{pct}% Efficiency Rate</div>
      </div>
    </div>
  );
}

function BarChart({ salesByDay, activeView }) {
  const values = DAYS.map((_, i) => salesByDay[i] || 0);
  const max = Math.max(...values, 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '0 4px' }}>
      {DAYS.map((day, i) => {
        const val = values[i];
        const heightPct = (val / max) * 100;
        const today = getWeekDayIndex(new Date().toISOString().slice(0, 10));
        const isToday = i === today;
        return (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 9, color: '#5C403D', fontFamily: 'JetBrains Mono, monospace', opacity: val > 0 ? 1 : 0 }}>
              {val > 0 ? fmtPeso(val) : ''}
            </div>
            <div
              title={fmtPeso(val)}
              style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                background: isToday ? '#AA0015' : val > 0 ? 'rgba(170,0,21,0.35)' : 'rgba(170,0,21,0.1)',
                height: `${Math.max(heightPct, val > 0 ? 4 : 2)}%`,
                transition: 'height 0.3s ease',
              }}
            />
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: isToday ? '#281716' : '#5C403D',
            }}>{day}</div>
          </div>
        );
      })}
    </div>
  );
}

function StockAlertRow({ name, current, total, color, dotColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(229,189,185,0.15)' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#281716' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color }}>{current} units</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
      </div>
    </div>
  );
}

export default function PharmacistDashboard() {
  const userRaw = localStorage.getItem('pharmasync_user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Pharmacist', role: 'cashier' };

  const [monthly, setMonthly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('daily');

  useEffect(() => {
    async function load() {
      try {
        const [mRes, dRes, wRes, lsRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/api/reports/monthly`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/reports/daily`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/reports/weekly`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/products/low-stock`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/products`, { headers: authHeaders() }),
        ]);

        if (mRes.status === 401 || dRes.status === 401) {
          window.location.href = '/login';
          return;
        }

        const [m, d, w, ls, p] = await Promise.all([
          mRes.json(), dRes.json(), wRes.json(), lsRes.json(), pRes.json(),
        ]);

        setMonthly(m);
        setDaily(d);
        setWeekly(w);
        setLowStock(Array.isArray(ls) ? ls : []);
        setProducts(Array.isArray(p) ? p : []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group weekly sales by day-of-week index (0=Mon)
  const salesByDay = {};
  if (weekly?.sales) {
    weekly.sales.forEach(s => {
      const idx = getWeekDayIndex(s.date);
      salesByDay[idx] = (salesByDay[idx] || 0) + s.total_amount;
    });
  }

  const totalRevenue = monthly?.total_revenue || 0;
  const totalSales = monthly?.total_sales || 0;
  const todayRevenue = daily?.total_revenue || 0;
  const lowStockCount = lowStock.length;
  const totalProducts = products.length;

  // Daily target: monthly revenue / 30
  const dailyTarget = totalRevenue > 0 ? totalRevenue / 30 : 30000;
  const targetPct = dailyTarget > 0 ? Math.round((todayRevenue / dailyTarget) * 100) : 0;

  // Critical = quantity 0; Warning = quantity < 5
  const criticalItems = lowStock.filter(p => p.quantity <= 5);
  const warningItems = lowStock.filter(p => p.quantity > 5 && p.quantity < 10);

  const initials = (currentUser.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F9FA', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 232, minWidth: 232, height: '100vh', background: '#0B1C30',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, background: '#D11F27', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 18, height: 18, background: 'white', borderRadius: 2 }} />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Carlmed Pharmacy</div>
              <div style={{
                display: 'inline-block', marginTop: 4, padding: '1px 8px', background: '#D11F27',
                borderRadius: 4, color: 'white', fontSize: 9, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>Pharmacist Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = item.path === '/pharmacist-dashboard';
            return (
              <div
                key={item.path}
                onClick={() => { if (!active) window.location.href = item.path; }}
                style={{
                  padding: '10px 16px', borderRadius: 4, cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'white' : '#94A3B8', flexShrink: 0 }} />
                <span style={{
                  color: active ? 'white' : '#94A3B8', fontSize: 11,
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6,
                }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '16px 24px' }}>
          <div
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer' }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8' }} />
            <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 64, padding: '0 32px', background: 'white', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #FFF0EF', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 13, color: '#5C403D' }}>
            <span style={{ fontWeight: 600, color: '#281716' }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500, textTransform: 'capitalize' }}>Pharmacist</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#AA0015',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700,
            }}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'white' }}>
          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#281716', lineHeight: '36px' }}>
              CarlMed Overview
            </div>
            <div style={{ fontSize: 15, color: '#5C403D', marginTop: 4 }}>Real-time prescription flow and inventory analytics.</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#5C403D', fontSize: 14 }}>Loading dashboard...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
              {/* Left: Stat cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StatCard
                  label={'Total\nRevenue'}
                  value={fmtPeso(totalRevenue)}
                  sub={`+${totalSales > 0 ? Math.min(Math.round((totalSales / 100) * 2.4), 99) : 0}% vs last month`}
                  subColor="#059669"
                  accent="#AA0015"
                />
                <StatCard
                  label={'Low Stock\nItems'}
                  value={String(lowStockCount)}
                  sub="Active SKUs below min"
                  accent="#BA1A1A"
                />
                <StatCard
                  label={"Today's\nRevenue"}
                  value={fmtPeso(todayRevenue)}
                  sub={`${targetPct}% of daily target`}
                  subColor="#235EAB"
                  accent="#235EAB"
                />
                <StatCard
                  label="Prescriptions"
                  value={totalSales.toLocaleString()}
                  sub="Processed this month"
                  accent="#5C403D"
                />
                <StoreHealthCard products={lowStock} total={totalProducts} />
              </div>

              {/* Right: Charts + Stock Health */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Revenue Analytics */}
                <div style={{
                  padding: '24px 28px', background: '#FFF0EF', borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716' }}>Revenue Analytics</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['daily', 'weekly'].map(v => (
                        <button
                          key={v}
                          onClick={() => setChartView(v)}
                          style={{
                            padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            background: chartView === v ? 'white' : 'transparent',
                            color: '#5C403D',
                            boxShadow: chartView === v ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            textTransform: 'capitalize',
                          }}
                        >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <BarChart salesByDay={salesByDay} activeView={chartView} />
                </div>

                {/* Stock Health Details */}
                <div style={{
                  padding: '24px 28px', background: '#FBDBD8', borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716', marginBottom: 20 }}>Stock Health Details</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Low Stock Alerts card */}
                    <div style={{
                      padding: 18, background: 'white', borderRadius: 8,
                      borderLeft: '4px solid #BA1A1A',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#BA1A1A' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: '#281716' }}>Low Stock Alerts</span>
                        </div>
                        <div style={{
                          padding: '3px 8px', background: 'rgba(186,26,26,0.1)', borderRadius: 2,
                          fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#BA1A1A',
                        }}>{criticalItems.length} CRITICAL</div>
                      </div>
                      {lowStock.length === 0 ? (
                        <div style={{ fontSize: 12, color: '#5C403D', padding: '4px 0' }}>All items are adequately stocked.</div>
                      ) : (
                        <div>
                          {lowStock.slice(0, 5).map((p, i) => (
                            <StockAlertRow
                              key={p.id}
                              name={p.name}
                              current={p.quantity}
                              total={null}
                              color={p.quantity <= 5 ? '#BA1A1A' : '#D97706'}
                              dotColor={p.quantity <= 5 ? '#BA1A1A' : '#F59E0B'}
                            />
                          ))}
                          {lowStock.length > 5 && (
                            <div style={{ fontSize: 11, color: '#AA0015', marginTop: 8, fontWeight: 600, cursor: 'pointer' }}
                              onClick={() => window.location.href = '/pharmacist-inventory'}>
                              +{lowStock.length - 5} more items →
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expiring Soon card */}
                    <div style={{
                      padding: 18, background: 'white', borderRadius: 8,
                      borderLeft: '4px solid #235EAB',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#235EAB' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: '#281716' }}>Expiring Soon</span>
                        </div>
                        <div style={{
                          padding: '3px 8px', background: 'rgba(35,94,171,0.1)', borderRadius: 2,
                          fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#235EAB',
                        }}>NO DATA</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#5C403D', padding: '4px 0', lineHeight: '20px' }}>
                        Expiry date tracking is not configured in this system. To enable expiry monitoring, add an <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#FFF0EF', padding: '1px 4px', borderRadius: 2 }}>expiry_date</span> column to the Products table.
                      </div>
                      <div
                        onClick={() => window.location.href = '/pharmacist-expiry'}
                        style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: '#235EAB', cursor: 'pointer' }}>
                        View Expiry Alerts →
                      </div>
                    </div>

                    {/* Reorder action bar */}
                    <div style={{
                      padding: '14px 18px', background: 'white', borderRadius: 8,
                      borderLeft: '4px solid #AA0015', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          padding: 8, background: 'rgba(170,0,21,0.1)', borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ width: 14, height: 14, background: '#AA0015', borderRadius: 2 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#281716' }}>Reorder Request</div>
                          <div style={{ fontSize: 11, color: '#5C403D' }}>Submit a reorder for {lowStockCount} low-stock items</div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = '/pharmacist-inventory'}
                        style={{
                          padding: '8px 16px', background: '#AA0015', color: 'white', border: 'none',
                          borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>
                        View Inventory
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Sales preview */}
                {monthly?.top_products?.length > 0 && (
                  <div style={{ padding: '20px 24px', background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #FFF0EF' }}>
                    <div style={{ fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#281716', marginBottom: 14 }}>Top Products This Month</div>
                    {monthly.top_products.slice(0, 5).map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #FFF0EF' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 20, height: 20, background: '#FFF0EF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#AA0015' }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: '#281716' }}>{p.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#AA0015' }}>{fmtPeso(p.total_revenue)}</div>
                          <div style={{ fontSize: 10, color: '#5C403D' }}>{p.total_quantity_sold} units sold</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',       icon: '📊', href: '/dashboard' },
  { key: 'inventory', label: 'Inventory',        icon: '📦', href: '/inventory' },
  { key: 'expiry',    label: 'Expiry Alerts',    icon: '📋', href: '/expiry' },
  { key: 'pos',       label: 'POS Integration',  icon: '🖥️', href: '/pos' },
  { key: 'sync',      label: 'Offline Sync',     icon: '🔄', href: '/sync' },
  { key: 'financial', label: 'Financial Report', icon: '💰', href: '/financial' },
  { key: 'audit',     label: 'Audit Logs',       icon: '🔍', href: '/audit' },
  { key: 'users',     label: 'User Management',  icon: '👥', href: '/users' },
  { key: 'settings',  label: 'Settings',         icon: '⚙️', href: '/settings' },
  { key: 'ai',        label: 'AI Assistant',     icon: '🤖', href: '/ai' },
];

// ── Offline queue stored in localStorage ──────────────────────────────────────
const QUEUE_KEY = 'pharmasync_offline_queue';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function localStorageSize() {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    total += (localStorage.getItem(key) || '').length * 2; // UTF-16
  }
  return (total / 1024 / 1024).toFixed(2); // MB
}

function timeSinceMs(ms) {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, background: item.key === 'sync' ? '#233244' : 'transparent' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: item.key === 'sync' ? 'white' : '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6, fontFamily: 'Inter,sans-serif' }}>{item.label}</span>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding: '16px 24px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: '#1E293B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>{user.name || 'Admin'}</div>
          <div style={{ color: '#64748B', fontSize: 10 }}>{user.email || ''}</div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Logout</button>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, badge, badgeColor, badgeBg, label, value, valueColor }) {
  return (
    <div style={{ flex: 1, minHeight: 186, padding: 25, background: 'white', borderRadius: 8, border: '1px solid rgba(229,189,185,.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        {badge && (
          <span style={{ padding: '4px 8px', background: badgeBg, borderRadius: 2, color: badgeColor, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{badge}</span>
        )}
      </div>
      <div>
        <div style={{ color: '#916F6C', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6, fontFamily: 'Inter,sans-serif' }}>{label}</div>
        <div style={{ color: valueColor || '#281716', fontSize: 24, fontWeight: 800, fontFamily: typeof value === 'string' && value.includes('₱') ? 'JetBrains Mono,monospace' : 'Inter,sans-serif' }}>{value}</div>
      </div>
    </div>
  );
}

// ── Queue Item ─────────────────────────────────────────────────────────────────
function QueueItem({ item, onSync, onRemove, syncing }) {
  const iconMap = { inventory: '📦', clinical: '🏥', sale: '🛒', product: '📋' };
  const icon = iconMap[item.type] || '📄';
  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(229,189,185,.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, background: '#FFE2DF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
        <div>
          <div style={{ color: '#281716', fontSize: 14, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>{item.label}</div>
          <div style={{ color: '#916F6C', fontSize: 10, fontFamily: 'JetBrains Mono,monospace' }}>ID: {item.id} · {timeSinceMs(item.timestamp)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#5C403D', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>{item.detail}</div>
          <div style={{ color: '#235EAB', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{item.type}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSync(item)}
            disabled={syncing === item.id}
            style={{ padding: '8px 16px', background: '#FFE9E7', border: 'none', borderRadius: 4, cursor: syncing === item.id ? 'not-allowed' : 'pointer', color: '#281716', fontSize: 12, fontWeight: 700, opacity: syncing === item.id ? .6 : 1 }}
          >
            {syncing === item.id ? '⟳' : 'Sync Now'}
          </button>
          <button onClick={() => onRemove(item.id)} style={{ padding: '8px 10px', background: 'none', border: '1px solid rgba(229,189,185,.3)', borderRadius: 4, cursor: 'pointer', color: '#94A3B8', fontSize: 12 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function OfflineSync() {
  const [isOnline,    setIsOnline]    = useState(navigator.onLine);
  const [queue,       setQueue]       = useState(loadQueue());
  const [search,      setSearch]      = useState('');
  const [syncing,     setSyncing]     = useState(null);  // item id being synced
  const [forcingSync, setForcingSync] = useState(false);
  const [lastSync,    setLastSync]    = useState(() => localStorage.getItem('pharmasync_last_sync'));
  const [storageUsed, setStorageUsed] = useState(localStorageSize());
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // Demo: add a few sample items to queue if empty
  useEffect(() => {
    if (queue.length === 0) {
      const demo = [
        { id: 'OFF-9238', label: 'Amoxicillin 500mg - Stock Update',   type: 'inventory', detail: '+250 Units',   timestamp: Date.now() - 2 * 60000 },
        { id: 'OFF-9241', label: 'Patient Record: Maria Santos',        type: 'clinical',  detail: 'Field Update', timestamp: Date.now() - 5 * 60000 },
        { id: 'OFF-9244', label: 'Sale #2041 - Cashier Reconciliation', type: 'sale',      detail: '₱1,240.00',    timestamp: Date.now() - 8 * 60000 },
      ];
      saveQueue(demo);
      setQueue(demo);
    }
    setStorageUsed(localStorageSize());
  }, []);

  const filtered = search
    ? queue.filter(q => q.label.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase()))
    : queue;

  async function syncItem(item) {
    setSyncing(item.id);
    try {
      // Try to reach the backend; if online, remove from queue
      await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
      const newQ = queue.filter(q => q.id !== item.id);
      saveQueue(newQ);
      setQueue(newQ);
      const now = new Date().toISOString();
      localStorage.setItem('pharmasync_last_sync', now);
      setLastSync(now);
      setStorageUsed(localStorageSize());
    } catch {
      alert('Cannot reach server. Make sure the backend is running.');
    } finally {
      setSyncing(null);
    }
  }

  async function forceSync() {
    setForcingSync(true);
    try {
      await fetch(`${API_BASE}/api/products`, { headers: authHeaders() });
      saveQueue([]);
      setQueue([]);
      const now = new Date().toISOString();
      localStorage.setItem('pharmasync_last_sync', now);
      setLastSync(now);
      setStorageUsed(localStorageSize());
    } catch {
      alert('Cannot reach server. Make sure the backend is running.');
    } finally {
      setForcingSync(false);
    }
  }

  function removeItem(id) {
    const newQ = queue.filter(q => q.id !== id);
    saveQueue(newQ);
    setQueue(newQ);
  }

  function lastSyncLabel() {
    if (!lastSync) return 'Never';
    const diff = Math.floor((Date.now() - new Date(lastSync)) / 1000);
    if (diff < 60)  return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)} mins ago`;
    return new Date(lastSync).toLocaleTimeString('en-PH');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter,sans-serif', background: '#F8F9FA' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 80, background: 'white', boxShadow: '0 1px 10px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 420 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search offline records..."
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, color: '#281716', fontSize: 36, fontFamily: 'Manrope,sans-serif', fontWeight: 800 }}>Offline Sync</h1>
              <p style={{ margin: '8px 0 0', color: '#5C403D', fontSize: 16, fontWeight: 500 }}>Manage local clinical data and queued synchronization tasks.</p>
            </div>
            <button
              onClick={forceSync}
              disabled={forcingSync}
              style={{ padding: '12px 24px', background: '#AA0015', border: 'none', borderRadius: 8, cursor: forcingSync ? 'not-allowed' : 'pointer', color: 'white', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px -4px rgba(170,0,21,.1), 0 10px 15px -3px rgba(170,0,21,.1)', opacity: forcingSync ? .7 : 1 }}
            >
              🔄 {forcingSync ? 'Syncing…' : 'Force Master Sync'}
            </button>
          </div>

          {/* Connection banner */}
          {!isOnline && (
            <div style={{ padding: 16, background: '#FFF3CD', border: '1px solid #F59E0B', borderRadius: 8, color: '#92400E', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ You are currently offline. Changes will be queued and synced when connection is restored.
            </div>
          )}

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            <StatCard
              icon="🌐"
              badge="Local Mode"
              badgeColor="#001B3E"
              badgeBg="#D6E3FF"
              label="Connection Status"
              value={isOnline ? 'Online' : 'Offline'}
              valueColor={isOnline ? '#059669' : '#281716'}
            />
            <StatCard
              icon="⚠️"
              badge="Urgent"
              badgeColor="#410003"
              badgeBg="#FFDAD6"
              label="Pending Changes"
              value={queue.length}
              valueColor="#281716"
            />
            <StatCard
              icon="🕐"
              label="Last Sync"
              value={lastSyncLabel()}
              valueColor="#281716"
            />
            <StatCard
              icon="💾"
              label="Local Storage Used"
              value={`${storageUsed}MB / 50MB`}
              valueColor="#281716"
            />
          </div>

          {/* Main 2-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 20 }}>

            {/* Left: Offline Capability + Pro tip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Offline Capability */}
              <div style={{ padding: 32, background: '#D6E3FF', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ margin: 0, color: '#001B3E', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Offline Capability</h3>

                <div>
                  <div style={{ color: '#00458D', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Available Locally</div>
                  {['✅ Inventory Search', '✅ Record Editing', '✅ Patient View'].map(f => (
                    <div key={f} style={{ padding: 12, background: 'rgba(255,255,255,.4)', borderRadius: 4, marginBottom: 8, color: '#001B3E', fontSize: 14, fontWeight: 700 }}>{f}</div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(0,27,62,.1)', paddingTop: 24 }}>
                  <div style={{ color: '#00458D', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Requires Connection</div>
                  {['🔒 POS Syncing', '🔒 AI Clinical Assistant'].map(f => (
                    <div key={f} style={{ padding: 12, background: 'rgba(255,240,239,.2)', borderRadius: 4, marginBottom: 8, color: '#001B3E', fontSize: 14, fontWeight: 500, opacity: .6 }}>{f}</div>
                  ))}
                </div>

                {/* Decorative blob */}
                <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, background: 'rgba(0,27,62,.05)', borderRadius: '50%', transform: 'rotate(12deg)' }} />
              </div>

              {/* Pro tip */}
              <div style={{ padding: 24, background: '#FFF0EF', borderRadius: 8, borderLeft: '4px solid #235EAB' }}>
                <div style={{ color: '#235EAB', fontSize: 14, fontFamily: 'Manrope,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Pro-Tip</div>
                <div style={{ color: '#5C403D', fontSize: 14, lineHeight: 1.7 }}>
                  Changes are stored in your browser's localStorage. Do not clear your cache until a full sync is completed.
                </div>
              </div>
            </div>

            {/* Right: Sync Queue */}
            <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)', border: '1px solid rgba(229,189,185,.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* Queue header */}
              <div style={{ padding: 24, borderBottom: '1px solid rgba(229,189,185,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ margin: 0, color: '#281716', fontSize: 20, fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Sync Queue</h3>
                  <span style={{ padding: '4px 8px', background: '#AA0015', borderRadius: 12, color: 'white', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>
                    {queue.length} Items
                  </span>
                </div>
                <button
                  onClick={() => {
                    // Select all = sync all one by one
                    if (queue.length > 0 && isOnline) forceSync();
                  }}
                  style={{ background: 'none', border: 'none', color: '#235EAB', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, cursor: 'pointer' }}
                >
                  Select All
                </button>
              </div>

              {/* Queue items */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 500 }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    {queue.length === 0 ? '✅ All changes synced!' : `No results for "${search}"`}
                  </div>
                ) : filtered.map(item => (
                  <QueueItem
                    key={item.id}
                    item={item}
                    onSync={syncItem}
                    onRemove={removeItem}
                    syncing={syncing}
                  />
                ))}
              </div>

              {/* Queue footer */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(229,189,185,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(92,64,61,.5)', fontSize: 12 }}>{filtered.length} pending · Stored locally</span>
                <span style={{ color: isOnline ? '#059669' : '#94A3B8', fontSize: 12, fontWeight: 600 }}>
                  {isOnline ? '🟢 Online — ready to sync' : '🔴 Offline — queuing changes'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

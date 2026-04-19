import { LayoutDashboard, Archive, Bell, ShoppingCart, ClipboardList, Settings, LogOut, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard, href: '/pharmacist-dashboard' },
  { key: 'inventory', label: 'Inventory',    icon: Archive,         href: '/pharmacist-inventory' },
  { key: 'sales',     label: 'My Sales',     icon: ShoppingCart,    href: '/pharmacist-sales' },
  { key: 'expiry',    label: 'Expiry Alerts',icon: Bell,            href: '/pharmacist-expiry' },
  { key: 'audit',     label: 'Audit Logs',   icon: ClipboardList,   href: '/pharmacist-audit' },
  { key: 'settings',  label: 'Settings',     icon: Settings,        href: '/pharmacist-settings' },
];

export default function PharmacistSidebar({ activePage }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <div style={{
      width: 220, minWidth: 220, height: '100vh',
      background: '#0B1C30', display: 'flex', flexDirection: 'column',
      flexShrink: 0, boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#D11F27', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Carlmed Pharmacy</div>
            <div style={{ display: 'inline-block', marginTop: 3, padding: '1px 6px', background: '#D11F27', borderRadius: 4, color: 'white', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pharmacist Portal
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <a key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <Icon size={16} color={active ? 'white' : '#64748B'} strokeWidth={1.75} />
                <span style={{
                  color: active ? 'white' : '#64748B',
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  textTransform: 'uppercase', letterSpacing: 0.6,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {item.label}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Logout */}
      <div style={{ padding: '8px 10px 16px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
            background: 'transparent', border: 'none',
          }}
        >
          <LogOut size={16} color="#64748B" strokeWidth={1.75} />
          <span style={{ color: '#64748B', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Inter, sans-serif' }}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}

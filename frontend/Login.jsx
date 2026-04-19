import { useState } from 'react';

const API_BASE = 'http://localhost:3000';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('pharmacist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid credentials.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on actual role from backend
      window.location.href = data.user.role === 'admin' ? '/dashboard' : '/pos';
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', opacity: 0.92 }} />
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(5px)' }} />

      {/* Left content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: 620, padding: '0 60px', display: 'flex', flexDirection: 'column', gap: 26 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>💊</span>
          </div>
          <span style={{ color: 'white', fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>CarlMed Pharmacy</span>
        </div>

        {/* Tagline */}
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: 1.2 }}>
          <span style={{ color: 'white', fontSize: 52 }}>Dekalidad,<br />mapagkakatiwalaan,<br /></span>
          <span style={{ color: '#D6E3FF', fontSize: 52 }}>at abot kayang<br />gamot.</span>
        </div>

        {/* Description */}
        <p style={{ color: 'white', fontSize: 18, fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: 1.6, maxWidth: 480, opacity: 0.9 }}>
          Access the CarlMed dashboard to manage prescriptions, inventory, and patient health outcomes with precision.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 24 }}>
          <div>
            <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>24/7</div>
            <div style={{ color: 'white', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.7 }}>Support Access</div>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>HIPAA</div>
            <div style={{ color: 'white', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.7 }}>Compliant Security</div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 340, padding: '32px 35px 48px',
        background: 'rgba(255,255,255,0.85)',
        boxShadow: '0px 12px 64px rgba(0,0,0,0.08), 0px 8px 32px rgba(0,35,102,0.12)',
        borderRadius: 40,
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        marginRight: 80,
      }}>

        {/* Avatar */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FBDBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
          💊
        </div>

        <p style={{ color: '#5C403D', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>Select your role to continue</p>
        <h2 style={{ color: '#281716', fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0 }}>Welcome Back</h2>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setSelectedRole('pharmacist')}
            style={{
              width: 105, height: 63, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: selectedRole === 'pharmacist' ? '#FFF0EF' : 'white',
              outline: selectedRole === 'pharmacist' ? 'none' : '2px solid #e5e5e5',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 20 }}>🧑‍⚕️</span>
            <span style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Pharmacist</span>
          </button>
          <button
            onClick={() => setSelectedRole('admin')}
            style={{
              width: 105, height: 63, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: selectedRole === 'admin' ? '#fff5f5' : 'white',
              outline: selectedRole === 'admin' ? '2px solid #D11F27' : '2px solid #e5e5e5',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 20 }}>🛡️</span>
            <span style={{ color: '#D11F27', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Admin</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Institutional Email
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FBDBD8', borderRadius: 8, padding: '0 12px', height: 40 }}>
              <span style={{ marginRight: 8, opacity: 0.6 }}>✉️</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`${selectedRole}@carlmed.com`}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  color: '#5C403D', fontSize: 12, fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FBDBD8', borderRadius: 8, padding: '0 12px', height: 40 }}>
              <span style={{ marginRight: 8, opacity: 0.6 }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  color: '#5C403D', fontSize: 12, fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, opacity: 0.6 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', color: '#D11F27', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          {/* Recover + Trust */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: '#002366', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', padding: 0 }}>
              Recover Access
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#D11F27' }} />
              <span style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif' }}>Trust this device</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#e88' : '#D11F27',
              color: 'white', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
              boxShadow: '0px 4px 6px -4px rgba(209,31,39,0.25), 0px 10px 15px -3px rgba(209,31,39,0.25)',
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {loading ? 'Signing in...' : 'Access Account'} {!loading && '→'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(40,23,22,0.08)', paddingTop: 20, width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, margin: 0 }}>
            Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

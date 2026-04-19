import { useState } from 'react';
import heroImg from '../assets/hero.png';

const API_BASE = '';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
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

      window.location.href = data.user.role === 'admin' ? '/dashboard' : '/pharmacist-dashboard';
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Background — blurred pharmacy overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #2a0a0b 0%, #1a0f1f 30%, #0B1C30 70%, #0a1628 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(150,30,30,0.35) 0%, transparent 60%)',
      }} />
      {/* Shelf texture lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 82px)',
        filter: 'blur(0.5px)',
      }} />

      {/* Left panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, maxWidth: 620,
        padding: '0 60px',
        display: 'flex', flexDirection: 'column', gap: 26,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={heroImg} alt="CarlMed" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{
            color: 'white', fontSize: 28,
            fontFamily: 'Manrope, sans-serif', fontWeight: 700,
          }}>CarlMed Pharmacy</span>
        </div>

        {/* Headline */}
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: 1.25 }}>
          <span style={{ color: 'white', fontSize: 52, display: 'block' }}>Dekalidad,</span>
          <span style={{ color: 'white', fontSize: 52, display: 'block' }}>mapagkakatiwalaan,</span>
          <span style={{ color: '#D6E3FF', fontSize: 52, display: 'block' }}>at abot kayang</span>
          <span style={{ color: '#D6E3FF', fontSize: 52, display: 'block' }}>gamot.</span>
        </div>

        {/* Description */}
        <p style={{
          color: 'white', fontSize: 18,
          fontFamily: 'Inter, sans-serif', fontWeight: 400,
          lineHeight: 1.65, maxWidth: 480, opacity: 0.9, margin: 0,
        }}>
          Access the CarlMed dashboard to manage prescriptions, inventory, and patient health outcomes with precision.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 24 }}>
          <div>
            <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>24/7</div>
            <div style={{ color: 'white', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.7 }}>Support Access</div>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>HIPAA</div>
            <div style={{ color: 'white', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.7 }}>Compliant Security</div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 340,
        padding: '32px 35px 48px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 40,
        boxShadow: '0px 8px 32px rgba(0,35,102,0.10), 0px 12px 64px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        marginRight: 80,
      }}>

        {/* Avatar */}
        <img
          src={heroImg}
          alt="CarlMed"
          style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
        />

        {/* Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{
            color: '#281716', fontSize: 30,
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, margin: 0,
          }}>Welcome Back</h2>
          <p style={{ color: '#5C403D', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 400, margin: 0 }}>
            Select your role to continue
          </p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            style={{
              width: 105, height: 63, borderRadius: 8, cursor: 'pointer',
              background: 'white',
              border: selectedRole === 'admin' ? '2px solid #D11F27' : '2px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {/* Admin icon — shield */}
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
              <path d="M11 1L2 5v5c0 5.25 3.85 10.15 9 11.35C16.15 20.15 20 15.25 20 10V5L11 1z" fill={selectedRole === 'admin' ? '#D11F27' : '#bbb'} />
            </svg>
            <span style={{
              color: selectedRole === 'admin' ? '#D11F27' : '#aaa',
              fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('pharmacist')}
            style={{
              width: 105, height: 63, borderRadius: 8, cursor: 'pointer',
              background: selectedRole === 'pharmacist' ? '#FFF0EF' : 'white',
              border: '2px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {/* Pharmacist icon — cross */}
            <svg width="20" height="25" viewBox="0 0 20 25" fill="none">
              <rect x="7" y="0" width="6" height="25" rx="2" fill={selectedRole === 'pharmacist' ? '#5C403D' : '#bbb'} />
              <rect x="0" y="9.5" width="20" height="6" rx="2" fill={selectedRole === 'pharmacist' ? '#5C403D' : '#bbb'} />
            </svg>
            <span style={{
              color: selectedRole === 'pharmacist' ? '#5C403D' : '#aaa',
              fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>Pharmacist</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{
              color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Institutional Email
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#FBDBD8', borderRadius: 8, padding: '0 11px', height: 36,
            }}>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ marginRight: 8, flexShrink: 0 }}>
                <rect x="0" y="0" width="16" height="12" rx="2" stroke="#5C403D" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
                <path d="M0 2l8 5 8-5" stroke="#5C403D" strokeOpacity="0.5" strokeWidth="1.2" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`${selectedRole}@carlmed.com`}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  color: '#5C403D', fontSize: 11, fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{
                color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif',
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Password
              </label>
              <button
                type="button"
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  color: '#002366', fontSize: 10, fontFamily: 'Inter, sans-serif',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
                }}
              >
                Recover Access
              </button>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#FBDBD8', borderRadius: 8, padding: '0 10px', height: 36,
            }}>
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ marginRight: 10, flexShrink: 0 }}>
                <rect x="1" y="7" width="12" height="10" rx="2" stroke="#5C403D" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
                <path d="M4 7V5a3 3 0 116 0v2" stroke="#5C403D" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  color: '#5C403D', fontSize: 11, fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, display: 'flex', alignItems: 'center', opacity: 0.6,
                }}
              >
                {showPassword ? (
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                    <path d="M1 6.5C1 6.5 4 1 9 1s8 5.5 8 5.5S14 12 9 12 1 6.5 1 6.5z" stroke="#5C403D" strokeWidth="1.2" fill="none" />
                    <circle cx="9" cy="6.5" r="2.5" stroke="#5C403D" strokeWidth="1.2" fill="none" />
                  </svg>
                ) : (
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                    <path d="M1 6.5C1 6.5 4 1 9 1s8 5.5 8 5.5S14 12 9 12 1 6.5 1 6.5z" stroke="#5C403D" strokeWidth="1.2" fill="none" />
                    <circle cx="9" cy="6.5" r="2.5" stroke="#5C403D" strokeWidth="1.2" fill="none" />
                    <line x1="2" y1="1" x2="16" y2="12" stroke="#5C403D" strokeWidth="1.2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Trust device */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={e => setTrustDevice(e.target.checked)}
              style={{ accentColor: '#D11F27', width: 14, height: 14, cursor: 'pointer' }}
            />
            <span style={{ color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif' }}>Trust this device</span>
          </label>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff0f0', border: '1px solid #ffcccc',
              borderRadius: 8, padding: '10px 14px',
              color: '#D11F27', fontSize: 12, fontFamily: 'Inter, sans-serif',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 8, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#e08' : '#D11F27',
              color: 'white', fontSize: 12,
              fontFamily: 'Manrope, sans-serif', fontWeight: 700,
              boxShadow: '0px 10px 15px -3px rgba(209,31,39,0.25), 0px 4px 6px -4px rgba(209,31,39,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in...' : (
              <>
                Access Account
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <path d="M1 6h16M11 1l6 5-6 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(40,23,22,0.05)',
          paddingTop: 20, width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <p style={{
            color: '#5C403D', fontSize: 10, fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase', letterSpacing: 0.5, margin: 0,
          }}>
            Authorized personnel only.
          </p>
          <div style={{ display: 'flex', gap: 20, opacity: 0.35 }}>
            {[0, 1, 2].map(i => (
              <svg key={i} width="9" height="11" viewBox="0 0 9 11" fill="none">
                <rect width="9" height="11" rx="2" fill="#5C403D" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

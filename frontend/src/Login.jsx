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
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'white', overflow: 'hidden' }} data-name="Log in Admin" data-node-id="2:2">
      {/* Background blur */}
      <div style={{ position: 'absolute', filter: 'blur(5px)', height: '1080px', left: 0, opacity: 0.8, overflow: 'hidden', top: 0, width: '1920px' }} data-node-id="99:5">
        <div style={{ position: 'absolute', height: '3280px', left: '-2018px', top: '-688px', width: '4096px' }} data-name="carlmed 1" data-node-id="99:7">
          <img alt="" style={{ position: 'absolute', filter: 'blur(50px)', inset: 0, maxWidth: 'none', objectFit: 'cover', pointerEvents: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/bf499a0b-ca82-4beb-b32b-3d91153cb82b" />
        </div>
      </div>
      {/* Rectangle background */}
      <div style={{ position: 'absolute', height: '909px', left: '397px', top: '85px', width: '1130px' }} data-node-id="3:10">
        <img alt="" style={{ position: 'absolute', inset: '-1.76% -1.77% -2.64% -1.77%', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} height="949" src="https://www.figma.com/api/mcp/asset/2a0d1271-b89e-4a9d-8963-45ca00ab9cf7" width="1170" />
      </div>
      {/* Left content */}
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '26px', alignItems: 'flex-start', left: '470px', paddingBottom: '24px', top: '183px', width: '577.333px' }} data-name="Heading 1:margin" data-node-id="14:14">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '577.333px' }} data-name="Container" data-node-id="14:10">
          <div style={{ width: '40px', height: '40px' }} data-name="Container" data-node-id="14:11">
            <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/92a7043c-ad90-45f9-b034-0dd7a9ea39d1" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', fontWeight: 700, height: '49px', justifyContent: 'center', color: 'white', fontSize: '36px', width: '333px' }} data-node-id="15:108">
            <p style={{ lineHeight: '75px' }}>CarlMed Pharmacy</p>
          </div>
          <div style={{ width: '100px', height: '100px' }} data-node-id="15:99" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }} data-name="Heading 1" data-node-id="14:15">
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', fontWeight: 700, justifyContent: 'center', color: 'white', fontSize: '60px', width: '615px' }} data-node-id="14:16">
            <p style={{ lineHeight: '75px', marginBottom: 0 }}>Dekalidad,</p>
            <p style={{ lineHeight: '75px', marginBottom: 0 }}>mapagkakatiwalaan,</p>
            <p style={{ lineHeight: '75px', color: '#d6e3ff', marginBottom: 0 }}>at abot kayang</p>
            <p style={{ lineHeight: '75px', color: '#d6e3ff' }}>gamot.</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '512px', opacity: 0.9, width: '512px' }} data-name="Container" data-node-id="14:17">
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '98px', justifyContent: 'center', color: 'white', fontSize: '20px', width: '502.66px' }} data-node-id="14:18">
            <p style={{ lineHeight: '32.5px', marginBottom: 0 }}>Access the Clinical Curator dashboard to manage</p>
            <p style={{ lineHeight: '32.5px' }}>prescriptions, inventory, and patient health outcomes with editorial-grade precision.</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '48px', width: '577.333px' }} data-name="Margin" data-node-id="14:19">
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', width: '100%' }} data-name="Container" data-node-id="14:20">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '124.8px' }} data-name="Container" data-node-id="14:21">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }} data-name="Container" data-node-id="14:22">
                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', fontWeight: 700, height: '32px', justifyContent: 'center', color: 'white', fontSize: '24px', width: '51.63px' }} data-node-id="14:23">
                  <p style={{ lineHeight: '32px' }}>24/7</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: 0.7, width: '100%' }} data-name="Container" data-node-id="14:24">
                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '16px', justifyContent: 'center', color: 'white', fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase', width: '124.8px' }} data-node-id="14:25">
                  <p style={{ lineHeight: '16px' }}>Support Access</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', height: '40px', width: '1px' }} data-name="Vertical Divider" data-node-id="14:26" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '156.19px' }} data-name="Container" data-node-id="14:27">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }} data-name="Container" data-node-id="14:28">
                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', fontWeight: 700, height: '32px', justifyContent: 'center', color: 'white', fontSize: '24px', width: '71.13px' }} data-node-id="14:29">
                  <p style={{ lineHeight: '32px' }}>HIPAA</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: 0.7, width: '100%' }} data-name="Container" data-node-id="14:30">
                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '16px', justifyContent: 'center', color: 'white', fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase', width: '156.19px' }} data-node-id="14:31">
                  <p style={{ lineHeight: '16px' }}>Compliant Security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Login Card */}
      <div style={{ position: 'absolute', aspectRatio: '398.66668701171875 / 873.2916870117188', filter: 'blur(20px)', background: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', left: '1113px', overflow: 'hidden', paddingBottom: '48px', paddingTop: '32px', paddingLeft: '35px', paddingRight: '35px', borderRadius: '40px', boxShadow: '0px 8px 32px 0px rgba(0,35,102,0.1), 0px 12px 64px 0px rgba(0,0,0,0.05)', top: '167px', width: '340px' }} data-name="Right Side: Login Card" data-node-id="14:32">
        <div style={{ display: 'inline-grid', gridTemplateRows: 'max-content', placeItems: 'start', width: '100%' }} data-name="Container" data-node-id="14:38">
          <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', gap: '24px', height: '685px', alignItems: 'center', gridRow: 1, width: '100%' }} data-name="Heading 2" data-node-id="14:39">
            <div style={{ width: '100px', height: '100px' }} data-node-id="15:112">
              <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} height="100" src="https://www.figma.com/api/mcp/asset/e1999fba-5915-4371-8981-1fd9dd166657" width="100" />
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:143">
              <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '34px', gridRow: 1, width: '245px' }} data-name="Container" data-node-id="14:41">
                <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '20px', justifyContent: 'center', color: '#5c403d', fontSize: '14px', textAlign: 'center', width: '181.73px' }} data-node-id="14:42">
                  <p style={{ lineHeight: '20px' }}>Select your role to continue</p>
                </div>
              </div>
              <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', fontWeight: 700, height: '36px', justifyContent: 'center', marginLeft: '21px', color: '#281716', fontSize: '30px', textAlign: 'center', gridRow: 1, width: '209.7px' }} data-node-id="14:40">
                <p style={{ lineHeight: '36px' }}>Welcome Back</p>
              </div>
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:142">
              <button onClick={() => setSelectedRole('pharmacist')} style={{ background: selectedRole === 'pharmacist' ? '#fff0ef' : 'white', border: selectedRole === 'pharmacist' ? '2px solid rgba(0,0,0,0)' : '2px solid #d11f27', display: 'flex', flexDirection: 'column', height: '63px', alignItems: 'center', justifyContent: 'center', marginLeft: '120.25px', paddingLeft: '33.15px', paddingRight: '33.18px', paddingTop: '18px', paddingBottom: '18px', borderRadius: '8px', gridColumn: 1, gridRow: 1, width: '105px', cursor: 'pointer' }} data-name="Button" data-node-id="14:50">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '8px' }} data-name="Margin" data-node-id="14:51">
                  <div style={{ height: '25px', width: '20px' }} data-name="Container" data-node-id="14:52">
                    <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/6e40d711-1559-4ea3-8aed-63da2372a491" />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} data-name="Container" data-node-id="14:54">
                  <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 600, height: '15px', justifyContent: 'center', color: selectedRole === 'pharmacist' ? '#5c403d' : '#d11f27', fontSize: '10px', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', width: '77px' }} data-node-id="14:55">
                    <p style={{ lineHeight: '15px' }}>Pharmacist</p>
                  </div>
                </div>
              </button>
              <button onClick={() => setSelectedRole('admin')} style={{ background: selectedRole === 'admin' ? '#fff0ef' : 'white', border: selectedRole === 'admin' ? '2px solid #d11f27' : '2px solid rgba(0,0,0,0)', display: 'flex', flexDirection: 'column', height: '63px', alignItems: 'center', justifyContent: 'center', paddingLeft: '52.11px', paddingRight: '52.13px', paddingTop: '18px', paddingBottom: '18px', borderRadius: '8px', gridColumn: 1, gridRow: 1, width: '105px', cursor: 'pointer' }} data-name="Button" data-node-id="14:44">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '8px' }} data-name="Margin" data-node-id="14:45">
                  <div style={{ height: '20px', width: '22.5px' }} data-name="Container" data-node-id="14:46">
                    <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/95a8af97-0d76-40ca-b7fc-ad2ce1aa515e" />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} data-name="Container" data-node-id="14:48">
                  <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 600, height: '15px', justifyContent: 'center', color: selectedRole === 'admin' ? '#d11f27' : '#5c403d', fontSize: '10px', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', width: '39.09px' }} data-node-id="14:49">
                    <p style={{ lineHeight: '15px' }}>Admin</p>
                  </div>
                </div>
              </button>
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:151">
              <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', marginLeft: '0.5px', marginTop: '19px', gridRow: 1 }} data-node-id="15:148">
                <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:149">
                  <div style={{ background: '#fbdbd8', display: 'flex', height: '36px', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', paddingBottom: '18px', paddingLeft: '11px', paddingRight: '16px', paddingTop: '10px', borderRadius: '8px', gridColumn: 1, gridRow: 1, width: '225px' }} data-name="Input" data-node-id="14:60">
                    <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:147">
                      <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', height: '16px', alignItems: 'flex-start', gridRow: 1 }} data-name="Container" data-node-id="14:63">
                        <div style={{ height: '16px', width: '20px' }} data-name="Icon" data-node-id="14:64">
                          <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/acf0bc79-bcc0-43dc-a860-aa245a8ea12e" />
                        </div>
                      </div>
                      <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', height: '16px', alignItems: 'flex-start', marginLeft: '31px', overflow: 'hidden', gridRow: 1, width: '164px' }} data-name="Container" data-node-id="14:61">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="phharmacist@carlmed.com" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, justifyContent: 'center', color: 'rgba(92,64,61,0.5)', fontSize: '11px', width: '147px', border: 'none', background: 'transparent', outline: 'none' }} data-node-id="14:62" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 600, height: '15px', justifyContent: 'center', color: '#5c403d', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', gridRow: 1, width: '167px' }} data-node-id="14:58">
                <p style={{ lineHeight: '15px' }}>Institutional Email</p>
              </div>
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:170">
              <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', marginTop: '19px', gridRow: 1 }} data-node-id="15:152">
                <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:153">
                  <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:154">
                    <div style={{ background: '#fbdbd8', display: 'flex', height: '36px', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', paddingBottom: '18px', paddingLeft: '10px', paddingRight: '11px', paddingTop: '7px', borderRadius: '8px', gridColumn: 1, gridRow: 1, width: '225px' }} data-name="Input" data-node-id="15:155">
                      <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:169">
                        <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:167">
                          <div style={{ gridColumn: 1, height: '21px', gridRow: 1, width: '16.746px' }} data-node-id="15:166">
                            <img alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/955f6fc8-7734-439a-9b72-11ce0a8c2d68" />
                          </div>
                          <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', marginLeft: '31.13px', marginTop: '4px', gridRow: 1 }} data-node-id="15:168">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, justifyContent: 'center', color: 'rgba(92,64,61,0.5)', fontSize: '11px', width: '165.369px', border: 'none', background: 'transparent', outline: 'none' }} data-node-id="14:74" />
                          </div>
                        </div>
                        <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', height: '11px', alignItems: 'center', justifyContent: 'center', marginLeft: '176.32px', marginTop: '6px', gridRow: 1, width: '16.746px' }} data-name="Button" data-node-id="14:77">
                          <div style={{ height: '12.5px', width: '18px' }} data-name="Container" data-node-id="14:78">
                            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', inset: '-0.93% 0 0 0', display: 'block', maxWidth: 'none', width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                              <img alt="" style={{ display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="https://www.figma.com/api/mcp/asset/a8a064ad-e796-47d4-abf7-1b03ed1bdf05" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:164">
                <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', marginTop: '0.31px', gridRow: 1 }} data-node-id="15:163">
                  <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 600, height: '12.692px', justifyContent: 'center', color: '#5c403d', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', gridRow: 1, width: '76.223px' }} data-node-id="15:161">
                    <p style={{ lineHeight: '15px' }}>password</p>
                  </div>
                </div>
                <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 600, justifyContent: 'center', color: '#002366', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', gridRow: 1, width: '112px', cursor: 'pointer' }} data-node-id="14:70">
                  <p style={{ lineHeight: '15px' }}>Recover Access</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start' }} data-node-id="15:171">
              <div style={{ gridColumn: 1, display: 'inline-grid', gridTemplateColumns: 'max-content', gridTemplateRows: 'max-content', placeItems: 'start', gridRow: 1 }} data-node-id="15:173">
                <div style={{ gridColumn: 1, width: '16px', height: '16px', gridRow: 1 }} data-name="Input" data-node-id="14:81">
                  <input type="checkbox" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} />
                </div>
                <div style={{ gridColumn: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '25.97px', gridRow: 1, width: '81px' }} data-name="Label" data-node-id="14:82">
                  <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '16px', justifyContent: 'center', color: '#5c403d', fontSize: '10px', width: '93.56px' }} data-node-id="14:83">
                    <p>Remember me</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading} style={{ background: '#d11f27', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '20px' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
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

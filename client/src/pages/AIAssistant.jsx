import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { formatPesoReal } from '../utils/format';

const API_BASE = '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}


const QUICK_ACTIONS = [
  {
    id: 'expiring',
    title: 'Products expiring soon',
    sub: '8 items need attention',
    dotColor: '#B91C1C',
    query: 'Which products are expiring soon or have low stock? Give me a prioritized list.',
  },
  {
    id: 'topselling',
    title: 'Top selling products',
    sub: 'Weekly revenue insights',
    dotColor: '#006C49',
    query: 'What are the top selling products and the weekly revenue insights based on recent sales?',
  },
  {
    id: 'stockout',
    title: 'Stockout risk this week',
    sub: 'Predictive stock health',
    dotColor: '#693C00',
    query: 'Which products are at risk of stockout this week? Analyze the current inventory levels.',
  },
  {
    id: 'financial',
    title: 'Financial summary',
    sub: 'Net margin analysis',
    dotColor: null,
    query: 'Give me a financial summary for this month including total revenue, sales count, and any notable trends.',
  },
];

function formatMessage(text) {
  // Convert markdown-like formatting to JSX
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} style={{ margin: '4px 0', fontWeight: 700 }}>{line.slice(2, -2)}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p key={i} style={{ margin: '2px 0', paddingLeft: 12 }}>
          {'• '}{line.slice(2)}
        </p>
      );
    }
    if (line.startsWith('###')) {
      return <p key={i} style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: '#004C6E' }}>{line.replace(/^###\s*/, '')}</p>;
    }
    if (line.startsWith('##')) {
      return <p key={i} style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14, color: '#0B1C30' }}>{line.replace(/^##\s*/, '')}</p>;
    }
    if (line === '') return <br key={i} />;
    return <p key={i} style={{ margin: '2px 0' }}>{line}</p>;
  });
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 20px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%', background: '#C0C7CF',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AIAssistant() {
  const userRaw = localStorage.getItem('user');
  const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Admin', role: 'admin' };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadInsights() {
    setInsightsLoading(true);
    try {
      const [prodRes, salesRes, reportRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/sales`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/reports/monthly`, { headers: authHeaders() }),
      ]);
      const products = prodRes.ok ? await prodRes.json() : [];
      const sales = salesRes.ok ? await salesRes.json() : [];
      const report = reportRes.ok ? await reportRes.json() : {};
      setInsightsData({ products, sales, report });
    } catch (e) {
      // ignore
    } finally {
      setInsightsLoading(false);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'insights' && !insightsData) loadInsights();
  }

  async function sendMessage(text) {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Sorry, I encountered an error. Please try again.',
          isError: true,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check if the server is running.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  const initials = (currentUser.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const showWelcome = messages.length === 0 && !loading;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8F9FA', overflow: 'hidden' }}>
      <AdminSidebar activePage="ai" />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 64, padding: '0 24px', background: '#F8F9FF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(192,199,207,0.15)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#004C6E' }} />
              <span style={{ color: '#004C6E', fontSize: 17, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>Carlmed AI</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(192,199,207,0.3)' }} />
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { key: 'chat', label: 'Chat Assistant' },
                { key: 'insights', label: 'Data Insights' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                    fontSize: 13, fontFamily: 'Inter, sans-serif',
                    fontWeight: activeTab === tab.key ? 700 : 400,
                    color: activeTab === tab.key ? '#004C6E' : 'rgba(11,28,48,0.6)',
                    borderBottom: activeTab === tab.key ? '2px solid #004C6E' : '2px solid transparent',
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#281716' }}>{currentUser.name || 'Admin'}</div>
              <div style={{ fontSize: 9, color: '#AA0015', fontWeight: 500, textTransform: 'capitalize' }}>{currentUser.role}</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #004C6E, #B91C1C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700,
            }}>{initials}</div>
          </div>
        </div>

        {/* Hero banner */}
        <div style={{
          padding: '20px 32px', background: '#EFF4FF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(192,199,207,0.2)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* AI Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(45deg, #004C6E 0%, #B91C1C 100%)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', borderRadius: 14, backdropFilter: 'blur(2px)' }} />
              <span style={{ color: 'white', fontSize: 11, fontWeight: 700, zIndex: 1, fontFamily: 'Inter, sans-serif' }}>AI</span>
              <div style={{
                position: 'absolute', width: 10, height: 10, bottom: -1, right: -1,
                background: 'white', borderRadius: '50%', border: '2px solid #EFF4FF',
                boxShadow: '0 0 8px white',
              }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#0B1C30' }}>Carlmed AI Assistant</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 999, background: 'rgba(0,76,110,0.1)',
                  fontSize: 9, fontWeight: 700, color: '#004C6E', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>Enterprise Mode</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(64,72,78,0.8)' }}>
                Powered by Carlmed Intelligent Core · Real-time pharmacy analytics
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#004C6E' }}>Clear</span>
          </button>
        </div>

        {activeTab === 'chat' ? (
          <>
            {/* Chat area */}
            <div style={{
              flex: 1, overflowY: 'auto', background: '#EFF4FF',
              padding: '24px 0', display: 'flex', flexDirection: 'column',
            }}>
              {showWelcome ? (
                /* Welcome state */
                <div style={{ display: 'flex', gap: 32, padding: '0 48px', alignItems: 'flex-start', justifyContent: 'center' }}>
                  {/* Quick action cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {QUICK_ACTIONS.map(action => (
                      <div
                        key={action.id}
                        onClick={() => sendMessage(action.query)}
                        style={{
                          width: 200, padding: '22px 20px', background: 'white', borderRadius: 14,
                          outline: '1px solid rgba(192,199,207,0.15)', cursor: 'pointer',
                          position: 'relative', overflow: 'hidden',
                          transition: 'box-shadow 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,76,110,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {action.dotColor && (
                          <div style={{
                            position: 'absolute', width: 10, height: 10, left: -4, top: -4,
                            background: action.dotColor, borderRadius: '50%',
                            boxShadow: `0 0 8px ${action.dotColor}`,
                          }} />
                        )}
                        <div style={{ width: 16, height: 16, background: '#004C6E', borderRadius: 3, marginBottom: 12 }} />
                        <div style={{ fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#0B1C30', marginBottom: 4 }}>{action.title}</div>
                        <div style={{ fontSize: 10, color: 'rgba(64,72,78,0.6)' }}>{action.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Welcome text */}
                  <div style={{ flex: 1, maxWidth: 520, textAlign: 'center', paddingTop: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,76,110,0.6)', textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 8 }}>
                      Clinical Curator Assistant
                    </div>
                    <div style={{ fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#0B1C30', lineHeight: '36px' }}>
                      How can I assist Carlmed today?
                    </div>
                  </div>
                </div>
              ) : (
                /* Messages */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 48px', maxWidth: 1100 }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.role === 'assistant' && (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #004C6E 0%, #B91C1C 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 4px -2px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}>
                          <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>AI</span>
                        </div>
                      )}

                      <div style={{ maxWidth: msg.role === 'user' ? 680 : 820 }}>
                        {msg.role === 'assistant' ? (
                          <div style={{
                            padding: 20, background: msg.isError ? '#FFF0EF' : 'white',
                            borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
                            outline: `1px solid ${msg.isError ? 'rgba(170,0,21,0.2)' : 'rgba(192,199,207,0.15)'}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            fontSize: 14, color: msg.isError ? '#AA0015' : '#0B1C30', lineHeight: '22px',
                          }}>
                            {formatMessage(msg.content)}
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              padding: '16px 20px',
                              background: 'linear-gradient(1deg, #004C6E 0%, #B91C1C 100%)',
                              borderTopLeftRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
                              boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)',
                            }}>
                              <div style={{ fontSize: 14, color: 'white', lineHeight: '22px' }}>{msg.content}</div>
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(64,72,78,0.5)', textAlign: 'right', marginTop: 6 }}>
                              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                        {msg.role === 'assistant' && idx === messages.length - 1 && (
                          <div style={{ fontSize: 10, color: 'rgba(64,72,78,0.5)', marginTop: 6 }}>Just now · Delivered</div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #B91C1C 0%, #004C6E 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 4px -2px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}>
                          <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{initials}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #004C6E 0%, #B91C1C 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5,
                      }}>
                        <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>AI</span>
                      </div>
                      <div style={{
                        background: 'white', borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
                        outline: '1px solid rgba(192,199,207,0.15)',
                      }}>
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{
              background: '#F8F9FF', padding: '14px 48px 20px', flexShrink: 0,
              borderTop: '1px solid rgba(192,199,207,0.2)',
            }}>
              <div style={{ maxWidth: 960, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about Carlmed inventory, financials, or POS sync..."
                    rows={1}
                    style={{
                      width: '100%', padding: '14px 48px 14px 20px',
                      background: '#EFF4FF', border: 'none', borderRadius: 14,
                      fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#0B1C30',
                      resize: 'none', outline: 'none', boxSizing: 'border-box',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      lineHeight: '20px', minHeight: 48, maxHeight: 160,
                    }}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 80, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: input.trim() && !loading
                      ? 'linear-gradient(45deg, #004C6E 0%, #B91C1C 100%)'
                      : 'rgba(0,76,110,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.15s',
                    boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                >
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                    <path d="M1 8H17M17 8L10 1M17 8L10 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div style={{ maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingLeft: 4 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 11, background: 'rgba(64,72,78,0.6)', borderRadius: 2 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(64,72,78,0.6)' }}>Voice Command</span>
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 11, height: 11, background: 'rgba(64,72,78,0.6)', borderRadius: 2 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(64,72,78,0.6)' }}>Scan Document</span>
                  </button>
                </div>
                <span style={{ fontSize: 9, color: 'rgba(64,72,78,0.4)' }}>
                  Carlmed AI assists with data curation. Verify critical clinical decisions.
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Data Insights Tab */
          <div style={{ flex: 1, overflowY: 'auto', background: '#EFF4FF', padding: 32 }}>
            {insightsLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#004C6E', fontSize: 14 }}>Loading insights...</div>
            ) : insightsData ? (
              <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    {
                      label: 'Total Products',
                      value: insightsData.products.length,
                      sub: `${insightsData.products.filter(p => p.quantity < 10).length} low stock`,
                      color: '#004C6E',
                    },
                    {
                      label: 'Monthly Revenue',
                      value: `₱${Number(insightsData.report.total_revenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                      sub: `${insightsData.report.total_sales || 0} transactions`,
                      color: '#006C49',
                    },
                    {
                      label: 'Out of Stock',
                      value: insightsData.products.filter(p => p.quantity === 0).length,
                      sub: 'items need restocking',
                      color: '#B91C1C',
                    },
                  ].map(card => (
                    <div key={card.label} style={{
                      background: 'white', borderRadius: 14, padding: '20px 24px',
                      outline: '1px solid rgba(192,199,207,0.15)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(64,72,78,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{card.label}</div>
                      <div style={{ fontSize: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(64,72,78,0.6)' }}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Low stock table */}
                <div style={{ background: 'white', borderRadius: 14, padding: 20, outline: '1px solid rgba(192,199,207,0.15)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                    Low Stock Items
                  </div>
                  {insightsData.products.filter(p => p.quantity < 10).length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(64,72,78,0.6)', padding: '8px 0' }}>All products are adequately stocked.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {insightsData.products.filter(p => p.quantity < 10).slice(0, 10).map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(192,199,207,0.15)' }}>
                          <span style={{ fontSize: 13, color: '#0B1C30' }}>{p.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: '#004C6E' }}>{formatPesoReal(p.price)}</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              background: p.quantity === 0 ? '#FFDAD6' : '#FFEDD5',
                              color: p.quantity === 0 ? '#AA0015' : '#C2410C',
                            }}>{p.quantity} units</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent sales */}
                <div style={{ background: 'white', borderRadius: 14, padding: 20, outline: '1px solid rgba(192,199,207,0.15)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#004C6E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                    Recent Sales
                  </div>
                  {insightsData.sales.slice(0, 8).map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(192,199,207,0.15)' }}>
                      <span style={{ fontSize: 12, color: 'rgba(64,72,78,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>#{String(s.id).padStart(5, '0')}</span>
                      <span style={{ fontSize: 12, color: '#0B1C30' }}>{s.date?.slice(0, 10)}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#006C49' }}>{formatPesoReal(s.total_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 14, color: '#AA0015' }}>Failed to load insights. Please check your connection.</div>
                <button onClick={loadInsights} style={{ marginTop: 12, padding: '8px 20px', background: '#004C6E', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Retry</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

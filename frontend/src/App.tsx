import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Search, 
  Bot,
  Briefcase,
  Heart,
  Wallet,
  Zap,
  ChevronRight,
  Send,
  X,
  MoreHorizontal,
  Calendar,
  ShieldCheck,
  Target,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const API_BASE = "http://localhost:8000";

type Role = 'admin' | 'user';
type View = 'dashboard' | 'employees' | 'policies' | 'recruitment' | 'sentiment' | 'payroll';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hr_token'));
  const [role, setRole] = useState<Role | null>(localStorage.getItem('hr_role') as Role);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! How can I help you today?' }]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      const res = await fetch(`${API_BASE}/token`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      setToken(data.access_token);
      setRole(data.role);
      localStorage.setItem('hr_token', data.access_token);
      localStorage.setItem('hr_role', data.role);
    } catch (err: any) { setError(err.message); }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_role');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMsgs);
    setChatInput('');
    
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatInput })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) { console.error(err); }
  };

  if (!token) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '400px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>HR Ops Login</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Enter your credentials to access the portal</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '0.5rem' }}>Username</label>
              <input className="chat-input-field" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin or user" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input className="chat-input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="admin123 or user123" />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" style={{ padding: '0.75rem' }}>
              <LogIn size={18} style={{ marginRight: '0.5rem' }} /> Sign In
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--slate-500)', textAlign: 'center' }}>
            Demo: admin/admin123 or user/user123
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <ShieldCheck size={20} />
          </div>
          HR Ops {role === 'admin' ? '(Admin)' : ''}
        </div>
        
        <div className="nav-section-title">Main</div>
        <nav className="nav-links">
          <a href="#" className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className={`nav-link ${activeView === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveView('recruitment')}>
            <Briefcase size={18} /> Recruitment
          </a>
          <a href="#" className={`nav-link ${activeView === 'employees' ? 'active' : ''}`} onClick={() => setActiveView('employees')}>
            <Users size={18} /> Directory
          </a>
        </nav>

        {role === 'admin' && (
          <>
            <div className="nav-section-title">Admin Controls</div>
            <nav className="nav-links">
              <a href="#" className={`nav-link ${activeView === 'payroll' ? 'active' : ''}`} onClick={() => setActiveView('payroll')}>
                <Wallet size={18} /> Payroll Control
              </a>
              <a href="#" className={`nav-link ${activeView === 'sentiment' ? 'active' : ''}`} onClick={() => setActiveView('sentiment')}>
                <Heart size={18} /> Org. Sentiment
              </a>
            </nav>
          </>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--slate-200)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={16} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username || 'Demo User'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem', color: '#ef4444' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-title">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input type="text" placeholder="Search..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', outline: 'none', width: '280px', fontSize: '0.875rem', background: 'var(--slate-100)' }} />
            </div>
            <Bell size={20} color="var(--slate-500)" cursor="pointer" />
          </div>
        </header>

        <div className="page-container">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="stats-grid">
                  {stats.map((stat, i) => (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ color: 'var(--slate-400)' }}><Users size={18} /></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>{stat.change}</span>
                      </div>
                      <div className="card-title">{stat.label}</div>
                      <div className="card-value">{stat.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Welcome to the {role} Portal</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>You are currently logged in as {role}. All data is synced with the FastAPI backend.</p>
                </div>
              </motion.div>
            )}
            {activeView !== 'dashboard' && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>{activeView} Module</h3>
                <p style={{ color: 'var(--slate-500)' }}>Functional API routes are ready in the backend for this module.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Chatbot */}
      <div className="chatbot-trigger" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={24} /> : <Bot size={24} />}
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="chat-window">
            <div className="chat-header">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#818cf8" />
                HR AI Agent
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>Connected to FastAPI AI Service</div>
            </div>
            <div className="chat-messages" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: msg.role === 'bot' ? 'var(--slate-100)' : 'var(--primary)', color: msg.role === 'bot' ? 'var(--slate-800)' : 'white', fontSize: '0.875rem' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-wrapper">
              <div style={{ position: 'relative' }}>
                <input type="text" className="chat-input-field" placeholder="Ask AI..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
                <Send size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', cursor: 'pointer' }} onClick={handleSendMessage} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

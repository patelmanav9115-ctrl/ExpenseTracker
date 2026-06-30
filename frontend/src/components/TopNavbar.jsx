import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import axiosInstance from '../api/axiosInstance';

export default function TopNavbar({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (e) {}
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/analytics': return 'Analytics & Trends';
      case '/income': return 'Income Tracking';
      case '/expense': return 'Expense Tracking';
      case '/subscriptions': return 'Subscriptions & Recurring Bills';
      case '/budgets': return 'Budget Management';
      case '/profile': return 'Profile Settings';
      default: return 'TrackIt';
    }
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 32px', 
      borderBottom: '1px solid var(--border-glass)',
      background: 'var(--bg-topbar)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Hamburger for mobile */}
        <button 
          className="mobile-header"
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer', padding: '4px' }}
        >
          ☰
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{getPageTitle()}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>




        <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }} onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </div>
        <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }}>🔔</div>
        
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem', color: 'white',
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
              border: dropdownOpen ? '2px solid var(--purple-light)' : '2px solid transparent',
              transition: 'all 0.2s'
            }} title={user?.name}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: '200px',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 50
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', display: 'block' }} className="mobile-user-info-dropdown">
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
              
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Currency</div>
                <select 
                  value={currency} 
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    setDropdownOpen(false);
                  }}
                  className="form-input"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', appearance: 'none', background: 'var(--input-bg)' }}
                >
                  {Object.keys(supportedCurrencies).map(curr => (
                    <option key={curr} value={curr}>{curr} - {supportedCurrencies[curr].symbol}</option>
                  ))}
                </select>
              </div>

              <Link  
                to="/profile" 
                onClick={() => setDropdownOpen(false)}
                style={{ padding: '12px 16px', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ⚙️ Profile Settings
              </Link>
              <button 
                onClick={handleLogout}
                style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border-glass)', color: 'var(--red)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

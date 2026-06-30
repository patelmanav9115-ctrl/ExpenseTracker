import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  // { path: '/subscriptions', label: 'Subscriptions', icon: '🔄' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/income',    label: 'Income',    icon: '💰' },
  { path: '/expense',   label: 'Expenses',  icon: '💸' },
  { path: '/budgets',   label: 'Budgets',   icon: '🎯' },
  { path: '/goals',     label: 'Goals',     icon: '🏆' },
  { path: '/profile',   label: 'Profile',   icon: '⚙️' },
];

export default function Navbar({ isOpen, close, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (e) {}
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between', 
          flexDirection: isCollapsed ? 'column' : 'row',
          gap: isCollapsed ? '16px' : '0',
          padding: isCollapsed ? '0' : '0 8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 4px 15px rgba(124,58,237,0.4)'
            }}>💼</div>
            {!isCollapsed && (
              <div>
                <div className="gradient-text" style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>TrackIt</div>
                <div style={{ color: 'var(--sidebar-text-muted)', fontSize: '0.7rem', marginTop: 2 }}>Expense Tracker</div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ 
              background: 'rgba(139, 92, 246, 0.15)', border: 'none', 
              color: 'var(--purple-light)', cursor: 'pointer', 
              fontSize: '0.9rem', padding: '6px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? '➡️' : '⬅️'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className="sidebar-link"
            style={{ position: 'relative' }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(139, 92, 246, 0.15)',
                      boxShadow: 'inset 0 0 0 1px rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      zIndex: 0
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span style={{ fontSize: '18px', zIndex: 1, position: 'relative', margin: isCollapsed ? '0 auto' : '0' }}>{icon}</span>
                {!isCollapsed && <span style={{ zIndex: 1, position: 'relative', color: isActive ? 'var(--purple-light)' : 'inherit' }}>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{
        borderTop: '1px solid var(--sidebar-border)',
        paddingTop: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        alignItems: isCollapsed ? 'center' : 'stretch'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isCollapsed ? '0' : '0 8px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--sidebar-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sidebar-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ color: 'var(--red)', justifyContent: isCollapsed ? 'center' : 'flex-start', fontSize: '0.85rem' }}
          title="Logout"
        >
          <span style={{ margin: isCollapsed ? '0 auto' : '0' }}>🚪</span> {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

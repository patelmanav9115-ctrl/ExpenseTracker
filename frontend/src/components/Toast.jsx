import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ type = 'success', message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.9)', border: '#10b981', icon: '✅' },
    error: { bg: 'rgba(244,63,94,0.9)', border: '#f43f5e', icon: '⚠️' },
    warning: { bg: 'rgba(245,158,11,0.9)', border: '#f59e0b', icon: '⚡' }
  };
  const style = colors[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{
        background: style.bg,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        borderLeft: `4px solid ${style.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)',
        minWidth: '280px'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
      <span style={{ fontWeight: 500, fontSize: '0.9rem', flex: 1 }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px', fontSize: '1.2rem', opacity: 0.7 }}
        aria-label="Close Notification"
      >
        ×
      </button>
    </motion.div>
  );
}

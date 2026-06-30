import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ text, children, position = 'top' }) {
  const [show, setShow] = useState(false);

  const posClasses = {
    top: { bottom: '100%', left: '50%', x: '-50%', y: -8, initialY: 0 },
    bottom: { top: '100%', left: '50%', x: '-50%', y: 8, initialY: 0 },
    left: { right: '100%', top: '50%', y: '-50%', x: -8, initialX: 0 },
    right: { left: '100%', top: '50%', y: '-50%', x: 8, initialX: 0 },
  };

  const p = posClasses[position];

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: p.initialX ?? p.x, y: p.initialY ?? p.y, scale: 0.95 }}
            animate={{ opacity: 1, x: p.x, y: p.y, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: p.top, bottom: p.bottom, left: p.left, right: p.right,
              background: 'rgba(15,15,46,0.95)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

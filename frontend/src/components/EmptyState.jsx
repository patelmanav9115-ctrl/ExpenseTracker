import { motion } from 'framer-motion';

export default function EmptyState({ title = 'No data found', description = 'There are no records to display at this time.', icon = '📭' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px dashed var(--border-glass)',
        margin: '16px 0'
      }}
    >
      <div style={{
        fontSize: '4rem',
        marginBottom: '16px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        width: '120px',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.5 }}>
        {description}
      </p>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>💼</div>
          <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>TrackIt</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </div>
          <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', transition: 'background 0.2s' }}>Log In</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-gradient-radial" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', zIndex: -1 }} />
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, maxWidth: '800px', marginBottom: '24px' }}
        >
          Master your money.<br />
          <span className="gradient-text">Shape your future.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.5 }}
        >
          The ultimate personal finance SaaS. Track income, monitor expenses, set budgets, and visualize your wealth in real-time.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '16px' }}
        >
          <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px', textDecoration: 'none' }}>Start Tracking Now</Link>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', maxWidth: '1000px', marginTop: '80px' }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="glass glow-purple" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📈</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Smart Analytics</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>Visualize your cash flow with beautiful, interactive charts. Spot trends instantly.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="glass glow-green" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Budget Goals</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>Set monthly category limits and get visual alerts before you overspend.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="glass glow-blue" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Bank-grade Security</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>Your data is encrypted and strictly private. We never sell your financial info.</p>
          </motion.div>
        </motion.div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>&copy; {new Date().getFullYear()} TrackIt SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}

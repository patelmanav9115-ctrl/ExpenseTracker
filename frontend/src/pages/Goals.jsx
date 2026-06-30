import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import Toast from '../components/Toast';

const ICONS = ['🎯', '🚗', '🏠', '✈️', '💻', '📱', '🎓', '💍', '🏖️', '🛡️', '💊', '🎸'];
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#84cc16'];
import { useCurrency } from '../context/CurrencyContext';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency: fmt, currency, supportedCurrencies } = useCurrency();
  const [toast, setToast] = useState(null);
  const [fundModal, setFundModal] = useState(null); // {goalId, name}
  const [fundAmount, setFundAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#8b5cf6'
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchGoals = async () => {
    try {
      const { data } = await axiosInstance.get('/goals');
      setGoals(data.data || []);
    } catch {
      showToast('Failed to fetch goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/goals', form);
      setGoals(prev => [data.data, ...prev]);
      setForm({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#8b5cf6' });
      showToast('Goal created! 🎯');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFund = async (e) => {
    e.preventDefault();
    if (!fundAmount || Number(fundAmount) <= 0) return;
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.patch(`/goals/${fundModal.goalId}/fund`, { amount: fundAmount });
      setGoals(prev => prev.map(g => g._id === fundModal.goalId ? data.data : g));
      setFundModal(null);
      setFundAmount('');
      showToast(`Added ${fmt(fundAmount)} to "${fundModal.name}"! 💰`);
    } catch {
      showToast('Failed to fund goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete goal "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
      showToast('Goal deleted');
    } catch {
      showToast('Failed to delete goal', 'error');
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Fund Modal */}
      <AnimatePresence>
        {fundModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={() => setFundModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass" style={{ padding: '32px', width: '100%', maxWidth: '400px', borderRadius: '20px' }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>💰 Fund Goal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                Adding funds to <strong style={{ color: 'var(--text-primary)' }}>{fundModal.name}</strong>
              </p>
              <form onSubmit={handleFund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Amount ({supportedCurrencies[currency].symbol})</label>
                  <input
                    className="form-input" type="number" min="1" placeholder="e.g. 5000"
                    value={fundAmount} onChange={e => setFundAmount(e.target.value)} required autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setFundModal(null)}
                    className="btn-danger" style={{ flex: 1, padding: '12px', borderRadius: '10px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2 }}>
                    {submitting ? <><span className="btn-spinner" />Adding...</> : 'Add Funds'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🏆 Financial Goals</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Set targets, track progress, achieve dreams.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Goals', value: goals.length, icon: '🎯', color: '#8b5cf6' },
          { label: 'Completed', value: completed, icon: '✅', color: '#10b981' },
          { label: 'Total Target', value: fmt(totalTarget), icon: '💸', color: '#3b82f6' },
          { label: 'Total Saved', value: fmt(totalSaved), icon: '💰', color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: '20px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Add Goal Form */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>➕ New Goal</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Goal Name</label>
              <input className="form-input" placeholder="e.g. Emergency Fund" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Target Amount ({supportedCurrencies[currency].symbol})</label>
              <input className="form-input" type="number" min="1" placeholder="0" value={form.targetAmount}
                onChange={e => setForm({ ...form, targetAmount: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Deadline (optional)</label>
              <input className="form-input" type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                    style={{ fontSize: '1.2rem', padding: '6px 8px', borderRadius: '8px', border: form.icon === ic ? '2px solid #8b5cf6' : '2px solid transparent', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '4px' }}>
              {submitting ? <><span className="btn-spinner" />Creating...</> : `${form.icon} Create Goal`}
            </button>
          </form>
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              Loading goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="glass" style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏆</div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>No goals yet!</p>
              <p style={{ fontSize: '0.875rem' }}>Create your first financial goal to get started.</p>
            </div>
          ) : goals.map((goal, i) => {
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            const daysLeft = getDaysLeft(goal.deadline);
            const isComplete = goal.savedAmount >= goal.targetAmount;
            return (
              <motion.div
                key={goal._id}
                className="glass"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ padding: '24px', borderLeft: `4px solid ${goal.color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '2rem', width: 48, height: 48, background: `${goal.color}22`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{goal.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {goal.name}
                        {isComplete && <span style={{ background: '#10b98122', color: '#10b981', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>✅ Achieved!</span>}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                        {daysLeft !== null ? (daysLeft === 0 ? '⏰ Due today!' : `📅 ${daysLeft} days left`) : 'No deadline'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isComplete && (
                      <button onClick={() => setFundModal({ goalId: goal._id, name: goal.name })}
                        style={{ background: `${goal.color}22`, color: goal.color, border: `1px solid ${goal.color}44`, padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                        + Fund
                      </button>
                    )}
                    <button onClick={() => handleDelete(goal._id, goal.name)} className="btn-danger" style={{ padding: '6px 12px' }}>🗑</button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '8px' }}>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: isComplete ? '#10b981' : goal.color }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{fmt(goal.savedAmount)}</strong> saved
                  </span>
                  <span style={{ fontWeight: 600, color: goal.color }}>{pct}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>of {fmt(goal.targetAmount)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

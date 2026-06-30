import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import SkeletonLoader from '../components/SkeletonLoader';
import { useCurrency } from '../context/CurrencyContext';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Utilities', 'Education', 'Rent', 'Travel', 'Personal Care', 'Other'
];

export default function Budget() {
  const { formatCurrency: fmt, currency, supportedCurrencies } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ category: 'Food & Dining', limit: '' });

  const fetchData = async () => {
    try {
      const [budgetRes, dashboardRes] = await Promise.all([
        axiosInstance.get('/budgets'),
        axiosInstance.get('/dashboard')
      ]);
      setBudgets(budgetRes.data.data);
      setExpensesByCategory(dashboardRes.data.data.spendByCategory || {});
    } catch {
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axiosInstance.post('/budgets', { ...form, limit: Number(form.limit) });
      if (data.success) {
        setSuccess('Budget saved successfully! ✅');
        setForm({ category: 'Food & Dining', limit: '' });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await axiosInstance.delete(`/budgets/${id}`);
      setBudgets(budgets.filter(b => b._id !== id));
      fetchData();
    } catch {
      setError('Failed to delete budget');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          🎯 <span className="gradient-text">Budgets</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Set limits and monitor your spending</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Form */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Set Category Budget</h2>
          {error && <div style={{ color: '#f43f5e', fontSize: '0.8rem', marginBottom: '16px' }}>⚠️ {error}</div>}
          {success && <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '16px' }}>✅ {success}</div>}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Category</label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Monthly Limit ({supportedCurrencies[currency].symbol})</label>
              <input className="form-input" name="limit" type="number" min="1" placeholder="0" value={form.limit} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '4px' }}>
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : 'Save Budget'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Active Budgets</h2>
          {loading ? (
            <SkeletonLoader count={3} type="card" />
          ) : budgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
              <p>No budgets set yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {budgets.map(b => {
                const spent = expensesByCategory[b.category] || 0;
                const percent = Math.min((spent / b.limit) * 100, 100);
                const isOver = spent > b.limit;
                const color = isOver ? '#f43f5e' : percent > 80 ? '#f59e0b' : '#10b981';

                return (
                  <div key={b._id} style={{
                    padding: '16px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px', border: `1px solid ${isOver ? 'rgba(244,63,94,0.3)' : 'var(--border-glass)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600 }}>{b.category}</div>
                      <div>
                        <span style={{ color, fontWeight: 700 }}>{fmt(spent)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> / {fmt(b.limit)}</span>
                      </div>
                    </div>
                    
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }} />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: isOver ? '#f43f5e' : 'var(--text-muted)' }}>
                        {isOver ? `Over budget by ${fmt(spent - b.limit)}` : `${fmt(b.limit - spent)} remaining`}
                      </div>
                      <button onClick={() => handleDelete(b._id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

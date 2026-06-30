import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency: fmt } = useCurrency();

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        axiosInstance.get('/expense/get?isRecurring=true&limit=1000'),
        axiosInstance.get('/income/get?isRecurring=true&limit=1000')
      ]);
      
      const expenses = (expRes.data.data || expRes.data).map(e => ({ ...e, isExpense: true }));
      const incomes = (incRes.data.data || incRes.data).map(i => ({ ...i, isExpense: false }));
      
      setItems([...expenses, ...incomes].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalMonthlyExp = items.filter(i => i.isExpense).reduce((acc, cur) => acc + cur.amount, 0);
  const totalMonthlyInc = items.filter(i => !i.isExpense).reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          🔄 <span className="gradient-text">Subscriptions</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Track your recurring bills and incomes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Active Subscriptions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>{items.length}</div>
        </div>
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Recurring Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{fmt(totalMonthlyExp)}</div>
        </div>
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Recurring Incomes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{fmt(totalMonthlyInc)}</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>All Recurring Items</h2>
        
        {loading ? (
          <SkeletonLoader count={5} type="list-item" />
        ) : items.length === 0 ? (
          <EmptyState 
            title="No Subscriptions Found" 
            description="You don't have any recurring expenses or incomes set up." 
            icon="🔄" 
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div 
                  key={item._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '10px',
                      background: item.isExpense ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', 
                      border: `1px solid ${item.isExpense ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    }}>
                      {item.isExpense ? '💸' : '💰'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.description}
                        <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>
                          {item.recurrenceInterval}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        <span className={item.isExpense ? "badge badge-expense" : "badge badge-income"}>{item.category}</span>
                        <span style={{ marginLeft: '8px' }}>Started: {fmtDate(item.date)}</span>
                        {item.lastRecurrenceDate && (
                          <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>Last Billed: {fmtDate(item.lastRecurrenceDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: item.isExpense ? '#f43f5e' : '#10b981' }}>
                    {item.isExpense ? '-' : '+'}{fmt(item.amount)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

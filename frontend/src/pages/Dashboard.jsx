import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function StatCard({ label, value, icon, color, glow, sub }) {
  const colors = {
    green:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  text: '#10b981' },
    red:    { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.2)',   text: '#f43f5e' },
    blue:   { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#3b82f6' },
    purple: { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#8b5cf6' },
  };
  const c = colors[color] || colors.purple;
  return (
    <div className={`glass glow-${color}`} style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 40, height: 40, background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.text }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatCurrency: fmt } = useCurrency();

  useEffect(() => {
    axiosInstance.get('/dashboard/')
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fade-in" style={{ width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <SkeletonLoader count={1} type="text" />
          <SkeletonLoader count={1} type="text" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <SkeletonLoader count={4} type="card" />
        </div>
        <div className="responsive-grid">
          <SkeletonLoader count={2} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#f43f5e', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <p>{error}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Make sure the backend server is running on port 4000.</p>
        </div>
      </div>
    );
  }

  const { monthlyIncome = 0, monthlyExpense = 0, savings = 0, savingsRate = 0, recentTransactions = [], expenseDistribution = [], budgetAlerts = [], upcomingBills = [] } = data || {};

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}!</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem' }}>
          Here's your financial overview for {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Monthly Income"  value={fmt(monthlyIncome)}  icon="💰" color="green"  sub="This month" />
        <StatCard label="Monthly Expenses" value={fmt(monthlyExpense)} icon="💸" color="red"    sub="This month" />
        <StatCard label="Net Savings"     value={fmt(savings)}         icon="🏦" color="blue"   sub={savings >= 0 ? 'Positive balance 🎉' : 'In deficit'} />
        <StatCard label="Savings Rate"    value={`${savingsRate}%`}   icon="📈" color="purple" sub="Of income saved" />
      </div>

      {budgetAlerts.length > 0 && (
        <div style={{ marginBottom: '32px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', padding: '16px 24px' }}>
          <h3 style={{ color: '#f43f5e', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Budget Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {budgetAlerts.map(b => (
              <div key={b.category} style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                You have spent <span style={{ fontWeight: 700 }}>{fmt(b.spent)}</span> in <span style={{ fontWeight: 600 }}>{b.category}</span>, which is <strong style={{ color: '#f43f5e' }}>{Math.round(b.percent)}%</strong> of your {fmt(b.limit)} limit.
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingBills.length > 0 && (
        <div style={{ marginBottom: '32px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px 24px' }}>
          <h3 style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 Upcoming Bills (Next 7 Days)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingBills.map(bill => (
              <div key={bill._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{bill.description}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.75rem' }}>{new Date(bill.nextDueDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px' }}>
                    Due in {bill.dueInDays === 0 ? 'Today' : `${bill.dueInDays} days`}
                  </span>
                  <span style={{ fontWeight: 700 }}>{fmt(bill.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="responsive-grid">
        {/* Recent transactions */}
        <div className="glass" style={{ padding: '24px', gridColumn: expenseDistribution.length === 0 ? '1 / -1' : 'auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🕐 Recent Transactions
          </h2>
          {recentTransactions.length === 0 ? (
            <EmptyState 
              title="No Transactions" 
              description="No transactions this month yet" 
              icon="📭" 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.slice(0, 8).map((tx, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '10px',
                      background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    }}>
                      {tx.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tx.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {tx.category} • {fmtDate(tx.date)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.9rem',
                    color: tx.type === 'income' ? '#10b981' : '#f43f5e'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense distribution */}
        {expenseDistribution.length > 0 && (
          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍩 Expense Breakdown
            </h2>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expenseDistribution.map((entry, index) => {
                      const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: 'rgba(15,15,46,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}
                    formatter={(value) => [fmt(value), 'Spent']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

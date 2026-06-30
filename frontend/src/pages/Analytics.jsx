import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import SkeletonLoader from '../components/SkeletonLoader';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const { formatCurrency: fmt, currency, supportedCurrencies } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <SkeletonLoader count={1} type="text" />
          <SkeletonLoader count={1} type="text" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <SkeletonLoader count={3} type="card" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <SkeletonLoader count={2} type="card" />
        </div>
      </div>
    );
  }
  if (error) return <div style={{ color: '#f43f5e', textAlign: 'center', marginTop: '50px' }}>⚠️ {error}</div>;

  const trendData = [...(data.trendData || [])].reverse(); // oldest to newest
  const pieData = data.expenseDistribution || [];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          📈 <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Deep dive into your finances</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All-Time Income</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{fmt(data.allTimeStats?.income)}</div>
        </div>
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All-Time Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{fmt(data.allTimeStats?.expense)}</div>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Net Worth</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{fmt(data.allTimeStats?.netWorth)}</div>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center', background: 'rgba(59,130,246,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Fixed Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{fmt(data.allTimeStats?.fixedExpense)}</div>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center', background: 'rgba(156,163,175,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Variable Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(data.allTimeStats?.variableExpense)}</div>
        </div>
        <div className="glass" style={{ padding: '24px', textAlign: 'center', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ fontSize: '0.85rem', color: '#8b5cf6', marginBottom: '8px', fontWeight: 600 }}>🤖 Next Month Forecast</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>{fmt(data.smartForecast || 0)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Trend Chart */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>6-Month Trend</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `${supportedCurrencies[currency].symbol}${val}`} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: 'rgba(15,15,46,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '0.85rem', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line type="monotone" name="Income" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Expense" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Expense Breakdown (This Month)</h2>
          {pieData.length === 0 ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No expenses this month
            </div>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={80} outerRadius={110}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import Tesseract from 'tesseract.js';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Utilities', 'Education', 'Rent', 'Travel', 'Personal Care', 'Other'
];

export default function Expense() {
  const { user } = useAuth();
  const userCategories = user?.expenseCategories?.length > 0 ? user.expenseCategories : EXPENSE_CATEGORIES;

  const [expenses, setExpenses] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();
  const [form, setForm] = useState({ description: '', amount: '', category: userCategories[0], date: new Date().toISOString().split('T')[0], isRecurring: false, recurrenceInterval: 'monthly', expenseType: 'variable' });
  const { formatCurrency: fmt, currency, supportedCurrencies } = useCurrency();
  const [filterRange, setFilterRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptParsing, setReceiptParsing] = useState(false);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptParsing(true);
    addToast('Scanning receipt, please wait...', 'info');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      // Basic regex to find a date
      const dateMatch = text.match(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/);
      // Regex to find amounts like $12.34 or 12.34
      const amountMatches = text.match(/[$€£₹]?\s*\d+[.,]\d{2}/g);
      
      let amount = '';
      if (amountMatches && amountMatches.length > 0) {
        // Just take the largest amount found (often the total)
        const amounts = amountMatches.map(a => parseFloat(a.replace(/[^0-9.]/g, '')));
        amount = Math.max(...amounts).toString();
      }

      setForm(prev => ({
        ...prev,
        description: 'Parsed Receipt Expense',
        amount: amount || prev.amount,
        // If a date is found, we could parse it, but for simplicity we keep current date unless easy
        date: dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : prev.date
      }));

      addToast('Receipt parsed! Please verify the details.', 'success');
    } catch (error) {
      addToast('Failed to parse receipt.', 'error');
    } finally {
      setReceiptParsing(false);
      e.target.value = ''; // Reset input
    }
  };

  const fetchData = async () => {
    try {
      const [listRes, overviewRes] = await Promise.all([
        axiosInstance.get('/expense/get'),
        axiosInstance.get('/expense/overview'),
      ]);
      setExpenses(listRes.data.data || listRes.data);
      setOverview(overviewRes.data.data);
    } catch {
      addToast('Failed to load expense data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        isRecurring: form.isRecurring,
        recurrenceInterval: form.isRecurring ? form.recurrenceInterval : 'none',
        expenseType: form.expenseType,
      };
      const { data } = await axiosInstance.post('/expense/add', payload);
      if (data.success) {
        addToast('Expense added successfully!', 'success');
        setForm({ description: '', amount: '', category: userCategories[0], date: new Date().toISOString().split('T')[0], isRecurring: false, recurrenceInterval: 'monthly', expenseType: 'variable' });
        fetchData();
      } else {
        addToast(data.message, 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await axiosInstance.delete(`/expense/delete/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
      addToast('Expense deleted', 'success');
      fetchData();
    } catch {
      addToast('Failed to delete expense', 'error');
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get('/expense/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense_details.xlsx';
      a.click();
    } catch {
      addToast('Failed to download', 'error');
    }
  };



  const handleDownloadPDF = async () => {
    try {
      const res = await axiosInstance.get('/expense/download-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense_report.pdf';
      a.click();
    } catch {
      addToast('Failed to download PDF', 'error');
    }
  };

  // Group expenses by category for summary
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            💸 <span className="gradient-text">Expenses</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Monitor and control your spending</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownload} style={{
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)', padding: '10px 20px',
            borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }} id="expense-download-excel">
            📊 Export Excel
          </button>
          <button onClick={handleDownloadPDF} style={{
            background: 'rgba(244,63,94,0.1)', color: '#f43f5e',
            border: '1px solid rgba(244,63,94,0.25)', padding: '10px 20px',
            borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }} id="expense-download-pdf">
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Overview cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total Expenses', value: fmt(overview.totalExpense), color: '#f43f5e' },
            { label: 'Average / Entry', value: fmt(overview.averageExpense), color: '#f59e0b' },
            { label: 'Transactions', value: overview.numberOfTransactions, color: '#8b5cf6' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="responsive-split">
        {/* Add expense form */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>➕ Add Expense</h2>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                id="receipt-upload" 
                style={{ display: 'none' }} 
                onChange={handleReceiptUpload} 
              />
              <label 
                htmlFor="receipt-upload" 
                style={{ 
                  background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {receiptParsing ? '⏳ Scanning...' : '📸 Scan Receipt'}
              </label>
            </div>
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Description</label>
              <input className="form-input" name="description" placeholder="e.g. Grocery shopping" value={form.description} onChange={handleChange} required id="expense-desc" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Amount ({supportedCurrencies[currency].symbol})</label>
              <input className="form-input" name="amount" type="number" min="1" placeholder="0" value={form.amount} onChange={handleChange} required id="expense-amount" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Category</label>
                <select className="form-input" name="category" value={form.category} onChange={handleChange} required id="expense-cat">
                  {userCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Expense Type</label>
                <select className="form-input" name="expenseType" value={form.expenseType} onChange={handleChange} required id="expense-type">
                  <option value="variable">Variable</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Date</label>
              <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} required id="expense-date" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(244,63,94,0.07)', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.15)' }}>
              <input type="checkbox" id="expense-recurring" name="isRecurring" checked={form.isRecurring || false} onChange={e => setForm(prev => ({ ...prev, isRecurring: e.target.checked }))} style={{ accentColor: '#f43f5e', width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="expense-recurring" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>🔄 Recurring Transaction</label>
            </div>
            {form.isRecurring && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Repeat Every</label>
                <select className="form-input" name="recurrenceInterval" value={form.recurrenceInterval || 'monthly'} onChange={handleChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Adding Expense...
                </>
              ) : 'Add Expense'}
            </button>
          </form>

          {/* Category summary */}
          {Object.keys(categoryTotals).length > 0 && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '14px', color: 'var(--text-secondary)' }}>By Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, total]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f43f5e' }}>{fmt(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Expenses</h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[['all','All Time'],['7d','7 Days'],['30d','30 Days'],['custom','Custom']].map(([val, label]) => (
                <button key={val} onClick={() => setFilterRange(val)}
                  style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: filterRange === val ? '#f43f5e' : 'rgba(255,255,255,0.05)',
                    color: filterRange === val ? 'white' : 'var(--text-muted)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Search description or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
          {filterRange === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <input className="form-input" type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
              <input className="form-input" type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ flex: 1, minWidth: '140px' }} />
            </div>
          )}
          {loading ? (
            <SkeletonLoader count={5} type="list-item" />
          ) : (() => {
            const now = new Date();
            const filtered = expenses.filter(exp => {
              const d = new Date(exp.date);
              if (filterRange === '7d') return now - d <= 7 * 86400000;
              if (filterRange === '30d') return now - d <= 30 * 86400000;
              if (filterRange === 'custom') {
                const s = customStart ? new Date(customStart) : null;
                const e = customEnd ? new Date(customEnd) : null;
                if (s && d < s) return false;
                if (e && d > e) return false;
              }
              if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                if (!exp.description.toLowerCase().includes(query) && 
                    !exp.category.toLowerCase().includes(query)) {
                  return false;
                }
              }
              return true;
            });
            if (filtered.length === 0) return (
              <EmptyState 
                title="No Expenses Found" 
                description="You don't have any expense records for the selected period." 
                icon="💸" 
              />
            );
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((exp) => (
                    <motion.div 
                      key={exp._id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-glass)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      }}>{exp.isRecurring ? '🔄' : '💸'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {exp.description}
                          {exp.isRecurring && <span style={{ fontSize: '0.65rem', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>{exp.recurrenceInterval}</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          <span className="badge badge-expense">{exp.category}</span>
                          <span style={{ 
                            marginLeft: '8px', 
                            background: exp.expenseType === 'fixed' ? 'rgba(59,130,246,0.15)' : 'rgba(156,163,175,0.15)', 
                            color: exp.expenseType === 'fixed' ? '#3b82f6' : 'var(--text-secondary)', 
                            padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' 
                          }}>
                            {exp.expenseType === 'fixed' ? 'Fixed' : 'Variable'}
                          </span>
                          <span style={{ marginLeft: '8px' }}>{fmtDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f43f5e' }}>-{fmt(exp.amount)}</span>
                      <Tooltip text="Delete expense" position="left">
                        <button className="btn-danger" onClick={() => handleDelete(exp._id)} aria-label={`Delete expense ${exp.description}`}>🗑 Delete</button>
                      </Tooltip>
                    </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

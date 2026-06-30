import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  
  const [expenseCategories, setExpenseCategories] = useState(user?.expenseCategories || ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Rent', 'Travel', 'Personal Care', 'Other']);
  const [incomeCategories, setIncomeCategories] = useState(user?.incomeCategories || ['Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Side Hustle', 'Other']);
  const [newExpCat, setNewExpCat] = useState('');
  const [newIncCat, setNewIncCat] = useState('');

  const [pLoading, setPLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  
  const [pMsg, setPMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [catMsg, setCatMsg] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setPLoading(true); setPMsg({ type: '', text: '' });
    try {
      const { data } = await axiosInstance.put('/users/me', profileForm);
      if (data.success) {
        login({ ...user, name: data.user.name, email: data.user.email });
        setPMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setPMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setPMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setPLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwLoading(true); setPwMsg({ type: '', text: '' });
    try {
      const { data } = await axiosInstance.put('/users/password', passwordForm);
      if (data.success) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        setPwMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCategoryUpdate = async (e) => {
    e.preventDefault();
    setCatLoading(true); setCatMsg({ type: '', text: '' });
    try {
      const { data } = await axiosInstance.put('/users/categories', { expenseCategories, incomeCategories });
      if (data.success) {
        login({ ...user, expenseCategories: data.expenseCategories, incomeCategories: data.incomeCategories });
        setCatMsg({ type: 'success', text: 'Categories updated successfully!' });
      }
    } catch (err) {
      setCatMsg({ type: 'error', text: err.response?.data?.message || 'Category update failed' });
    } finally {
      setCatLoading(false);
    }
  };

  const removeCategory = (type, cat) => {
    if (type === 'expense') setExpenseCategories(expenseCategories.filter(c => c !== cat));
    if (type === 'income') setIncomeCategories(incomeCategories.filter(c => c !== cat));
  };

  const addCategory = (type) => {
    if (type === 'expense' && newExpCat.trim() && !expenseCategories.includes(newExpCat.trim())) {
      setExpenseCategories([...expenseCategories, newExpCat.trim()]);
      setNewExpCat('');
    }
    if (type === 'income' && newIncCat.trim() && !incomeCategories.includes(newIncCat.trim())) {
      setIncomeCategories([...incomeCategories, newIncCat.trim()]);
      setNewIncCat('');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          ⚙️ <span className="gradient-text">Profile Settings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Manage your account details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Profile Details */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Account Details</h2>
          {pMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
              background: pMsg.type === 'error' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
              color: pMsg.type === 'error' ? '#f43f5e' : '#10b981',
              border: `1px solid ${pMsg.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`
            }}>
              {pMsg.type === 'error' ? '⚠️ ' : '✅ '}{pMsg.text}
            </div>
          )}
          
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Full Name</label>
              <input className="form-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Email Address</label>
              <input className="form-input" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary" disabled={pLoading} style={{ marginTop: '8px' }}>
              {pLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Security</h2>
          {pwMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
              background: pwMsg.type === 'error' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
              color: pwMsg.type === 'error' ? '#f43f5e' : '#10b981',
              border: `1px solid ${pwMsg.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`
            }}>
              {pwMsg.type === 'error' ? '⚠️ ' : '✅ '}{pwMsg.text}
            </div>
          )}
          
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Current Password</label>
              <input className="form-input" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>New Password</label>
              <input className="form-input" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary" disabled={pwLoading} style={{ marginTop: '8px' }}>
              {pwLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Custom Categories */}
        <div className="glass" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>🏷 Custom Categories</h2>
          {catMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
              background: catMsg.type === 'error' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
              color: catMsg.type === 'error' ? '#f43f5e' : '#10b981',
              border: `1px solid ${catMsg.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`
            }}>
              {catMsg.type === 'error' ? '⚠️ ' : '✅ '}{catMsg.text}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {/* Expense Categories */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Expense Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {expenseCategories.map(cat => (
                  <span key={cat} style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '4px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cat}
                    <button type="button" onClick={() => removeCategory('expense', cat)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" value={newExpCat} onChange={e => setNewExpCat(e.target.value)} placeholder="New category" style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory('expense'))} />
                <button type="button" className="btn-primary" onClick={() => addCategory('expense')} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Add</button>
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Income Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {incomeCategories.map(cat => (
                  <span key={cat} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cat}
                    <button type="button" onClick={() => removeCategory('income', cat)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" value={newIncCat} onChange={e => setNewIncCat(e.target.value)} placeholder="New category" style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory('income'))} />
                <button type="button" className="btn-primary" onClick={() => addCategory('income')} style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#10b981' }}>Add</button>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <button type="button" className="btn-primary" onClick={handleCategoryUpdate} disabled={catLoading}>
              {catLoading ? <span className="btn-spinner"></span> : 'Save Categories'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

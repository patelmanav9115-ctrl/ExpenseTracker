import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Login from './pages/Login';
import Register from './pages/Register';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes (Layout handles auth guard) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income"    element={<Income />} />
        <Route path="/expense"   element={<Expense />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/budgets"   element={<Budget />} />
        <Route path="/goals"     element={<Goals />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

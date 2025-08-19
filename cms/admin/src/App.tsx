import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Login } from './Login';
import Dashboard from './Dashboard';
import PagesManager from './PagesManager';
import MediaManager from './MediaManager';
import SettingsManager from './SettingsManager';
import UserManager from './UserManager';
import ProductList from './ProductList';
import ProductEditor from './ProductEditor';
import Setup from './Setup';
import AdminBar from './AdminBar';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupNeeded, setIsSetupNeeded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }

    // Check if setup is needed (for demo, we'll assume it's not needed)
    setIsSetupNeeded(false);
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    console.log('Login successful:', user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('login');
  };

  const handleNavigate = (page: string) => {
    navigate(page);
  };

  const handleSetupComplete = () => {
    setIsSetupNeeded(false);
    navigate('login');
  };

  // Show setup if needed
  if (isSetupNeeded) {
    return <Setup onSetupComplete={handleSetupComplete} />;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="login" element={<Login onLogin={handleLoginSuccess} />} />
        <Route path="setup" element={<Setup onSetupComplete={handleSetupComplete} />} />
        <Route path="/" element={<Navigate to="login" replace />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  // Main app routes when authenticated
  return (
    <div className="App App-authenticated">
      <AdminBar onLogout={handleLogout} />
      <div className="cms-main-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
          <Route path="pages" element={<PagesManager />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="settings" element={<SettingsManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/edit/:id" element={<ProductEditor />} />
          <Route path="login" element={<Navigate to="dashboard" replace />} />
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/admin">
      <AppContent />
    </Router>
  );
}

export default App;

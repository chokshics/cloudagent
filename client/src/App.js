import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Promotions from './pages/Promotions';
import MobileNumbers from './pages/MobileNumbers';
import WhatsAppCampaigns from './pages/WhatsAppCampaigns';
import SubscriptionPage from './pages/SubscriptionPage';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Protected routes */}
      {user ? (
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
      ) : (
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      )}
      
      {user ? (
        <Route path="/promotions" element={
          <Layout>
            <Promotions />
          </Layout>
        } />
      ) : (
        <Route path="/promotions" element={<Navigate to="/" replace />} />
      )}
      
      {user ? (
        <Route path="/mobile-numbers" element={
          <Layout>
            <MobileNumbers />
          </Layout>
        } />
      ) : (
        <Route path="/mobile-numbers" element={<Navigate to="/" replace />} />
      )}
      
      {user ? (
        <Route path="/whatsapp-campaigns" element={
          <Layout>
            <WhatsAppCampaigns />
          </Layout>
        } />
      ) : (
        <Route path="/whatsapp-campaigns" element={<Navigate to="/" replace />} />
      )}
      
      {user ? (
        <Route path="/subscription" element={
          <Layout>
            <SubscriptionPage />
          </Layout>
        } />
      ) : (
        <Route path="/subscription" element={<Navigate to="/" replace />} />
      )}
      
      {/* Super Admin only routes */}
      {user && user.role === 'superadmin' ? (
        <Route path="/reports" element={
          <Layout>
            <Reports />
          </Layout>
        } />
      ) : (
        <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
      )}
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 
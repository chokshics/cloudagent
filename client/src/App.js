import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NewHomePage from './pages/NewHomePage';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Promotions from './pages/Promotions';
import MobileNumbers from './pages/MobileNumbers';
import WhatsAppCampaigns from './pages/WhatsAppCampaigns';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionUSD from './pages/SubscriptionUSD';
import Reports from './pages/Reports';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import CookieConsent from './pages/CookieConsent';
import CloudSolutions from './pages/CloudSolutions';
import DevOpsConsulting from './pages/DevOpsConsulting';
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
      <Route path="/" element={<NewHomePage />} />
      <Route path="/merchantspro" element={<HomePage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/cloud-solutions" element={<CloudSolutions />} />
      <Route path="/devops-consulting" element={<DevOpsConsulting />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/cookie-policy" element={<CookieConsent />} />
      
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
      
      {user ? (
        <Route path="/subscription-usd" element={
          <Layout>
            <SubscriptionUSD />
          </Layout>
        } />
      ) : (
        <Route path="/subscription-usd" element={<Navigate to="/" replace />} />
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
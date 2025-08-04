import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, Store, MessageSquare, BarChart3, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RegistrationModal from '../components/RegistrationModal';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(loginData.username, loginData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Merchants Pro</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-indigo-600"
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-indigo-600"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Manage Your Business with WhatsApp Campaigns
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create promotions, manage customer contacts, and send WhatsApp campaigns to boost your sales. 
            Perfect for merchants who want to grow their business digitally.
          </p>
        </div>

        {/* 4 Steps to Boost Sales */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">🚀 4 Simple Steps to Boost Your Sales</h3>
            <p className="text-indigo-100 text-lg">Transform your business with our powerful WhatsApp marketing platform</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Register Yourself</h4>
              <p className="text-indigo-100 text-sm">Create your account in just 2 minutes</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Add Customer Contacts</h4>
              <p className="text-indigo-100 text-sm">Import your customer database easily</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Create Promotions</h4>
              <p className="text-indigo-100 text-sm">Design attractive promotional campaigns</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Send WhatsApp Campaigns</h4>
              <p className="text-indigo-100 text-sm">Reach customers instantly and boost sales</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-indigo-100 font-semibold">✨ Start Your Success Journey Today!</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <MessageSquare className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">WhatsApp Campaigns</h3>
            <p className="text-gray-600">
              Send promotional messages directly to your customers via WhatsApp
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">
              Enterprise-grade security with encrypted data storage
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <LogIn className="h-8 w-8 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Go AIz Technologies. All rights reserved.</p>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onRegistrationSuccess={() => {
          setActiveTab('login');
          // Scroll to login section after successful registration
          setTimeout(() => {
            const loginSection = document.querySelector('.max-w-md.mx-auto');
            if (loginSection) {
              loginSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          }, 100);
        }}
      />
    </div>
  );
};

export default HomePage; 
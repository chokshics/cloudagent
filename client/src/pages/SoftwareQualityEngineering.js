import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Server, 
  Globe, 
  Lock,
  X,
  Mail,
  MapPin,
  Phone,
  GitCommit,
  Cpu,
  Activity,
  Smartphone,
  Monitor,
  Bug,
  TestTube,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const SoftwareQualityEngineering = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      icon: <TestTube className="w-8 h-8 text-white" />,
      title: "Automated Testing",
      description: "Comprehensive automated testing solutions for web and mobile applications",
      features: ["Unit testing", "Integration testing", "End-to-end testing", "Performance testing"]
    },
    {
      icon: <Bug className="w-8 h-8 text-white" />,
      title: "Quality Assurance",
      description: "Rigorous quality assurance processes to ensure software reliability",
      features: ["Manual testing", "Test case design", "Bug tracking", "Regression testing"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Performance Testing",
      description: "Comprehensive performance and load testing for scalable applications",
      features: ["Load testing", "Stress testing", "Performance monitoring", "Optimization"]
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Security Testing",
      description: "Advanced security testing to protect your applications from vulnerabilities",
      features: ["Penetration testing", "Vulnerability assessment", "Security audits", "Compliance testing"]
    }
  ];

  const benefits = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Improved Reliability",
      description: "Ensure your software works flawlessly in all scenarios"
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Faster Delivery",
      description: "Automated testing accelerates development cycles"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Enhanced Security",
      description: "Identify and fix security vulnerabilities early"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Cost Reduction",
      description: "Prevent expensive bugs and issues in production"
    }
  ];

  const tools = [
    { name: "Selenium", category: "Web Testing" },
    { name: "Jest", category: "Unit Testing" },
    { name: "Cypress", category: "E2E Testing" },
    { name: "JMeter", category: "Performance" },
    { name: "Postman", category: "API Testing" },
    { name: "Appium", category: "Mobile Testing" },
    { name: "SonarQube", category: "Code Quality" },
    { name: "OWASP ZAP", category: "Security" },
    { name: "LoadRunner", category: "Load Testing" },
    { name: "TestNG", category: "Framework" },
    { name: "Katalon", category: "Automation" },
    { name: "Burp Suite", category: "Security" }
  ];

  const handleGetStartedClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      requirements: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'sales@goaiz.com',
          subject: 'Software Quality Engineering Inquiry from Go AIz Website'
        })
      });

      if (response.ok) {
        alert('Thank you! Your inquiry has been sent successfully. We will get back to you soon.');
        handleCloseModal();
      } else {
        alert('There was an error sending your inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error sending your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center space-x-3">
              <Link to="/" className="h-20 overflow-hidden flex items-center hover:opacity-80 transition-opacity">
                <img 
                  src="/logo.png?v=2" 
                  alt="Go Alz Technologies Logo" 
                  className="w-auto h-40 object-contain cursor-pointer"
                  aria-label="Go Alz Technologies Logo"
                />
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about-us"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-25 animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-gradient-to-r from-red-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Software Quality Engineering
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Ensure Software{' '}
                <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  Quality & Reliability
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We provide comprehensive quality assurance and testing services to ensure 
                your software meets the highest standards of reliability, performance, and security.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleGetStartedClick}
                  className="group bg-gradient-to-r from-red-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:from-red-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span>Get Started Today</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">99.9%</div>
                  <div className="text-sm text-gray-600">Bug Detection Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50%</div>
                  <div className="text-sm text-gray-600">Faster Testing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">100%</div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>
            </div>
            
            {/* Right side - Quality illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <TestTube className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Testing</h3>
                    <p className="text-red-100 text-sm">Automated</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Security</h3>
                    <p className="text-purple-100 text-sm">Protected</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Performance</h3>
                    <p className="text-pink-100 text-sm">Optimized</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Quality</h3>
                    <p className="text-green-100 text-sm">Assured</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-200 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-15 animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-red-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Our Quality Engineering Services
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Testing Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From automated testing to security audits, we ensure your software meets the highest quality standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform" style={{ transitionDelay: `${featureIndex * 75}ms` }}>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Testing Tools & Technologies</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We use industry-leading tools and technologies to deliver comprehensive testing solutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TestTube className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tool.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-red-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Quality Engineering?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of professional quality assurance and testing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Quality Assurance Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A systematic approach to ensuring software quality and reliability
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Define testing strategy, scope, and requirements
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Create test cases and automation frameworks
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Execution</h3>
              <p className="text-gray-600 leading-relaxed">
                Run tests and identify issues
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Document results and provide recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-purple-900 to-pink-900"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-red-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-red-100 to-purple-100 bg-clip-text text-transparent">
              Ready to Ensure Quality?
            </h2>
            <p className="text-gray-200 mb-8 text-xl leading-relaxed max-w-3xl mx-auto">
              Let's discuss how we can improve the quality and reliability of your software.
            </p>
            <button 
              onClick={handleGetStartedClick}
              className="bg-gradient-to-r from-red-500 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-red-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/25"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Shield className="h-8 w-8 text-red-400 mr-2" />
                <h3 className="text-xl font-bold">Go AIz Technologies</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering businesses with innovative quality engineering solutions and digital transformation.
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/software-engineering" className="hover:text-white transition-colors">
                    Software Engineering
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center justify-center md:justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href="mailto:sales@goaiz.com" className="hover:text-white transition-colors">
                    sales@goaiz.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Automated Testing</li>
                <li>Quality Assurance</li>
                <li>Performance Testing</li>
                <li>Security Testing</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              &copy; 2025 Go AIz Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Quality Engineering Quote</h2>
              <p className="text-gray-600">Tell us about your testing requirements</p>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testing Requirements *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Describe your testing needs, application type, and quality goals..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareQualityEngineering; 
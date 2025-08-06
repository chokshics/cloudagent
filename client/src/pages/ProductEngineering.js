import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
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
  Palette,
  Target,
  Users
} from 'lucide-react';

const ProductEngineering = () => {
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
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Product Strategy & Planning",
      description: "Comprehensive product strategy from ideation to market launch",
      features: ["Market research", "Competitive analysis", "Product roadmap", "Go-to-market strategy"]
    },
    {
      icon: <Palette className="w-8 h-8 text-white" />,
      title: "UX/UI Design",
      description: "User-centered design that creates engaging and intuitive experiences",
      features: ["User research", "Wireframing & prototyping", "Visual design", "Usability testing"]
    },
    {
      icon: <Package className="w-8 h-8 text-white" />,
      title: "MVP Development",
      description: "Rapid development of minimum viable products to validate ideas",
      features: ["Quick prototyping", "Core features", "User feedback", "Iterative development"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Scalability Planning",
      description: "Architect solutions that grow with your business needs",
      features: ["System architecture", "Performance optimization", "Load balancing", "Future-proofing"]
    }
  ];

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "User-Centered Design",
      description: "Products designed with real user needs and behaviors in mind"
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Rapid Development",
      description: "Fast iteration cycles to get your product to market quickly"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Quality Assurance",
      description: "Rigorous testing and quality control throughout development"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Agile Methodology",
      description: "Flexible development process that adapts to changing requirements"
    }
  ];

  const phases = [
    { name: "Discovery", description: "Research and requirements gathering" },
    { name: "Design", description: "UX/UI design and prototyping" },
    { name: "Development", description: "Agile development and testing" },
    { name: "Launch", description: "Deployment and go-to-market" },
    { name: "Optimization", description: "Continuous improvement and scaling" }
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
          subject: 'Product Engineering Inquiry from Go AIz Website'
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
      <section className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-red-200 rounded-full opacity-25 animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Product Engineering
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Build Products That{' '}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Users Love
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We help you create innovative products from concept to launch, 
                focusing on user experience, market fit, and scalable architecture.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleGetStartedClick}
                  className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span>Get Started Today</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">50+</div>
                  <div className="text-sm text-gray-600">Products Launched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">95%</div>
                  <div className="text-sm text-gray-600">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">3x</div>
                  <div className="text-sm text-gray-600">Faster Time to Market</div>
                </div>
              </div>
            </div>
            
            {/* Right side - Product illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Strategy</h3>
                    <p className="text-orange-100 text-sm">Planning</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <Palette className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Design</h3>
                    <p className="text-yellow-100 text-sm">UX/UI</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <Package className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">MVP</h3>
                    <p className="text-red-100 text-sm">Development</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">Scale</h3>
                    <p className="text-green-100 text-sm">Growth</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-red-200 rounded-full opacity-15 animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Our Product Engineering Services
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">End-to-End Product Development</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From ideation to launch, we handle every aspect of product development
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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

      {/* Process Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Product Development Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology for bringing successful products to market
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8">
            {phases.map((phase, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{phase.name}</h3>
                <p className="text-gray-600 leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Product Engineering?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of professional product development and engineering
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-red-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
              Ready to Build Your Product?
            </h2>
            <p className="text-gray-200 mb-8 text-xl leading-relaxed max-w-3xl mx-auto">
              Let's discuss how we can create innovative products that users love.
            </p>
            <button 
              onClick={handleGetStartedClick}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25"
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
                <Shield className="h-8 w-8 text-orange-400 mr-2" />
                <h3 className="text-xl font-bold">Go AIz Technologies</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering businesses with innovative product solutions and digital transformation.
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
                <li>Product Strategy</li>
                <li>UX/UI Design</li>
                <li>MVP Development</li>
                <li>Scalability Planning</li>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Product Engineering Quote</h2>
              <p className="text-gray-600">Tell us about your product requirements</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Requirements *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Describe your product idea, target audience, and key features..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default ProductEngineering; 
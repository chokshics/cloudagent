import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Cloud, 
  Settings, 
  Package, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Clock, 
  Globe, 
  Award,
  Mail,
  MapPin,
  X,
  Shield
} from 'lucide-react';

const NewHomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      icon: <Code className="h-12 w-12 text-blue-600" />,
      title: "Software Engineering",
      description: "Custom software development with modern technologies and best practices",
      features: ["Full-stack development", "API integration", "Database design", "Performance optimization"]
    },
    {
      icon: <Cloud className="h-12 w-12 text-green-600" />,
      title: "Cloud Solutions & Support",
      description: "Comprehensive cloud infrastructure and managed services",
      features: ["AWS/Azure management", "Cloud migration", "24/7 monitoring", "Cost optimization"]
    },
    {
      icon: <Settings className="h-12 w-12 text-purple-600" />,
      title: "DevOps Consulting",
      description: "Streamline your development and operations with modern DevOps practices",
      features: ["CI/CD pipelines", "Infrastructure as Code", "Container orchestration", "Automation"]
    },
    {
      icon: <Package className="h-12 w-12 text-orange-600" />,
      title: "Product Engineering",
      description: "End-to-end product development from concept to deployment",
      features: ["Product strategy", "UX/UI design", "MVP development", "Scalability planning"]
    },
    {
      icon: <Building2 className="h-12 w-12 text-red-600" />,
      title: "Building New Software",
      description: "Turn your ideas into powerful, scalable software solutions",
      features: ["Custom applications", "Web platforms", "Mobile apps", "Enterprise solutions"]
    }
  ];

  const stats = [
    { number: "50+", label: "Projects Delivered" },
    { number: "1000+", label: "Development Hours" },
    { number: "15+", label: "Technologies Mastered" },
    { number: "10+", label: "Years Experience" },
    { number: "25+", label: "Happy Clients" }
  ];

  const handleMerchantsProClick = () => {
    navigate('/merchantspro');
  };

  const handleGetStartedClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
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
      // Send email using the backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'sales@goaiz.com',
          subject: 'New Project Inquiry from Go AIz Website'
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Go AIz Technologies</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleMerchantsProClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Merchants Pro</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

             {/* Hero Section */}
       <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
         {/* Background decorative elements */}
         <div className="absolute inset-0">
           <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
           <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
           <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-ping"></div>
           <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-blue-300 rounded-full opacity-15 animate-pulse"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             {/* Left side - Text content */}
             <div className="text-left">
                               <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  Trusted by Global Businesses
                </div>
               
               <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                 Digital IT Partner for Your{' '}
                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   Business
                 </span>
               </h1>
               
               <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                 Looking for <span className="font-semibold text-blue-600">Digital Transformation</span> of your business? 
                 We provide comprehensive software engineering, cloud solutions, DevOps consulting, and product development 
                 services to help your business grow.
               </p>
               
                               <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button 
                    onClick={handleGetStartedClick}
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <span>Get Started Today</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

               </div>
               
                               {/* Stats row */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10+</div>
                    <div className="text-sm text-gray-600">Years of Software Engineering Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1000+</div>
                    <div className="text-sm text-gray-600">Hours of Work Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
             </div>
             
             {/* Right side - Image/Illustration */}
             <div className="relative">
               <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                     <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                       <Code className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold mb-1">Software Engineering</h3>
                     <p className="text-blue-100 text-sm">Custom solutions</p>
                   </div>
                   <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                     <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                       <Cloud className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold mb-1">Cloud Solutions</h3>
                     <p className="text-green-100 text-sm">Scalable infrastructure</p>
                   </div>
                   <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                     <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                       <Settings className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold mb-1">DevOps</h3>
                     <p className="text-purple-100 text-sm">Automation & CI/CD</p>
                   </div>
                   <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                     <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                       <Package className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold mb-1">Product Engineering</h3>
                     <p className="text-orange-100 text-sm">End-to-end development</p>
                   </div>
                 </div>
               </div>
               
               {/* Floating elements */}
               <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80 animate-bounce"></div>
               <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
               
               {/* Decorative lines */}
               <div className="absolute top-1/2 left-0 w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-y-1/2 -translate-x-8"></div>
               <div className="absolute bottom-1/2 right-0 w-32 h-1 bg-gradient-to-r from-purple-400 to-pink-400 transform translate-y-1/2 translate-x-8"></div>
             </div>
           </div>
         </div>
       </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-15 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Our Core Services
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive digital solutions to help your business thrive in the modern world
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Software Engineering */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Software Engineering</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Custom software development with modern technologies and best practices
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Full-stack development</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">API integration</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Database design</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Performance optimization</span>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* Cloud Solutions */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cloud Solutions & Support</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive cloud infrastructure and managed services
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">AWS/Azure management</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Cloud migration</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">24/7 monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Cost optimization</span>
                  </div>
                </div>
                <div className="flex items-center text-green-600 font-semibold text-sm">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* DevOps Consulting */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">DevOps Consulting</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Streamline your development and operations with modern DevOps practices
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">CI/CD pipelines</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Infrastructure as Code</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Container orchestration</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Automation</span>
                  </div>
                </div>
                <div className="flex items-center text-purple-600 font-semibold text-sm">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* Product Engineering */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Engineering</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  End-to-end product development from concept to deployment
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Product strategy</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">UX/UI design</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">MVP development</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Scalability planning</span>
                  </div>
                </div>
                <div className="flex items-center text-orange-600 font-semibold text-sm">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* Building New Software */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Building New Software</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Turn your ideas into powerful, scalable software solutions
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Custom applications</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Web platforms</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Mobile apps</span>
                  </div>
                  <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Enterprise solutions</span>
                  </div>
                </div>
                <div className="flex items-center text-red-600 font-semibold text-sm">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Amazing Accomplishments</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

             {/* Engagement Models */}
       <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
         {/* Background decorative elements */}
         <div className="absolute inset-0">
           <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
           <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-15 animate-bounce"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16">
             <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
               <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
               Flexible Engagement Models
             </div>
             <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Engagement, Competitive Pricing</h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
               Choose the engagement model that best fits your project requirements and budget
             </p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Users className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Dedicated Teams</h3>
                 <p className="text-gray-600 mb-4 leading-relaxed">
                   Setup dedicated delivery team of developers, QA, Website Designer, BA and project managers
                 </p>
                 <div className="flex items-center text-blue-600 font-semibold text-sm">
                   <span>Learn More</span>
                   <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
             </div>
             
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Clock className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Time & Material</h3>
                 <p className="text-gray-600 mb-4 leading-relaxed">
                   Collaborative model when there is uncertainty about scope and time of the project
                 </p>
                 <div className="flex items-center text-green-600 font-semibold text-sm">
                   <span>Learn More</span>
                   <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
             </div>
             
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Award className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Fixed Price</h3>
                 <p className="text-gray-600 mb-4 leading-relaxed">
                   When you have fixed budget and detailed requirements, this model is more effective
                 </p>
                 <div className="flex items-center text-purple-600 font-semibold text-sm">
                   <span>Learn More</span>
                   <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
             </div>
             
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Settings className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Managed Services</h3>
                 <p className="text-gray-600 mb-4 leading-relaxed">
                   Long-term project with frequently changing requirements, schedule and timeline
                 </p>
                 <div className="flex items-center text-orange-600 font-semibold text-sm">
                   <span>Learn More</span>
                   <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
             </div>
           </div>
           
           <div className="text-center mt-16">
             <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
               <h3 className="text-2xl font-bold text-gray-900 mb-4">Not Sure Which Model Fits?</h3>
               <p className="text-gray-600 mb-6">
                 Are you not sure which model will suite to your project or need more information?
               </p>
               <div className="flex items-center justify-center space-x-4">
                 <Mail className="w-5 h-5 text-blue-600" />
                 <span className="text-blue-600 font-semibold">sales@goaiz.com</span>
               </div>
             </div>
           </div>
         </div>
       </section>

             {/* Industries Section */}
       <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
         {/* Background decorative elements */}
         <div className="absolute inset-0">
           <div className="absolute top-10 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
           <div className="absolute bottom-10 right-10 w-20 h-20 bg-purple-200 rounded-full opacity-15 animate-bounce"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16">
             <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
               <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
               Cross-Industry Expertise
             </div>
             <h2 className="text-4xl font-bold text-gray-900 mb-4">Industries We Work With</h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
               We have successfully delivered solutions across diverse industries, understanding unique challenges and requirements
             </p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Technology & Innovation */}
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
               <div className="flex items-center mb-6">
                 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                   <Code className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Technology & Innovation</h3>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                   <span className="text-gray-700">Startups</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                   <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                   <span className="text-gray-700">Software Engineering</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                   <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                   <span className="text-gray-700">AI Products</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                   <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                   <span className="text-gray-700">Gaming</span>
                 </div>
               </div>
             </div>
             
             {/* Business & Commerce */}
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
               <div className="flex items-center mb-6">
                 <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                   <Building2 className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Business & Commerce</h3>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                   <span className="text-gray-700">e-Commerce</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                   <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                   <span className="text-gray-700">Retail</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                   <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                   <span className="text-gray-700">Manufacturing</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                   <span className="text-gray-700">Information Management</span>
                 </div>
               </div>
             </div>
             
             {/* Healthcare & Life Sciences */}
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
               <div className="flex items-center mb-6">
                 <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                   <Shield className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Healthcare & Life Sciences</h3>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                   <span className="text-gray-700">Healthcare</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                   <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                   <span className="text-gray-700">Education</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                   <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                   <span className="text-gray-700">Telecommunication</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                   <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                   <span className="text-gray-700">Entertainment</span>
                 </div>
               </div>
             </div>
             
             {/* Transportation & Mobility */}
             <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
               <div className="flex items-center mb-6">
                 <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                   <Globe className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Transportation & Mobility</h3>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform">
                   <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                   <span className="text-gray-700">Automobile</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-75">
                   <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                   <span className="text-gray-700">Travel & Leisure</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-100">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                   <span className="text-gray-700">Logistics</span>
                 </div>
                 <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform delay-150">
                   <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                   <span className="text-gray-700">Supply Chain</span>
                 </div>
               </div>
             </div>
           </div>
           

         </div>
       </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">GET IN TOUCH</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Go AIz Technologies</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span>Vadodara, Gujarat, India - 390020</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>Email: sales@goaiz.com</span>
                </div>

              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-4">
                Ready to transform your business? Let's discuss your project requirements.
              </p>
              <button 
                onClick={handleGetStartedClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Start Your Project
              </button>
            </div>
          </div>
        </div>
      </section>

             {/* Footer */}
       <footer className="bg-gray-800 text-white py-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <p>&copy; 2025 by Go AIz Technologies. All rights reserved.</p>
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
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started Today</h2>
               <p className="text-gray-600">Tell us about your project requirements</p>
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
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="your.email@example.com"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Your Requirements *
                 </label>
                 <textarea
                   name="requirements"
                   value={formData.requirements}
                   onChange={handleInputChange}
                   required
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                   placeholder="Describe your project requirements, timeline, and any specific needs..."
                 />
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default NewHomePage; 
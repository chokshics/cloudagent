import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  Lightbulb, 
  Shield, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';

const AboutUs = () => {
  const coreValues = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Innovation Excellence",
      description: "We push the boundaries of technology to deliver cutting-edge solutions that drive business transformation and competitive advantage."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Client-Centric Approach",
      description: "Your success is our priority. We build lasting partnerships through transparent communication, collaborative development, and unwavering commitment to your goals."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Quality & Reliability",
      description: "We maintain the highest standards of quality in every project, ensuring robust, scalable, and maintainable solutions that stand the test of time."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Team Excellence",
      description: "Our diverse team of experts brings together deep technical expertise, creative problem-solving, and industry best practices to deliver exceptional results."
    },
    {
      icon: <Globe className="w-8 h-8 text-orange-600" />,
      title: "Global Perspective",
      description: "We embrace diversity and global thinking, bringing international best practices and innovative approaches to solve complex business challenges."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-indigo-600" />,
      title: "Continuous Learning",
      description: "We stay ahead of technology trends through continuous learning, research, and adoption of emerging technologies to provide future-ready solutions."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Journey Started",
      description: "Started with a vision to transform businesses through innovative technology solutions"
    },
    {
      year: "2024",
      title: "First Major Project",
      description: "Successfully delivered our first enterprise-level software solution"
    },
    {
      year: "2024",
      title: "Cloud Expertise",
      description: "Expanded services to include comprehensive cloud solutions and DevOps consulting"
    },
    {
      year: "2025",
      title: "AI Integration",
      description: "Began incorporating AI and machine learning capabilities into our solutions"
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Serving clients across multiple continents with diverse technology needs"
    }
  ];



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
                to="/merchantspro"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Merchants Pro</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              About Go AIz Technologies
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Businesses Through{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Innovation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We are a forward-thinking technology company dedicated to transforming businesses through innovative software solutions, 
              cloud infrastructure, and cutting-edge AI technologies. Our mission is to empower organizations to thrive in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To accelerate digital transformation for businesses worldwide by delivering innovative, scalable, and reliable technology solutions 
                that drive growth, efficiency, and competitive advantage in an ever-evolving digital landscape.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Deliver cutting-edge software solutions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Enable cloud-first digital transformation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Foster innovation through AI and emerging technologies</span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 lg:p-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To be the leading technology partner that businesses trust to navigate their digital journey, 
                creating a future where technology seamlessly enhances human potential and drives sustainable growth.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Become the preferred technology partner globally</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Pioneer next-generation technology solutions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Create sustainable digital transformation impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Our Core Values
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Drives Us Forward</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our values are the foundation of everything we do, guiding our decisions and shaping our culture
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Our Journey
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Milestones That Define Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a trusted technology partner
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="relative z-10 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Shield className="h-8 w-8 text-blue-400 mr-2" />
                <h3 className="text-xl font-bold">Go AIz Technologies</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering businesses with innovative software solutions and digital transformation.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/merchantspro" className="hover:text-white transition-colors">
                    Merchants Pro
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="mailto:sales@goaiz.com" className="hover:text-white transition-colors">
                    sales@goaiz.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              &copy; 2025 Go AIz Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs; 
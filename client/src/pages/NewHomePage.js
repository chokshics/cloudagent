import React from 'react';
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
  Phone,
  MapPin
} from 'lucide-react';

const NewHomePage = () => {
  const navigate = useNavigate();

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
    { number: "5+", label: "Years Experience" },
    { number: "25+", label: "Happy Clients" }
  ];

  const handleMerchantsProClick = () => {
    navigate('/merchantspro');
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
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Digital IT Partner for Your Business
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Looking for Digital Transformation of your business? We provide comprehensive software engineering, 
              cloud solutions, DevOps consulting, and product development services to help your business grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Contact Us
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive digital solutions to help your business thrive in the modern world
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Engagement, Competitive Pricing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Dedicated Teams</h3>
              <p className="text-gray-600 mb-4">
                Setup dedicated delivery team of developers, QA, Website Designer, BA and project managers
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Time & Material</h3>
              <p className="text-gray-600 mb-4">
                Collaborative model when there is uncertainty about scope and time of the project
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fixed Price</h3>
              <p className="text-gray-600 mb-4">
                When you have fixed budget and detailed requirements, this model is more effective
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Managed Services</h3>
              <p className="text-gray-600 mb-4">
                Long-term project with frequently changing requirements, schedule and timeline
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Are you not sure which model will suite to your project or need more information?
            </p>
            <p className="text-blue-600 font-semibold">Please drop a line to us at sales@goaiz.com</p>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Industries We Work With</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">Startups</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">Software Engineering</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Manufacturing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span className="text-gray-700">AI Products</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Retail</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-gray-700">Healthcare</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                <span className="text-gray-700">Automobile</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">e-Commerce</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">Gaming</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Education</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span className="text-gray-700">Entertainment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Travel & Leisure</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-gray-700">Information Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                <span className="text-gray-700">Telecommunication</span>
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
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span>Phone: +91-9876543210</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-4">
                Ready to transform your business? Let's discuss your project requirements.
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
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
    </div>
  );
};

export default NewHomePage; 
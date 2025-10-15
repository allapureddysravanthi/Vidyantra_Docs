import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { 
  CreditCard, 
  Link, 
  Smartphone, 
  Monitor, 
  Code, 
  Webhook, 
  BookOpen, 
  AlertTriangle,
  Play,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Clock,
  Headphones,
  FileText,
  Database,
  Lock,
  Cloud,
  Smartphone as Mobile,
  Laptop,
  Server
} from 'lucide-react';

const Home = () => {
  const { isDark } = useTheme();
  const { setActiveTab, setShowNavbarSearch, searchValue, setSearchValue } = useNavigation();

  // Set active tab to Home when component mounts
  useEffect(() => {
    setActiveTab("Home");
    // Hide navbar search initially on home page
    setShowNavbarSearch(false);
  }, [setActiveTab, setShowNavbarSearch]);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = (event) => {
      const scrollTop = event.target.scrollTop;
      // Show navbar search when scrolled down more than 100px
      setShowNavbarSearch(scrollTop > 100);
    };

    // Try to find the scroll container with multiple approaches
    const setupScrollListener = () => {
      // Try different selectors in order of preference
      const selectors = [
        '.flex-1.overflow-y-auto', // Most specific
        '.overflow-y-auto', // General
        '[class*="overflow-y-auto"]' // Partial match
      ];

      for (const selector of selectors) {
        const container = document.querySelector(selector);
        if (container) {
          container.addEventListener('scroll', handleScroll);
          return () => container.removeEventListener('scroll', handleScroll);
        }
      }
      
      // Fallback to window scroll if no container found
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    };

    // Try immediately
    let cleanup = setupScrollListener();
    
    // If no container found, try again after a delay
    if (!cleanup) {
      const timer = setTimeout(() => {
        cleanup = setupScrollListener();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (cleanup) cleanup();
      };
    }

    return cleanup;
  }, [setShowNavbarSearch]);

  const platformFeatures = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Organization Management",
      description: "Seamlessly manage multiple educational institutions, organizations, and branches from a single platform",
      features: ["Centralized Dashboard", "Role-based Access", "Bulk Operations", "Custom Workflows"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics & Reporting",
      description: "Comprehensive insights and real-time analytics to drive data-driven decisions",
      features: ["Real-time Dashboards", "Custom Reports", "Performance Metrics", "Predictive Analytics"]
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Flexible Configuration",
      description: "Highly customizable platform that adapts to your unique organizational needs",
      features: ["Custom Fields", "Workflow Automation", "Integration APIs", "White-label Options"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade security with compliance standards to protect your data",
      features: ["Data Encryption", "GDPR Compliance", "Audit Trails", "Multi-factor Auth"]
    }
  ];

  const integrationOptions = [
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Web Applications",
      description: "Seamless integration with modern web frameworks and technologies"
    },
    {
      icon: <Mobile className="w-6 h-6" />,
      title: "Mobile Apps",
      description: "Native iOS and Android SDKs with cross-platform support"
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Backend Systems",
      description: "RESTful APIs and webhooks for enterprise system integration"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Integration",
      description: "Connect with existing databases and third-party services"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Services",
      description: "Integration with AWS, Azure, and other cloud platforms"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Custom Solutions",
      description: "Tailored integration solutions for unique business requirements"
    }
  ];

  const developerTools = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Documentation",
      description: "Detailed API documentation with interactive examples and code snippets",
      link: "Explore Docs"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "SDKs & Libraries",
      description: "Language-specific SDKs for JavaScript, Python, PHP, and mobile platforms",
      link: "Download SDKs"
    },
    {
      icon: <Webhook className="w-8 h-8" />,
      title: "Webhooks & Events",
      description: "Real-time notifications and event-driven architecture for seamless integration",
      link: "Configure Webhooks"
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Sample Applications",
      description: "Ready-to-use sample applications and integration examples",
      link: "View Examples"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Developer Support",
      description: "Dedicated technical support and community forums for developers",
      link: "Get Support"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Best Practices",
      description: "Guidelines and best practices for optimal platform implementation",
      link: "Read Guide"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "IT Director",
      organization: "Metro University",
      content: "Vidyantra has transformed how we manage our multi-campus operations. The platform's flexibility and robust analytics have been game-changers.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      organization: "Global Education Group",
      content: "The integration capabilities are outstanding. We connected all our existing systems within days, not months.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "System Administrator",
      organization: "Tech Institute",
      content: "The security features and compliance standards give us complete confidence in handling sensitive educational data.",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Organizations Served" },
    { number: "1M+", label: "Users Managed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className={`min-h-full transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className={`py-8 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-16 mt-16">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to Vidyantra Documentation            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Streamline operations, enhance collaboration, and scale your educational institution with our comprehensive platform designed for modern organizations.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className={`w-full px-6 py-4 pl-12 rounded-lg border transition-colors duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats-section" className={`py-12 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 transition-colors duration-200 ${
                  isDark ? 'text-[#DE5E08]' : 'text-[#DE5E08]'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm md:text-base transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div id="features-section" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Powerful Platform Features
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to manage, scale, and optimize your educational operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {platformFeatures.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl border transition-colors duration-200 hover:shadow-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                    : 'bg-white border-gray-200 hover:border-[#DE5E08]'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700 text-[#DE5E08]' : 'bg-gray-100 text-[#DE5E08]'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`mb-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Section */}
      <div id="integration-section" className={`py-16 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Seamless Integration Options
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Connect with your existing systems and workflows through our comprehensive integration ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationOptions.map((option, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border text-center transition-colors duration-200 hover:shadow-lg ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 hover:border-[#DE5E08]' 
                    : 'bg-white border-gray-200 hover:border-[#DE5E08]'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-600 text-[#DE5E08]' : 'bg-gray-100 text-[#DE5E08]'
                }`}>
                  {option.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {option.title}
                </h3>
                <p className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials-section" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Trusted by Leading Organizations
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              See what our customers say about their experience with Vidyantra
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`text-sm mb-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  "{testimonial.content}"
                </p>
                <div>
                  <div className={`font-semibold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {testimonial.name}
                  </div>
                  <div className={`text-sm transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {testimonial.role}, {testimonial.organization}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Tools Section */}
      <div id="developer-tools-section" className={`py-16 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Developer Resources
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything developers need to build powerful integrations and custom solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerTools.map((tool, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border transition-colors duration-200 hover:shadow-lg ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 hover:border-[#DE5E08]' 
                    : 'bg-white border-gray-200 hover:border-[#DE5E08]'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-600 text-[#DE5E08]' : 'bg-gray-100 text-[#DE5E08]'
                }`}>
                  {tool.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {tool.title}
                </h3>
                <p className={`text-sm mb-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {tool.description}
                </p>
                <a
                  href="#"
                  className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                    isDark ? 'text-[#DE5E08] hover:text-[#c54d07]' : 'text-[#DE5E08] hover:text-[#c54d07]'
                  }`}
                >
                  {tool.link}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div id="benefits-section" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Vidyantra?
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Built for modern educational institutions with enterprise-grade features and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full mb-6 transition-colors duration-200 ${
                isDark ? 'bg-gray-800 text-[#DE5E08] border border-gray-700' : 'bg-white text-[#DE5E08] border border-gray-200'
              }`}>
                <Zap className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Rapid Deployment
              </h3>
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Get up and running in days, not months. Our streamlined onboarding process gets you operational quickly.
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full mb-6 transition-colors duration-200 ${
                isDark ? 'bg-gray-800 text-[#DE5E08] border border-gray-700' : 'bg-white text-[#DE5E08] border border-gray-200'
              }`}>
                <Shield className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Enterprise Security
              </h3>
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Bank-grade security with SOC 2 compliance, data encryption, and 99.9% uptime guarantee.
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full mb-6 transition-colors duration-200 ${
                isDark ? 'bg-gray-800 text-[#DE5E08] border border-gray-700' : 'bg-white text-[#DE5E08] border border-gray-200'
              }`}>
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Scalable Architecture
              </h3>
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Built to scale with your organization. Handle thousands of users and complex workflows effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta-section" className={`py-16 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Transform Your Organization?
          </h2>
          <p className={`text-lg md:text-xl mb-8 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join hundreds of organizations already using Vidyantra to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${
              isDark 
                ? 'bg-[#DE5E08] text-white hover:bg-[#c54d07]' 
                : 'bg-[#DE5E08] text-white hover:bg-[#c54d07]'
            }`}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
            <button className={`px-8 py-3 rounded-lg font-semibold border transition-colors duration-200 ${
              isDark 
                ? 'border-gray-600 text-white hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

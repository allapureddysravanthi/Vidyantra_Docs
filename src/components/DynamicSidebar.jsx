import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicSidebar, getAdminSidebar } from '../lib/api/documentation.api';
import { useAuth } from '../hooks/useAuth';
import {
  ChevronDown,
  ChevronRight,
  Home,
  Monitor,
  Building2,
  GitBranch,
  Loader2
} from "lucide-react";

const DynamicSidebar = ({ showRightPanel = false }) => {
  const [openSections, setOpenSections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarData, setSidebarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, hasPermission } = useAuth();

  // Determine current scope from URL
  const getCurrentScope = () => {
    const path = location.pathname;
    if (path.startsWith('/platform')) return 'platform';
    if (path.startsWith('/organization')) return 'organization';
    if (path.startsWith('/branch')) return 'branch';
    return 'organization'; // default
  };

  const currentScope = getCurrentScope();

  useEffect(() => {
    loadSidebarData();
  }, [currentScope, isAuthenticated]);

  async function loadSidebarData() {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      
      if (currentScope === 'platform' && isAuthenticated && hasPermission('platform.documentation.view')) {
        // Load admin sidebar for platform
        data = await getAdminSidebar();
      } else {
        // Load public sidebar for org/branch or when not authenticated
        data = await getPublicSidebar(currentScope);
      }
      
      setSidebarData(data.data);
      
      // Auto-expand first section
      if (data.data && data.data.length > 0) {
        setOpenSections([data.data[0].title]);
      }
    } catch (error) {
      console.error('Failed to load sidebar:', error);
      setError(error.message);
      // Fallback to static data
      setSidebarData(getFallbackSidebarData());
    } finally {
      setLoading(false);
    }
  }

  const getFallbackSidebarData = () => {
    // Fallback static data when API fails
    return [
      {
        title: "Getting Started",
        items: [
          { title: "Introduction", slug: "introduction", type: "article" },
          { title: "Quick Setup", slug: "quick-setup", type: "tutorial" },
          { title: "First Steps", slug: "first-steps", type: "guide" }
        ]
      },
      {
        title: "User Management",
        items: [
          { title: "Adding Users", slug: "adding-users", type: "article" },
          { title: "Permissions", slug: "permissions", type: "guide" },
          { title: "Roles", slug: "roles", type: "article" }
        ]
      }
    ];
  };

  const toggleSection = (label) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(section => section !== label)
        : [...prev, label]
    );
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    navigate(`/${currentScope}/doc/${item.slug}`);
  };

  // Left navigation tabs
  const tabs = [
    {
      icon: <Monitor size={20} />,
      label: "Platform",
      path: "/platform"
    },
    {
      icon: <Building2 size={20} />,
      label: "Organization",
      path: "/organization"
    },
    {
      icon: <GitBranch size={20} />,
      label: "Branch",
      path: "/branch"
    },
  ];

  const shouldShowRightPanel = location.pathname !== "/";

  if (loading) {
    return (
      <div className={`flex h-screen text-white font-sans transition-colors duration-200 ${
        shouldShowRightPanel ? 'w-full' : 'w-[100px]'
      }`}>
        {/* Left Tab Bar */}
        <div className="w-[100px] bg-gray-900 flex flex-col items-center py-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`p-3 rounded-lg transition-colors ${
                location.pathname.startsWith(tab.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Loading Content */}
        {shouldShowRightPanel && (
          <div className="flex-1 bg-gray-800 p-4">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-gray-400">Loading sidebar...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen text-white font-sans transition-colors duration-200 ${
        shouldShowRightPanel ? 'w-full' : 'w-[100px]'
      }`}>
        {/* Left Tab Bar */}
        <div className="w-[100px] bg-gray-900 flex flex-col items-center py-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`p-3 rounded-lg transition-colors ${
                location.pathname.startsWith(tab.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Error Content */}
        {shouldShowRightPanel && (
          <div className="flex-1 bg-gray-800 p-4">
            <div className="text-center">
              <p className="text-red-400 mb-2">Failed to load sidebar</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={loadSidebarData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-screen text-white font-sans transition-colors duration-200 ${
      shouldShowRightPanel ? 'w-full' : 'w-[100px]'
    }`}>
      {/* Left Tab Bar - Always visible */}
      <div className="w-[100px] bg-gray-900 flex flex-col items-center py-4 space-y-4">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className={`p-3 rounded-lg transition-colors ${
            location.pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title="Home"
        >
          <Home size={20} />
        </button>

        {/* Scope Tabs */}
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className={`p-3 rounded-lg transition-colors ${
              location.pathname.startsWith(tab.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Sidebar Content - Only show when right panel is visible */}
      {shouldShowRightPanel && sidebarData && (
        <div className="flex-1 bg-gray-800 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                {currentScope.charAt(0).toUpperCase() + currentScope.slice(1)} Documentation
              </h2>
              <p className="text-sm text-gray-400">
                {isAuthenticated && hasPermission('platform.documentation.view') 
                  ? 'Admin View' 
                  : 'Public View'
                }
              </p>
            </div>

            <div className="space-y-2">
              {sidebarData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-white">{section.title}</span>
                    {openSections.includes(section.title) ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {openSections.includes(section.title) && (
                    <div className="ml-4 space-y-1">
                      {section.items?.map((item, itemIndex) => (
                        <button
                          key={itemIndex}
                          onClick={() => handleItemClick(item)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            selectedItem?.slug === item.slug
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.title}</span>
                            {item.type && (
                              <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                                {item.type}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/${currentScope}/search`)}
                  className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  🔍 Search Documentation
                </button>
                {isAuthenticated && hasPermission('platform.documentation.create') && (
                  <button
                    onClick={() => navigate('/admin/create')}
                    className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ➕ Create Article
                  </button>
                )}
                {isAuthenticated && hasPermission('platform.documentation.view') && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ⚙️ Admin Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSidebar;

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Monitor,
  Building2,
  GitBranch,
  Loader2,
  AlertCircle,
  Edit3,
  Search,
  X,
  Menu,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebarData } from "../hooks/useSidebarData";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({ showRightPanel = false }) => {
  const [openSections, setOpenSections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab, isSidebarOpen, toggleSidebar } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarData, loading, error } = useSidebarData();
  const { isAuthenticated, hasPermission } = useAuth();

  const toggleSection = (label) => {
    setOpenSections(prev => 
      prev.includes(label) 
        ? prev.filter(section => section !== label)
        : [...prev, label]
    );
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleArticleClick = (article) => {
    console.log('Article clicked:', article);
    console.log('Current location:', location.pathname);
    
    // Set the selected item for highlighting
    setSelectedItem(article.id);
    
    // Close mobile menu when article is clicked
    setIsMobileMenuOpen(false);
    
    if (article.url && article.url.includes('docs.vidyantra-dev.com')) {
      // For external documentation URLs, open in new tab
      console.log('Opening external URL:', article.url);
      window.open(article.url, '_blank');
    } else if (article.id) {
      // For internal navigation using article ID
      const scope = location.pathname.split('/')[1];
      const targetUrl = `/${scope}/article/${article.id}`;
      console.log('Navigating to article by ID:', targetUrl);
      navigate(targetUrl);
    } else if (article.slug) {
      // Fallback to slug-based navigation
      const scope = location.pathname.split('/')[1];
      const targetUrl = `/${scope}/doc/${article.slug}`;
      console.log('Navigating to article by slug:', targetUrl);
      navigate(targetUrl);
    } else {
      console.error('Article has no id, slug, or external URL:', article);
    }
  };

  // Get current article ID from URL to highlight active item
  const getCurrentArticleId = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[2] === 'article' && pathParts[3]) {
      return pathParts[3]; // Extract article ID from /scope/article/id
    }
    return null;
  };

  // Get article scope from URL parameters or article data
  const getArticleScope = () => {
    const path = location.pathname;
    
    // For article pages, try to determine the actual article scope
    if (path.includes('/article/')) {
      // Extract article ID from URL
      const pathParts = path.split('/');
      const articleId = pathParts[pathParts.length - 1];
      
      // Use a simple mapping based on article ID patterns
      if (articleId.includes('organization') || articleId === 'art-organization-setup') {
        return 'organization';
      } else if (articleId.includes('branch') || articleId === 'art-daily-operations') {
        return 'branch';
      } else if (articleId.includes('platform') || articleId === 'art-platform-overview') {
        return 'platform';
      }
    }
    
    // Fallback to route-based scope
    const pathParts = path.split('/');
    return pathParts[1] || null;
  };

  const currentArticleId = getCurrentArticleId();

  // Set selected item when URL changes
  useEffect(() => {
    if (currentArticleId) {
      setSelectedItem(currentArticleId);
    }
  }, [currentArticleId]);

  // Auto-expand category containing the current article
  useEffect(() => {
    if (currentArticleId && sidebarData.length > 0) {
      // Find which category contains the current article
      const categoryWithArticle = sidebarData.find(category => 
        category.articles && category.articles.some(article => article.id === currentArticleId)
      );
      
      if (categoryWithArticle && !openSections.includes(categoryWithArticle.id)) {
        console.log('Auto-expanding category:', categoryWithArticle.name, 'for article:', currentArticleId);
        setOpenSections(prev => [...prev, categoryWithArticle.id]);
      }
    }
  }, [currentArticleId, sidebarData, openSections]);

  // Filter sidebar data based on search query
  const filteredSidebarData = useMemo(() => {
    if (!sidebarSearchQuery.trim()) {
      return sidebarData;
    }

    const query = sidebarSearchQuery.toLowerCase().trim();
    
    return sidebarData.map(category => {
      // Filter articles within each category
      const filteredArticles = category.articles?.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.slug?.toLowerCase().includes(query)
      ) || [];

      // Only include category if it has matching articles or if category name matches
      if (filteredArticles.length > 0 || category.name.toLowerCase().includes(query)) {
        return {
          ...category,
          articles: filteredArticles
        };
      }
      
      return null;
    }).filter(Boolean); // Remove null entries
  }, [sidebarData, sidebarSearchQuery]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (sidebarSearchQuery.trim() && filteredSidebarData.length > 0) {
      const categoriesToExpand = filteredSidebarData
        .filter(category => category.articles && category.articles.length > 0)
        .map(category => category.id);
      
      setOpenSections(prev => {
        const newSections = [...new Set([...prev, ...categoriesToExpand])];
        return newSections;
      });
    }
  }, [sidebarSearchQuery, filteredSidebarData]);

  // Left navigation tabs
  const tabs = [
    {
      icon: <Monitor size={20} />,
      label: "Platform",
      requireAuth: true, // Platform requires login
    },
    {
      icon: <Building2 size={20} />,
      label: "Organization",
      requireAuth: false,
    },
    {
      icon: <GitBranch size={20} />,
      label: "Branch",
      requireAuth: false,
    },
  ];

  // Admin edit tab (only for authenticated admin users)
  const adminTab = {
    icon: <Edit3 size={20} />,
    label: "Admin",
    requireAuth: true,
    requireAdmin: true,
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      <span className="ml-2 text-sm text-gray-500">Loading sidebar...</span>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="text-center">
        <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 mb-2">Failed to load sidebar</p>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {(location.pathname === '/admin' || 
            location.pathname === '/admin/create' || 
            location.pathname.startsWith('/admin/edit/')) 
            ? 'No articles' 
            : 'No documentation available'}
        </p>
      </div>
    </div>
  );

  // Determine if we should show the right panel
  // Hide right panel on home page and all admin pages (dashboard, create, edit)
  const shouldShowRightPanel = location.pathname !== "/" && 
                               location.pathname !== "/admin" &&
                               location.pathname !== "/admin/create" && 
                               !location.pathname.startsWith("/admin/edit/");

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`lg:hidden mobile-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ display: 'block' }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
            <button
              onClick={toggleSidebar}
              // className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {/* Home Button */}
              <button
                onClick={() => {
                  setActiveTab("Home");
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  location.pathname === "/"
                    ? "bg-[#DE5E08] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              
              {tabs.map((tab, index) => {
                const routePath = tab.label.toLowerCase();
                
                // Skip Platform tab if user doesn't have view permission
                if (tab.requireAuth && (!isAuthenticated || !hasPermission('platform.documentation.view'))) {
                  return null;
                }
                
                // Determine if this tab is active
                const isActive = (() => {
                  if (routePath === 'admin') {
                    return location.pathname.startsWith('/admin');
                  } else {
                    const currentScope = getArticleScope();
                    return currentScope === routePath;
                  }
                })();
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab(tab.label);
                      navigate(`/${routePath}`);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-[#DE5E08] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              {/* Admin Edit Tab - Show for users with any C, U, D permissions */}
              {isAuthenticated && (hasPermission('platform.documentation.create') || hasPermission('platform.documentation.edit') || hasPermission('platform.documentation.delete')) && (
                <button
                  onClick={() => {
                    setActiveTab("Admin");
                    navigate("/admin");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    location.pathname.startsWith("/admin")
                      ? "bg-[#DE5E08] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {adminTab.icon}
                  <span>{adminTab.label}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          {shouldShowRightPanel && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-black dark:text-white pl-10 pr-10 py-2 rounded outline-none focus:ring-2 focus:ring-[#DE5E08] focus:border-[#DE5E08] transition-colors duration-200"
                />
                {sidebarSearchQuery && (
                  <button
                    onClick={() => setSidebarSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile Content */}
          {shouldShowRightPanel && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {loading ? (
                  renderLoadingState()
                ) : error ? (
                  renderErrorState()
                ) : filteredSidebarData.length === 0 ? (
                  sidebarSearchQuery.trim() ? (
                    <div className="flex items-center justify-center py-8 px-4">
                      <div className="text-center">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No articles found for "{sidebarSearchQuery}"</p>
                        <button
                          onClick={() => setSidebarSearchQuery('')}
                          className="text-xs text-[#DE5E08] hover:underline mt-1"
                        >
                          Clear search
                        </button>
                      </div>
                    </div>
                  ) : (
                    renderEmptyState()
                  )
                ) : (
                  filteredSidebarData.map((category) => (
                    <div key={category.id}>
                      <div
                        className={`flex justify-between items-center px-3 py-2 cursor-pointer text-gray-900 dark:text-white font-semibold text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          openSections.includes(category.id)
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        }`}
                        onClick={() => toggleSection(category.id)}
                      >
                        <span>{category.name}</span>
                        <div className={`transition-transform duration-200 ${
                          openSections.includes(category.id) ? 'rotate-90' : 'rotate-0'
                        }`}>
                          <ChevronRight size={16} />
                        </div>
                      </div>

                      {/* Articles */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSections.includes(category.id)
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pl-4 pr-2 py-1 space-y-1 text-gray-900 dark:text-white text-sm">
                          {category.articles && category.articles.map((article) => (
                            <div
                              key={article.id}
                              onClick={() => handleArticleClick(article)}
                              className={`cursor-pointer px-3 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                                currentArticleId === article.id || selectedItem === article.id
                                  ? 'bg-[#DE5E08] text-white'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="truncate">{article.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex h-screen text-white font-sans transition-colors duration-200 ${
        shouldShowRightPanel ? 'w-full' : 'w-[100px]'
      }`}>
        {/* Left Tab Bar - Always visible */}
        <div className="w-[100px] bg-white border-r border-gray-200 dark:bg-gray-800 flex flex-col items-center py-6 space-y-6 pt-8 transition-colors duration-200">
          {/* Home Button */}
          <button
            onClick={() => {
              setActiveTab("Home");
              navigate("/");
            }}
            className={`flex flex-col items-center transition-all ${
              location.pathname === "/"
                ? "text-[#DE5E08]"
                : "text-black dark:text-white hover:text-[#DE5E08]"
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-1 block">Home</span>
          </button>
          
          {tabs.map((tab, index) => {
            const routePath = tab.label.toLowerCase();
            
            // Skip Platform tab if user doesn't have view permission
            if (tab.requireAuth && (!isAuthenticated || !hasPermission('platform.documentation.view'))) {
              return null;
            }
            
            // Determine if this tab is active based on current path or article scope
            const isActive = (() => {
              if (routePath === 'admin') {
                // For admin tab, check if we're on any admin route
                return location.pathname.startsWith('/admin');
              } else {
                // For other tabs, check if the current scope matches the tab
                const currentScope = getArticleScope();
                return currentScope === routePath;
              }
            })();
            
            return (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(tab.label);
                  navigate(`/${routePath}`);
                }}
                className={`flex flex-col items-center transition-all ${
                  isActive
                    ? "text-[#DE5E08]"
                    : "text-black dark:text-white hover:text-[#DE5E08]"
                }`}
              >
                {tab.icon}
                <span className="text-[10px] mt-1 block">{tab.label}</span>
              </button>
            );
          })}
          
          {/* Admin Edit Tab - Show for users with any C, U, D permissions */}
          {isAuthenticated && (hasPermission('platform.documentation.create') || hasPermission('platform.documentation.edit') || hasPermission('platform.documentation.delete')) && (
            <button
              onClick={() => {
                setActiveTab("Admin");
                navigate("/admin");
              }}
              className={`flex flex-col items-center transition-all ${
                location.pathname.startsWith("/admin")
                  ? "text-[#DE5E08]"
                  : "text-black dark:text-white hover:text-[#DE5E08]"
              }`}
            >
              {adminTab.icon}
              <span className="text-[10px] mt-1 block">{adminTab.label}</span>
            </button>
          )}
        </div>

        {/* Right Content Panel - Only show if not on Home page */}
        {shouldShowRightPanel && (
          <div className="flex-1 h-full bg-white dark:bg-gray-800 flex flex-col transition-colors duration-200">
            {/* Fixed Search Box */}
            <div className="p-3 pt-6 flex-shrink-0 pb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-black dark:text-white pl-10 pr-10 py-2 rounded outline-none focus:ring-2 focus:ring-[#DE5E08] focus:border-[#DE5E08] transition-colors duration-200"
                />
                {sidebarSearchQuery && (
                  <button
                    onClick={() => setSidebarSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 sidebar-content">
              <div className="space-y-2 pb-4">
                {loading ? (
                  renderLoadingState()
                ) : error ? (
                  renderErrorState()
                ) : filteredSidebarData.length === 0 ? (
                  sidebarSearchQuery.trim() ? (
                    <div className="flex items-center justify-center py-8 px-4">
                      <div className="text-center">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No articles found for "{sidebarSearchQuery}"</p>
                        <button
                          onClick={() => setSidebarSearchQuery('')}
                          className="text-xs text-[#DE5E08] hover:underline mt-1"
                        >
                          Clear search
                        </button>
                      </div>
                    </div>
                  ) : (
                    renderEmptyState()
                  )
                ) : (
                  filteredSidebarData.map((category) => (
                    <div key={category.id}>
                      <div
                        className={`flex justify-between items-center px-4 py-2 cursor-pointer text-gray-900 dark:text-white font-semibold text-sm hover:border-l-2 hover:border-[#DE5E08] ${
                          openSections.includes(category.id)
                            ? "bg-gray-100 border-l-2 border-[#DE5E08] dark:bg-gray-700 text-gray-900 dark:text-white"
                            : ""
                        }`}
                        onClick={() => toggleSection(category.id)}
                      >
                        <span>{category.name}</span>
                        <div className={`transition-transform duration-500 ease-in-out ${
                          openSections.includes(category.id) ? 'rotate-90' : 'rotate-0'
                        }`}>
                          <ChevronRight size={16} />
                        </div>
                      </div>

                      {/* Articles */}
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          openSections.includes(category.id)
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pl-6 pr-2 py-1 space-y-1 text-gray-900 dark:text-white text-sm">
                          {category.articles && category.articles.map((article) => (
                            <div
                              key={article.id}
                              onClick={() => handleArticleClick(article)}
                              className={`cursor-pointer px-2 py-1 rounded-md flex items-center gap-2 transition-colors duration-200 ${
                                currentArticleId === article.id || selectedItem === article.id
                                  ? 'bg-gray-100 text-gray-900 dark:bg-[#DE5E08] dark:text-white'
                                  : 'dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="truncate">{article.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
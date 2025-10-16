import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebarData } from "../hooks/useSidebarData";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({ showRightPanel = false }) => {
  const [openSections, setOpenSections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { activeTab, setActiveTab } = useNavigation();
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

  const currentArticleId = getCurrentArticleId();

  // Set selected item when URL changes
  useEffect(() => {
    if (currentArticleId) {
      setSelectedItem(currentArticleId);
    }
  }, [currentArticleId]);

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

  return (
    <div className={`flex h-screen text-white font-sans transition-colors duration-200 ${
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
          
          // Determine if this tab is active based on current path
          const isActive = (() => {
            if (routePath === 'admin') {
              // For admin tab, check if we're on any admin route
              return location.pathname.startsWith('/admin');
            } else {
              // For other tabs, check exact match or if path starts with the route
              return location.pathname === `/${routePath}` || 
                     (location.pathname.startsWith(`/${routePath}/`) && routePath !== 'admin');
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
            <input
              type="text"
              placeholder="Search"
              className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-white text-black dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-500 transition-colors duration-200"
            />
          </div>

          {/* Scrollable Sections */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
            <div className="space-y-2 pb-4">
              {loading ? (
                renderLoadingState()
              ) : error ? (
                renderErrorState()
              ) : sidebarData.length === 0 ? (
                renderEmptyState()
              ) : (
                sidebarData.map((category) => (
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
  );
};

export default Sidebar;
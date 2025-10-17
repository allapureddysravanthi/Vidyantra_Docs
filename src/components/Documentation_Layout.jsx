import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import OnThisPage from "./OnThisPage";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../hooks/useAuth";

const Documentation_Layout = () => {
  const { activeTab, setShowNavbarSearch, isSidebarOpen } = useNavigation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const params = useParams();
  
  // Check if we're on an article page and extract article ID
  const isArticlePage = location.pathname.includes('/article/') || location.pathname.includes('/doc/');
  const articleId = params.id || null;
  const scope = location.pathname.split('/')[1];
  
  // Determine current page
  const isHomePage = location.pathname === "/";
  const isPlatformPage = location.pathname === "/platform";
  const isOrganizationPage = location.pathname === "/organization";
  const isBranchPage = location.pathname === "/branch";
  const isAdminPage = location.pathname.startsWith("/admin");
  
  const showRightPanel = !isHomePage && !isAdminPage;
  const showAdminLayout = isAdminPage && isAuthenticated;

  // Show navbar search on all pages except Home (Home handles its own logic)
  useEffect(() => {
    if (!isHomePage) {
      setShowNavbarSearch(true);
    }
  }, [isHomePage, setShowNavbarSearch]);

  // Define sections for each page
  const getPageSections = () => {
    if (isPlatformPage) {
      return [
        { id: 'platform-overview', title: 'Platform Overview' },
        { id: 'getting-started', title: 'Getting Started' },
        { id: 'api-reference', title: 'API Reference' },
        { id: 'integrations', title: 'Integrations' },
        { id: 'troubleshooting', title: 'Troubleshooting' }
      ];
    } else if (isOrganizationPage) {
      return [
        { id: 'user-management', title: 'User Management' },
        { id: 'permissions', title: 'Permissions' },
        { id: 'settings', title: 'Settings' },
        { id: 'billing', title: 'Billing' },
        { id: 'security', title: 'Security' }
      ];
    } else if (isBranchPage) {
      return [
        { id: 'branch-setup', title: 'Branch Setup' },
        { id: 'branch-management', title: 'Branch Management' },
        { id: 'branch-settings', title: 'Branch Settings' },
        { id: 'branch-analytics', title: 'Branch Analytics' }
      ];
    }
    return [];
  };

  // Mobile Admin Page Warning
  const MobileAdminWarning = () => (
    <div className="lg:hidden min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Admin Panel Not Available on Mobile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The admin panel is designed for desktop use only. Please access it from a computer or tablet for the best experience.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-[#DE5E08] text-white rounded-lg hover:bg-[#c54a07] transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      
      {/* Mobile Admin Warning */}
      {isAdminPage && <MobileAdminWarning />}
      
      {/* Desktop Layouts */}
      <div className="hidden lg:block">
        {showAdminLayout ? (
          // Admin pages with sidebar and navbar (when authenticated) - same layout as Home page
          <div className={`pt-16 h-full overflow-hidden transition-all duration-300 dark:bg-gray-800 ${
            isSidebarOpen ? 'grid grid-cols-[100px_1fr]' : 'grid grid-cols-[0_1fr]'
          }`}>
            {/* Left Sidebar for Admin */}
            {isSidebarOpen && (
              <div className="h-full border-r border-gray-200 dark:border-gray-700">
                <Sidebar key="admin-sidebar" showRightPanel={false} />
              </div>
            )}

            {/* Admin Content Area */}
            <div className="flex-1 overflow-y-auto dark:bg-gray-800 h-full transition-colors duration-200">
              <Outlet />
            </div>
          </div>
        ) : isAdminPage ? (
          // Admin pages - full width layout (when not authenticated)
          <div className="pt-16 h-full overflow-y-auto dark:bg-gray-800 transition-colors duration-200">
            <Outlet />
          </div>
        ) : showRightPanel ? (
          // Three-column layout: Sidebar | Content | OnThisPage
          <div className={`pt-16 h-full overflow-hidden transition-all duration-300 dark:bg-gray-800 ${
            isSidebarOpen ? 'grid grid-cols-[400px_1fr_400px]' : 'grid grid-cols-[0_1fr_400px]'
          }`}>
            {/* Left Sidebar - Always use the same Sidebar */}
            {isSidebarOpen && (
              <div className="h-full border-r border-gray-200 dark:border-gray-700">
                <Sidebar key="consistent-sidebar-with-panel" showRightPanel={true} />
              </div>
            )}

            {/* Center Content Area */}
            <div className="flex-1 overflow-y-auto dark:bg-gray-800 h-full transition-colors duration-200 max-w-5xl mx-auto pr-20 py-20 article-content-container">
              <Outlet />
            </div>
            
            {/* Right OnThisPage Navigation */}
            <div className="on-this-page-container">
              <OnThisPage 
                sections={getPageSections()} 
                articleId={isArticlePage ? articleId : null}
                scope={isArticlePage ? scope : null}
              />
            </div>
          </div>
        ) : (
          // Home layout with two columns (no OnThisPage) - Use same Sidebar
          <div className={`pt-16 h-full overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'grid grid-cols-[100px_1fr]' : 'grid grid-cols-[0_1fr]'
          }`}>
            {/* Left Sidebar - Always use the same Sidebar */}
            {isSidebarOpen && (
              <div className="h-full border-r border-gray-200 dark:border-gray-700">
                <Sidebar key="consistent-sidebar-without-panel" showRightPanel={false} />
              </div>
            )}

            {/* Center Content Area */}
            <div className="flex-1 overflow-y-auto h-full dark:bg-gray-800 transition-colors duration-200 pb-10">
              <Outlet />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {!isAdminPage && (
          <div className="pt-16 h-full overflow-y-auto dark:bg-gray-800 transition-colors duration-200">
            {/* Mobile Sidebar - Show when sidebar is open */}
            {isSidebarOpen && (
              <Sidebar key="mobile-sidebar" showRightPanel={showRightPanel} />
            )}
            
            {/* Mobile Content Area */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <Outlet />
            </div>
            
            {/* Mobile OnThisPage - Only show for article pages */}
            {isArticlePage && (
              <OnThisPage 
                sections={getPageSections()} 
                articleId={articleId}
                scope={scope}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation_Layout;
import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import OnThisPage from "./OnThisPage";
import { Outlet, useLocation } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext";

const Documentation_Layout = () => {
  const { activeTab, setShowNavbarSearch } = useNavigation();
  const location = useLocation();
  
  // Determine current page
  const isHomePage = location.pathname === "/";
  const isPlatformPage = location.pathname === "/platform";
  const isOrganizationPage = location.pathname === "/organization";
  const isBranchPage = location.pathname === "/branch";
  
  const showRightPanel = !isHomePage;

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

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      
      {showRightPanel ? (
        // Three-column layout: Sidebar | Content | OnThisPage
        <div className="pt-16 h-full overflow-hidden grid grid-cols-[400px_1fr_400px] dark:bg-gray-800 bg">
          {/* Left Sidebar */}
          <div className="h-full border-r border-gray-200 dark:border-gray-700">
            <Sidebar key="sidebar-with-panel" showRightPanel={true} />
          </div>

          {/* Center Content Area */}
          <div className="flex-1 overflow-y-auto dark:bg-gray-800 h-full transition-colors duration-200 max-w-5xl mx-auto">
            <Outlet />
          </div>
          
          {/* Right OnThisPage Navigation */}
          <OnThisPage sections={getPageSections()} />
        </div>
      ) : (
        // Home layout with two columns (no OnThisPage)
        <div className="pt-16 h-full overflow-hidden grid grid-cols-[100px_1fr]">
          {/* Left Sidebar */}
          <div className="h-full border-r border-gray-200 dark:border-gray-700">
            <Sidebar key="sidebar-without-panel" showRightPanel={false} />
          </div>

          {/* Center Content Area */}
          <div className="flex-1 overflow-y-auto h-full dark:bg-gray-800 transition-colors duration-200">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation_Layout;

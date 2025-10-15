import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';

const Organization = () => {
  const { isDark } = useTheme();
  const { setActiveTab } = useNavigation();

  // Set active tab to Organization when component mounts
  useEffect(() => {
    setActiveTab("Organization");
  }, [setActiveTab]);

  return (
    <div className={`min-h-full transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`py-8 px-6 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Organization Documentation
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage and configure organizational settings and permissions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div id="user-management" className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                User Management
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Add, remove, and manage organization users.
              </p>
            </div>
            
            <div id="permissions" className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Permissions
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Configure roles and permissions for organization members.
              </p>
            </div>
            
            <div id="settings" className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Settings
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Organization-wide settings and configurations.
              </p>
            </div>
          </div>

          {/* Additional sections for OnThisPage navigation */}
          <div id="billing" className={`mt-12 p-6 rounded-lg border transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Billing & Subscriptions
            </h2>
            <p className={`transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your organization's billing, subscriptions, and payment methods.
            </p>
          </div>

          <div id="security" className={`mt-8 p-6 rounded-lg border transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Security Settings
            </h2>
            <p className={`transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Configure security policies, two-factor authentication, and access controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organization;

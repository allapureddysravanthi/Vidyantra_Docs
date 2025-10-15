import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';

const Branch = () => {
  const { isDark } = useTheme();
  const { setActiveTab } = useNavigation();

  // Set active tab to Branch when component mounts
  useEffect(() => {
    setActiveTab("Branch");
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
              Branch Documentation
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage branch operations, locations, and configurations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Branch Setup
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Set up and configure new branch locations.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Operations
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Daily branch operations and management.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-[#DE5E08]' 
                : 'bg-white border-gray-200 hover:border-[#DE5E08]'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Reporting
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Branch performance and analytics reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branch;

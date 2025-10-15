import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';

const Platform = () => {
  const { isDark } = useTheme();
  const { setActiveTab } = useNavigation();

  // Set active tab to Platform when component mounts
  useEffect(() => {
    setActiveTab("Platform");
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
              Platform Documentation
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comprehensive platform management and configuration documentation.
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
                Getting Started
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Learn the basics of platform setup and configuration.
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
                API Reference
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Complete API documentation for platform integration.
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
                Configuration
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Platform settings and configuration options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Platform;

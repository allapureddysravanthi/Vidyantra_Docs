import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const OnThisPage = ({ sections = [] }) => {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      
      // Find the section that's currently in view
      let currentSection = '';
      
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop - scrollContainer.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          
          // Check if the section is in the viewport
          if (scrollTop >= elementTop - 100 && scrollTop < elementBottom) {
            currentSection = section.id;
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    
    if (element && scrollContainer) {
      const elementTop = element.offsetTop - scrollContainer.offsetTop;
      scrollContainer.scrollTo({
        top: elementTop - 20,
        behavior: 'smooth'
      });
    }
  };

  if (sections.length === 0) return null;

  return (
    <div className={`h-full bg-white dark:bg-[#1F2937] border-l border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            On This Page
          </h3>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  activeSection === section.id
                    ? isDark 
                      ? 'bg-[#DE5E08] text-white' 
                      : 'bg-[#DE5E08] text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default OnThisPage;

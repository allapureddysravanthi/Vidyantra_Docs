import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useRelatedArticles } from '../hooks/useRelatedArticles';

const OnThisPage = ({ sections = [], articleId, scope }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  const { relatedArticles, loading: relatedLoading } = useRelatedArticles(articleId, scope);


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

  const handleRelatedArticleClick = (relatedArticle) => {
    const route = relatedArticle.slug 
      ? `/${scope}/doc/${relatedArticle.slug}`
      : `/${scope}/article/${relatedArticle.id}`;
    navigate(route);
  };

  if (sections.length === 0 && !articleId) return null;

  return (
    <div className={`h-full bg-white dark:bg-[#1F2937] border-l border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="p-6">
          {/* On This Page Section */}
          {sections.length > 0 && (
            <>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                On This Page
              </h3>
              
              <nav className="space-y-1 mb-8">
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
            </>
          )}

          {/* Related Topics Section */}
          {articleId && (
            <>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Related Topics
              </h3>
              
              {relatedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`animate-pulse rounded-md p-3 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div className={`h-3 rounded w-3/4 mb-2 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}></div>
                      <div className={`h-2 rounded w-1/2 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  ))}
                </div>
              ) : relatedArticles.length > 0 ? (
                <nav className="space-y-1">
                  {relatedArticles.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => handleRelatedArticleClick(related)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{related.title}</div>
                      {related.excerpt && (
                        <div className={`text-xs mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {related.excerpt.length > 60 
                            ? `${related.excerpt.substring(0, 60)}...` 
                            : related.excerpt
                          }
                        </div>
                      )}
                    </button>
                  ))}
                </nav>
              ) : (
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No related topics found
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnThisPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useRelatedArticles } from '../hooks/useRelatedArticles';
import { ChevronDown, ChevronUp, List, X } from 'lucide-react';

const OnThisPage = ({ sections = [], articleId, scope }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    
    // Close mobile menu after clicking
    setIsMobileMenuOpen(false);
  };

  const handleRelatedArticleClick = (relatedArticle) => {
    try {
      if (!relatedArticle || (!relatedArticle.slug && !relatedArticle.id)) {
        console.error('Invalid related article data:', relatedArticle);
        return;
      }

      // Always use ID-based navigation for related articles to avoid cross-scope issues
      // This ensures we can navigate to articles regardless of their scope
      const route = relatedArticle.id 
        ? `/${scope}/article/${relatedArticle.id}`
        : `/${scope}/doc/${relatedArticle.slug}`;
      
      console.log('Navigating to related article:', route);
      navigate(route);
      
      // Close mobile menu after clicking
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error navigating to related article:', error);
    }
  };

  if (sections.length === 0 && !articleId) return null;

  return (
    <>
      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-3 rounded-full bg-[#DE5E08] text-white shadow-lg hover:bg-[#c54a07] transition-colors duration-200"
        >
          <List className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1F2937] border-t border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                On This Page
              </h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Sections */}
            {sections.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Page Sections
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          activeSection === section.id
                            ? 'bg-[#DE5E08] text-white'
                            : isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Related Topics */}
            {articleId && (
              <div>
                <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Related Topics
                </h4>
                
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
                  <div className="space-y-1">
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
                  </div>
                ) : (
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No related topics found
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full bg-white dark:bg-[#1F2937] border-l border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="h-full overflow-y-auto custom-scrollbar" style={{ height: 'calc(100vh - 4rem)', maxHeight: 'calc(100vh - 4rem)' }}>
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
    </>
  );
};

export default OnThisPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useArticleData } from '../hooks/useArticleData';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getPublicArticleBySlug, 
  getPlatformArticleBySlug,
  trackPublicView, 
  trackPlatformView,
  submitPublicFeedback,
  submitPlatformFeedback,
  getPublicRelatedArticles,
  getRelatedArticles
} from '../lib/api/documentation.api';

// Import your existing design components
import ButtonV1 from '../Design Library/Button/ButtonV1';
import IconInput from '../Design Library/Inputs/IconInput';

const ArticlePage = () => {
  const { scope, slug, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasPermission, redirectToLogin } = useAuth();
  const { articleData, loading, error } = useArticleData();
  const { isDark } = useTheme();
  
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [feedback, setFeedback] = useState({
    isHelpful: null,
    comment: '',
    userEmail: ''
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState({});



  // Load related articles when article data is available
  useEffect(() => {
    if (articleData?.id) {
      loadRelatedArticles();
      trackArticleView();
    }
  }, [articleData]);

  // Handle authentication for platform articles
  useEffect(() => {
    if (scope === 'platform' && !isAuthenticated) {
      redirectToLogin(`/platform/doc/${slug}`);
      return;
    }
    
    if (scope === 'platform' && !hasPermission('platform.documentation.view')) {
      setError('You need documentation access permissions');
      return;
    }
  }, [scope, isAuthenticated, hasPermission, redirectToLogin, slug]);

  async function loadRelatedArticles() {
    if (!articleData?.id) return;
    
    try {
      const relatedData = scope === 'platform' 
        ? await getRelatedArticles(articleData.id)
        : await getPublicRelatedArticles(articleData.id);
      setRelatedArticles(relatedData.data || []);
    } catch (err) {
      console.warn('Failed to load related articles:', err);
      // Set empty array to prevent UI issues
      setRelatedArticles([]);
    }
  }

  async function trackArticleView() {
    if (!articleData?.id) return;
    
    try {
      if (scope === 'platform') {
        await trackPlatformView(articleData.id, {
          timeSpent: 0,
          scrollDepth: 0
        });
      } else {
        await trackPublicView(articleData.id, {
          timeSpent: 0,
          scrollDepth: 0
        });
      }
    } catch (err) {
      console.warn('Failed to track article view:', err);
    }
  }

  async function handleFeedback(isHelpful) {
    if (!articleData) return;

    setFeedback(prev => ({ ...prev, isHelpful }));
  }

  async function submitFeedback() {
    if (!articleData || feedback.isHelpful === null) return;

    try {
      setSubmittingFeedback(true);
      
      const feedbackData = {
        isHelpful: feedback.isHelpful,
        comment: feedback.comment,
        ...(scope === 'platform' && !isAuthenticated && { userEmail: feedback.userEmail })
      };

      if (scope === 'platform') {
        await submitPlatformFeedback(articleData.id, feedbackData);
      } else {
        await submitPublicFeedback(articleData.id, feedbackData);
      }

      setFeedbackSubmitted(true);
      setFeedback({ isHelpful: null, comment: '', userEmail: '' });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  function toggleFaq(faqId) {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  }


  if (loading) {
    return (
      <>


        <div className="article-page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:bg-gray-800 transition-colors duration-200">
        <div className="animate-pulse">
          <div className={`h-6 sm:h-8 rounded w-3/4 mb-3 sm:mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-3 sm:h-4 rounded w-1/2 mb-6 sm:mb-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="space-y-2 sm:space-y-3">
            <div className={`h-3 sm:h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-3 sm:h-4 rounded w-5/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-3 sm:h-4 rounded w-4/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="article-page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:bg-gray-800 transition-colors duration-200">
        <div className={`rounded-lg p-4 sm:p-6 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-800'}`}>Error Loading Article</h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
          <ButtonV1 
            onClick={() => navigate('/')}
            bgColor="#EF4444"
            textColor="white"
            className="mt-4"
          >
            Back to Home
          </ButtonV1>
        </div>
        </div>
      </>
    );
  }

  if (!articleData) {
    return (
      <>
        <div className="article-page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:bg-gray-800 transition-colors duration-200">
        <div className="text-center">
          <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Article Not Found</h2>
          <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The article you're looking for doesn't exist or has been moved.</p>
          <ButtonV1 
            onClick={() => navigate('/')}
            bgColor="#01274D"
            textColor="white"
          >
            Back to Home
          </ButtonV1>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="article-page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:bg-gray-800 transition-colors duration-200">
      {/* Article Header */}
      <div className={`rounded-2xl border-2 border-dashed transition-all duration-300 mb-6 sm:mb-8 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-600 hover:border-gray-500' 
          : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#DE5E08]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                isDark ? 'bg-[#DE5E08]/20 text-[#DE5E08] border border-[#DE5E08]/30' : 'bg-[#DE5E08]/10 text-[#DE5E08] border border-[#DE5E08]/20'
              }`}>
                {articleData.type || 'Article'}
              </span>
            </div>
          </div>
          
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {articleData.title}
          </h1>
          
          {articleData.excerpt && (
            <div className={`p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/80 border border-gray-200'
            }`}>
              <p className={`text-lg sm:text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {articleData.excerpt}
              </p>
            </div>
          )}
          
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {articleData.readingTime && (
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className="text-sm">📖</span>
                </div>
                <span className="font-medium">{articleData.readingTime} min read</span>
              </div>
            )}
            {articleData.publishedAt && (
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className="text-sm">📅</span>
                </div>
                <span className="font-medium">{new Date(articleData.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className={`rounded-2xl border-2 border-dashed transition-all duration-300 mb-8 sm:mb-12 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-600 hover:border-gray-500' 
          : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#DE5E08]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Article Content
            </h2>
          </div>
          
          <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
            <div 
              dangerouslySetInnerHTML={{ __html: articleData.content }}
              className={`article-content ${
                isDark 
                  ? 'text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-code:text-gray-200 prose-pre:bg-gray-800 prose-blockquote:border-gray-600' 
                  : 'text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-700 prose-pre:bg-gray-100 prose-blockquote:border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      {articleData.faqs && articleData.faqs.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#DE5E08]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Find answers to common questions about this topic
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {articleData.faqs.map((faq, index) => {
              const faqId = faq.id || index;
              const isExpanded = expandedFaqs[faqId];
              
              return (
                <div 
                  key={faqId} 
                  className={`rounded-xl border-2 transition-all duration-300 ${
                    isExpanded
                      ? isDark
                        ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-[#DE5E08] shadow-lg shadow-[#DE5E08]/10'
                        : 'bg-gradient-to-br from-orange-50/50 to-white border-[#DE5E08] shadow-lg shadow-[#DE5E08]/10'
                      : isDark
                      ? 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-600 hover:border-gray-500'
                      : 'bg-gradient-to-br from-gray-50/50 to-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faqId)}
                    className={`w-full p-4 sm:p-6 text-left flex items-center justify-between transition-all duration-200 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                        isExpanded
                          ? 'bg-[#DE5E08] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-base sm:text-lg font-semibold leading-relaxed pr-2 sm:pr-4">
                        {faq.question}
                      </span>
                    </div>
                    
                    <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isExpanded
                        ? 'bg-[#DE5E08] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="ml-10 sm:ml-12">
                        <div className={`p-3 sm:p-4 rounded-lg ${
                          isDark 
                            ? 'bg-gray-800/50 border border-gray-700' 
                            : 'bg-white/80 border border-gray-200'
                        }`}>
                          <p className={`leading-relaxed text-sm sm:text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Related Articles</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <div 
                key={related.id}
                className={`border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                onClick={() => navigate(`/${scope}/doc/${related.slug}`)}
              >
                <h3 className={`font-semibold mb-2 text-sm sm:text-base ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{related.title}</h3>
                {related.excerpt && (
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{related.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className={`rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-600 hover:border-gray-500' 
          : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#DE5E08]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Was this helpful?
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your feedback helps us improve our documentation
            </p>
          </div>
          
          {!feedbackSubmitted ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Feedback Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => handleFeedback(true)}
                  className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                    feedback.isHelpful === true
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-105'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base sm:text-lg">👍</span>
                  <span>Yes, it helped</span>
                  {feedback.isHelpful === true && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </button>
                
                <button
                  onClick={() => handleFeedback(false)}
                  className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                    feedback.isHelpful === false
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base sm:text-lg">👎</span>
                  <span>Not really</span>
                  {feedback.isHelpful === false && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
                  )}
                </button>
              </div>
              
              {/* Additional Feedback Form */}
              {feedback.isHelpful !== null && (
                <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                    <h4 className={`text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tell us more (optional)
                    </h4>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <textarea
                          placeholder="What could we improve? Any suggestions?"
                          value={feedback.comment}
                          onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-colors duration-200 resize-none text-sm sm:text-base ${
                            isDark
                              ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20'
                          }`}
                        />
                      </div>
                      
                      {scope === 'platform' && !isAuthenticated && (
                        <div>
                          <input
                            type="email"
                            placeholder="Your email (optional, for follow-up)"
                            value={feedback.userEmail}
                            onChange={(e) => setFeedback(prev => ({ ...prev, userEmail: e.target.value }))}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-colors duration-200 text-sm sm:text-base ${
                              isDark
                                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#DE5E08] focus:ring-2 focus:ring-[#DE5E08]/20'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center sm:justify-end">
                    <button
                      onClick={submitFeedback}
                      disabled={submittingFeedback}
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                        submittingFeedback
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-[#DE5E08] text-white hover:bg-[#c54a07] shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {submittingFeedback ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 ${
                isDark ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                Thank you for your feedback!
              </h4>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                We appreciate you taking the time to help us improve.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ArticlePage;
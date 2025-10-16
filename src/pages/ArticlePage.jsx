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

        <div className="article-page-container max-w-4xl mx-auto p-6 dark:bg-gray-800 transition-colors duration-200">
        <div className="animate-pulse">
          <div className={`h-8 rounded w-3/4 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 rounded w-1/2 mb-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="space-y-3">
            <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-4/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="article-page-container max-w-4xl mx-auto p-6 dark:bg-gray-800 transition-colors duration-200">
        <div className={`rounded-lg p-6 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-800'}`}>Error Loading Article</h2>
          <p className={isDark ? 'text-red-300' : 'text-red-600'}>{error}</p>
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
        <div className="article-page-container max-w-4xl mx-auto p-6 dark:bg-gray-800 transition-colors duration-200">
        <div className="text-center">
          <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Article Not Found</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The article you're looking for doesn't exist or has been moved.</p>
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

      <div className="article-page-container max-w-4xl mx-auto p-6 dark:bg-gray-800 transition-colors duration-200">
      {/* Article Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
            {articleData.type || 'Article'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {scope}
          </span>
        </div>
        
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{articleData.title}</h1>
        
        {articleData.excerpt && (
          <p className={`text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{articleData.excerpt}</p>
        )}
        
        <div className={`flex items-center gap-4 mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {articleData.readingTime && (
            <span>📖 {articleData.readingTime} min read</span>
          )}
          {articleData.publishedAt && (
            <span>📅 {new Date(articleData.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className={`prose prose-lg max-w-none mb-12 ${isDark ? 'prose-invert' : ''}`}>
        <div 
          dangerouslySetInnerHTML={{ __html: articleData.content }}
          className={`article-content ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
        />
      </div>

      {/* FAQs Section */}
      {articleData.faqs && articleData.faqs.length > 0 && (
        <div className="mb-12">
          <h2 className={`text-3xl font-semibold mb-8 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto">
            {articleData.faqs.map((faq, index) => {
              const faqId = faq.id || index;
              const isExpanded = expandedFaqs[faqId];
              
              return (
                <div key={faqId} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(faqId)}
                    className={`w-full py-6 px-0 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    <span className="text-lg font-medium pr-4">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div className={`pb-6 px-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="leading-relaxed">{faq.answer}</p>
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
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Related Articles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <div 
                key={related.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                onClick={() => navigate(`/${scope}/doc/${related.slug}`)}
              >
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{related.title}</h3>
                {related.excerpt && (
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{related.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Was this helpful?</h3>
        
        {!feedbackSubmitted ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <ButtonV1 
                onClick={() => handleFeedback(true)}
                bgColor={feedback.isHelpful === true ? "#10B981" : "#6B7280"}
                textColor="white"
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                👍 Yes
              </ButtonV1>
              <ButtonV1 
                onClick={() => handleFeedback(false)}
                bgColor={feedback.isHelpful === false ? "#EF4444" : "#6B7280"}
                textColor="white"
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                👎 No
              </ButtonV1>
            </div>
            
            <div className="max-w-md">
              <IconInput
                placeholder="Add a comment (optional)"
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
            </div>
            
            {scope === 'platform' && !isAuthenticated && (
              <div className="max-w-md">
                <IconInput
                  placeholder="Your email (optional)"
                  value={feedback.userEmail}
                  onChange={(e) => setFeedback(prev => ({ ...prev, userEmail: e.target.value }))}
                  width="100%"
                  height="40px"
                  type="email"
                  backgroundColor={isDark ? '#374151' : '#fff'}
                  textColor={isDark ? '#f3f4f6' : '#01274D'}
                  border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                />
              </div>
            )}

            {feedback.isHelpful !== null && (
              <div className="flex justify-end">
                <ButtonV1 
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  bgColor="#3B82F6"
                  textColor="white"
                  className="px-6 py-2 text-sm"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </ButtonV1>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Thank you for your feedback!</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default ArticlePage;

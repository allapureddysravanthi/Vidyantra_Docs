import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getArticles, getArticleFeedback } from '../lib/api/documentation.api';

// Import your existing design components
import TableV1 from '../Design Library/Table/TableV1';
import DropdownV1 from '../Design Library/DropDown/DropDownV1';
import ButtonV1 from '../Design Library/Button/ButtonV1';
import SearchInput from '../Design Library/SearchInput/SearchInput';

const FeedbackAnalytics = () => {
  const { isAuthenticated, hasPermission, redirectToLogin, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    helpfulFeedback: 0,
    notHelpfulFeedback: 0,
    averageRating: 0
  });

  // Check permissions on mount
  useEffect(() => {
    // Wait for authentication to load
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      redirectToLogin('/admin/feedback');
      return;
    }
    
    if (!hasPermission('platform.documentation.view')) {
      setError('Access denied: You need documentation management permissions');
      return;
    }
    
    loadArticles();
  }, [isAuthenticated, hasPermission, authLoading]);

  async function loadArticles() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getArticles({
        page: 1,
        limit: 100,
        isPublished: true
      });
      
      setArticles(data.data || []);
    } catch (error) {
      console.error('Failed to load articles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFeedback(articleId) {
    try {
      setFeedbackLoading(true);
      setError(null);
      
      const data = await getArticleFeedback(articleId, {
        page: 1,
        limit: 100
      });
      
      setFeedback(data.data || []);
      
      // Calculate stats
      const total = data.data?.length || 0;
      const helpful = data.data?.filter(f => f.isHelpful === true).length || 0;
      const notHelpful = data.data?.filter(f => f.isHelpful === false).length || 0;
      const average = total > 0 ? (helpful / total) * 100 : 0;
      
      setStats({
        totalFeedback: total,
        helpfulFeedback: helpful,
        notHelpfulFeedback: notHelpful,
        averageRating: average
      });
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setError(error.message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  const handleArticleSelect = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    setSelectedArticle(article);
    if (articleId) {
      loadFeedback(articleId);
    } else {
      setFeedback([]);
      setStats({
        totalFeedback: 0,
        helpfulFeedback: 0,
        notHelpfulFeedback: 0,
        averageRating: 0
      });
    }
  };

  // Feedback table columns
  const feedbackColumns = [
    {
      header: 'Rating',
      accessor: 'isHelpful',
      cellRenderer: (value) => (
        <div className="flex items-center gap-2">
          {value === true ? (
            <span className="text-green-600 text-lg">👍</span>
          ) : value === false ? (
            <span className="text-red-600 text-lg">👎</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          <span className={`text-sm font-medium ${
            value === true ? 'text-green-600' : 
            value === false ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {value === true ? 'Helpful' : value === false ? 'Not Helpful' : 'No Rating'}
          </span>
        </div>
      )
    },
    {
      header: 'Comment',
      accessor: 'comment',
      cellRenderer: (value) => (
        <div className="max-w-xs">
          {value ? (
            <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
          ) : (
            <span className="text-gray-400 text-sm">No comment</span>
          )}
        </div>
      )
    },
    {
      header: 'User',
      accessor: 'user',
      cellRenderer: (value, row) => (
        <div>
          {row.userId ? (
            <div>
              <div className="text-sm font-medium text-gray-900">
                {row.user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {row.user?.email || row.userId}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-600">Anonymous</div>
              {row.userEmail && (
                <div className="text-xs text-gray-500">{row.userEmail}</div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cellRenderer: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access feedback analytics.</p>
          <ButtonV1 
            onClick={() => redirectToLogin('/admin/feedback')}
            bgColor="#01274D"
            textColor="white"
          >
            Login
          </ButtonV1>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
        <p className="text-gray-600 mt-2">View and analyze user feedback for documentation articles</p>
      </div>

      {/* Article Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Article</h2>
        
        <DropdownV1
          options={[
            { label: 'Select an article...', value: '' },
            ...articles.map(article => ({ 
              label: `${article.title} (${article.scope})`, 
              value: article.id 
            }))
          ]}
          placeholder="Choose an article to view feedback"
          value={selectedArticle?.id || ''}
          onSelect={handleArticleSelect}
          width="100%"
        />
      </div>

      {/* Stats Cards */}
      {selectedArticle && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.helpfulFeedback}</div>
            <div className="text-sm text-gray-600">Helpful</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{stats.notHelpfulFeedback}</div>
            <div className="text-sm text-gray-600">Not Helpful</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Helpful Rate</div>
          </div>
        </div>
      )}

      {/* Selected Article Info */}
      {selectedArticle && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Article Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">{selectedArticle.title}</h3>
              <p className="text-sm text-gray-600">{selectedArticle.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {selectedArticle.type}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {selectedArticle.scope}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedArticle.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedArticle.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Table */}
      {selectedArticle && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Feedback Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              User feedback and comments for this article
            </p>
          </div>
          
          <TableV1
            columns={feedbackColumns}
            data={feedback}
            showPagination={true}
            initialRowsPerPage={10}
            noDataMessage="No feedback available for this article"
            loading={feedbackLoading}
          />
        </div>
      )}

      {/* No Article Selected */}
      {!selectedArticle && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select an Article</h2>
          <p className="text-gray-600 mb-6">
            Choose an article from the dropdown above to view its feedback analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackAnalytics;

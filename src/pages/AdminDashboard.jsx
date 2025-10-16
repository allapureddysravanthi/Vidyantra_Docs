import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getArticles, 
  getCategories, 
  deleteArticle, 
  patchArticle,
  getArticleFeedback 
} from '../lib/api/documentation.api';
import { useNavigate } from 'react-router-dom';

// Import your existing design components
import TableV1 from '../Design Library/Table/TableV1';
import ButtonV1 from '../Design Library/Button/ButtonV1';
import SearchInput from '../Design Library/SearchInput/SearchInput';
import IconInput from '../Design Library/Inputs/IconInput';
import { displayToast } from '../Design Library/Toast/Toast';

const AdminDashboard = () => {
  const { isAuthenticated, hasPermission, redirectToLogin, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const loadingRef = useRef(false);
  const initialLoadRef = useRef(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    category: 'all'
  });

  // Check permissions on mount - only run once
  useEffect(() => {
    let mounted = true;
    
    const initializeDashboard = async () => {
      // Wait for authentication to load
      if (authLoading) {
        return;
      }
      
      if (!isAuthenticated) {
        redirectToLogin('/admin');
        return;
      }
      
      if (!hasPermission('platform.documentation.view')) {
        setError('Access denied: You need documentation management permissions');
        return;
      }
      
      // Only load data once when component mounts and auth is ready
      if (!dataLoaded && !initialLoadRef.current && mounted) {
        initialLoadRef.current = true;
        const timer = setTimeout(() => {
          if (mounted) {
            loadData();
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    };
    
    initializeDashboard();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle authentication state changes
  useEffect(() => {
    if (!authLoading && isAuthenticated && hasPermission('platform.documentation.view') && !dataLoaded && !initialLoadRef.current) {
      initialLoadRef.current = true;
      loadData();
    }
  }, [authLoading, isAuthenticated]); // Only depend on auth state

  async function loadData() {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('loadData: Already loading, skipping...');
      return;
    }
    
    console.log('loadData: Starting API calls...');
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Load articles and categories in parallel
      const [articlesData, categoriesData] = await Promise.all([
        getArticles({
          page: 1,
          limit: 50,
          ...(filters.search && { search: filters.search }),
          ...(filters.type !== 'all' && { type: filters.type }),
          ...(filters.status !== 'all' && { status: filters.status }),
          ...(filters.category !== 'all' && { categoryId: filters.category })
        }),
        getCategories({ isActive: true })
      ]);
      
      setArticles(articlesData.data?.articles || []);
      setCategories(categoriesData.data || []);
      
      // Set pagination info if available
      if (articlesData.data) {
        setPagination({
          total: articlesData.data.total || 0,
          page: articlesData.data.page || 1,
          limit: articlesData.data.limit || 10,
          totalPages: articlesData.data.totalPages || 1
        });
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error.message);
      setDataLoaded(true); // Mark as attempted even if failed
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  // Reload data when search changes (debounced)
  useEffect(() => {
    if (isAuthenticated && dataLoaded && filters.search !== undefined) {
      const timer = setTimeout(() => {
        loadData();
      }, 500); // Debounce search
      
      return () => clearTimeout(timer);
    }
  }, [filters.search]); // Only depend on search

  // Handle dropdown toggle
  const toggleDropdown = (articleId) => {
    setOpenDropdown(openDropdown === articleId ? null : articleId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dropdown Menu Component
  const ActionsDropdown = ({ article, isOpen, onToggle }) => {
    const handleAction = (action) => {
      setOpenDropdown(null); // Close dropdown
      switch (action) {
        case 'edit':
          navigate(`/admin/edit/${article.id}`);
          break;
        case 'publish':
          handlePublishArticle(article.id);
          break;
        case 'unpublish':
          handleUnpublishArticle(article.id);
          break;
        case 'delete':
          handleDeleteArticle(article.id);
          break;
        default:
          break;
      }
    };

    return (
      <div className="relative dropdown-container">
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isOpen 
              ? (isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')
              : (isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700')
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border z-50 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="py-1">
              {hasPermission('platform.documentation.edit') && (
                <button
                  onClick={() => handleAction('edit')}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              
              {hasPermission('platform.documentation.edit') && (
                <button
                  onClick={() => handleAction(article.isPublished ? 'unpublish' : 'publish')}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                    isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {article.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {article.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
              
              {hasPermission('platform.documentation.delete') && (
                <button
                  onClick={() => handleAction('delete')}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                    isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleDeleteArticle = async (articleId) => {
    if (!hasPermission('platform.documentation.delete')) {
      displayToast('error', 'You need delete permissions');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }
    
    try {
      await deleteArticle(articleId);
      displayToast('success', 'Article deleted successfully!');
      loadData();
    } catch (error) {
      displayToast('error', 'Failed to delete article: ' + error.message);
    }
  };

  const handlePublishArticle = async (articleId) => {
    if (!hasPermission('platform.documentation.edit')) {
      displayToast('error', 'You need edit permissions');
      return;
    }
    
    try {
      await patchArticle(articleId, {
        isPublished: true,
        status: 'published',
        publishedAt: new Date().toISOString()
      });
      displayToast('success', 'Article published successfully!');
      loadData();
    } catch (error) {
      displayToast('error', 'Failed to publish article: ' + error.message);
    }
  };

  const handleUnpublishArticle = async (articleId) => {
    if (!hasPermission('platform.documentation.edit')) {
      displayToast('error', 'You need edit permissions');
      return;
    }
    
    try {
      await patchArticle(articleId, {
        isPublished: false,
        status: 'draft'
      });
      displayToast('success', 'Article unpublished successfully!');
      loadData();
    } catch (error) {
      displayToast('error', 'Failed to unpublish article: ' + error.message);
    }
  };


  // Table columns configuration
  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      cellRenderer: (value, row) => (
        <div>
          <div className={`font-medium transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{value}</div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.slug}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      cellRenderer: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
          {value}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cellRenderer: (value, row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
          row.isPublished 
            ? (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800')
            : (isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800')
        }`}>
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      cellRenderer: (value, row) => (
        <span className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {row.category?.name || 'Uncategorized'}
        </span>
      )
    },
    {
      header: 'Views',
      accessor: 'viewCount',
      cellRenderer: (value) => (
        <span className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {value || 0}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      cellRenderer: (value) => (
        <span className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cellRenderer: (value, row) => (
        <ActionsDropdown
          article={row}
          isOpen={openDropdown === row.id}
          onToggle={() => toggleDropdown(row.id)}
        />
      )
    }
  ];

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Loading...</h1>
          <p className={`transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Authentication Required</h1>
          <p className={`mb-6 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please log in to access the admin dashboard.</p>
          <ButtonV1 
            onClick={() => redirectToLogin('/admin')}
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
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <h2 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDark ? 'text-red-400' : 'text-red-800'}`}>Access Denied</h2>
          <p className={`transition-colors duration-200 ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Authentication required')) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
          <h2 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>Authentication Required</h2>
          <p className={`mb-4 transition-colors duration-200 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>{error}</p>
          <div className="space-y-4">
            <p className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Please make sure you are logged in and have the proper permissions.
            </p>
            <div className="flex gap-4">
              <ButtonV1 
                onClick={() => window.location.href = '/signin'}
                bgColor="#DE5E08"
                textColor="white"
              >
                Go to Login
              </ButtonV1>
              <ButtonV1 
                onClick={() => {
                  setError(null);
                  setDataLoaded(false);
                  loadData();
                }}
                bgColor="#10B981"
                textColor="white"
              >
                Retry
              </ButtonV1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-10">
        <div>
          <h1 className={`text-3xl font-bold transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Documentation Management</h1>
          <p className={`mt-2 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage articles, categories, and content</p>
        </div>
        

      </div>

      {/* Search */}
      <div className={`mt-10 mb-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            placeholder="Search articles..."
            isDark={isDark}
            className="py-6"
            value={filters.search}
            width="20vw"
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            
          />
          {hasPermission('platform.documentation.create') && (
            <ButtonV1
              onClick={() => navigate('/admin/create')}
              isDark={isDark}
              leftIcon={<span className="mr-2 text-lg">+</span>}
              className="flex items-center gap-2"
              bgColor="white"
              textColor="black"
              border="1px solid #01274D"
             
            >
              Create
            </ButtonV1>
          )}
        </div>
      </div>


      {/* Articles Table */}
      <div className={`transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <TableV1
          columns={columns}
          data={Array.isArray(articles) ? articles : []}
          showCheckbox={false}
          showPagination={true}
          initialRowsPerPage={10}
          noDataMessage="No articles found"
          loading={loading}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className={`border rounded-lg p-4 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`text-2xl font-bold transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{pagination.total}</div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Articles</div>
        </div>
        <div className={`border rounded-lg p-4 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-green-600">
            {Array.isArray(articles) ? articles.filter(a => a.isPublished).length : 0}
          </div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Published (Current Page)</div>
        </div>
        <div className={`border rounded-lg p-4 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-yellow-600">
            {Array.isArray(articles) ? articles.filter(a => !a.isPublished).length : 0}
          </div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Drafts (Current Page)</div>
        </div>
        <div className={`border rounded-lg p-4 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-blue-600">{Array.isArray(categories) ? categories.length : 0}</div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Categories</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

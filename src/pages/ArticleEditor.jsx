import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { Editor } from '@tinymce/tinymce-react';
import { config } from '../config/environment';
import { 
  getArticles, 
  getPublicArticles,
  getArticleById,
  getCategories, 
  createArticle, 
  patchArticle,
  createCategory,
  deleteCategory,
  uploadFileToS3,
  deleteFileFromS3
} from '../lib/api/documentation.api';

// Import your existing design components
import ButtonV1 from '../Design Library/Button/ButtonV1';
import IconInput from '../Design Library/Inputs/IconInput';
import DropdownV1 from '../Design Library/DropDown/DropDownV1';
import { displayToast } from '../Design Library/Toast/Toast';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasPermission, redirectToLogin, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [articleScope, setArticleScope] = useState('platform');
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadingRef = useRef(false);
  const initialLoadRef = useRef(false);
  
  // Category management state
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    slug: '', 
    icon: '📚', 
    orderIndex: 0, 
    isExpanded: false
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: 'article',
    scope: 'platform',
    categoryId: '',
    orderIndex: 0,
    isPublished: false,
    status: 'draft',
    readingTime: 0,
    publishedAt: '',
    // FAQ fields
    faqs: [],
    originalFAQs: [], // Store original FAQs for comparison
    newFaq: { question: '', answer: '', orderIndex: 0 },
    // Related topics
    relatedTopics: [],
    // File upload
    attachments: []
  });

  // Check permissions and load data when id or auth changes
  useEffect(() => {
    console.log('=== USEEFFECT TRIGGERED ===');
    console.log('Dependencies changed:', { id, authLoading, isAuthenticated });
    console.log('Current state:', { isEdit, dataLoaded });
    
    let mounted = true;
    
    const initializeEditor = async () => {
      console.log('initializeEditor called');
      console.log('Auth state:', { authLoading, isAuthenticated });
      
      // Wait for authentication to load
      if (authLoading) {
        console.log('Auth still loading, skipping...');
        return;
      }
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        redirectToLogin(`/admin/${isEdit ? 'edit' : 'create'}/${id || ''}`);
        return;
      }
      
      const requiredPermission = isEdit ? 'platform.documentation.edit' : 'platform.documentation.create';
      if (!hasPermission(requiredPermission)) {
        console.log('No permission:', requiredPermission);
        setError(`Access denied: You need ${requiredPermission} permission`);
        return;
      }
      
      console.log('All checks passed, proceeding with data load');
      
      // Load data when id changes or when auth is ready
      if (mounted) {
        // Reset data loaded state when id changes
        if (isEdit) {
          console.log('Resetting form data for edit mode');
          setDataLoaded(false);
          setFormData({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            type: 'article',
            scope: 'platform',
            categoryId: '',
            orderIndex: 0,
            isPublished: false,
            status: 'draft',
            readingTime: 0,
            publishedAt: '',
            faqs: [],
            originalFAQs: [],
            newFaq: { question: '', answer: '', orderIndex: 0 },
            relatedTopics: [],
            attachments: []
          });
        }
        
        const timer = setTimeout(() => {
          if (mounted) {
            console.log('Calling loadInitialData...');
            loadInitialData();
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    };
    
    initializeEditor();
    
    return () => {
      console.log('useEffect cleanup');
      mounted = false;
    };
  }, [id, authLoading, isAuthenticated]); // Add id to dependencies


  async function loadInitialData() {
    console.log('=== loadInitialData called ===');
    console.log('Current state:', { 
      loadingRef: loadingRef.current, 
      isEdit, 
      id,
      dataLoaded 
    });
    
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('ArticleEditor: Already loading, skipping...');
      return;
    }
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Reset initial load ref for new article
      initialLoadRef.current = false;
      
      console.log('Starting data load...');
      
      // Load categories
      const categoriesData = await getCategories({ isActive: true });
      setCategories(categoriesData.data || []);
      
      // Load all articles for related topics dropdown using public API
      console.log('Loading articles with scope:', articleScope);
      try {
        const articlesData = await getPublicArticles({ 
          scope: articleScope // Get articles from selected scope
        });
        console.log('Articles loaded successfully:', articlesData);
        // The API returns { data: { articles: [...] } } structure
        setAllArticles(articlesData.data?.articles || []);
      } catch (error) {
        console.error('Failed to load articles with scope, trying without scope:', error);
        // Fallback: try without scope parameter
        try {
          const articlesData = await getPublicArticles({});
          console.log('Articles loaded without scope:', articlesData);
          setAllArticles(articlesData.data?.articles || []);
        } catch (fallbackError) {
          console.error('Failed to load articles even without scope:', fallbackError);
          setAllArticles([]);
        }
      }
      
      // Load article data if editing
      if (isEdit) {
        console.log('=== ARTICLE EDIT DEBUG ===');
        console.log('Article ID from URL:', id);
        console.log('isEdit flag:', isEdit);
        
        try {
          const articlesData = await getArticleById(id);
          console.log('Raw API response:', articlesData);
          const dataPayload = articlesData?.data;
          const article = Array.isArray(dataPayload) ? dataPayload[0] : dataPayload;
          console.log('Normalized article object:', article);
          
          if (article && typeof article === 'object') {
            const newFormData = {
              title: article.title || '',
              slug: article.slug || '',
              content: article.content || '',
              excerpt: article.excerpt || '',
              type: article.type || 'article',
              scope: article.scope || 'platform',
              categoryId: article.categoryId || '',
              orderIndex: article.orderIndex || 0,
              isPublished: article.isPublished || false,
              status: article.status || 'draft',
              readingTime: article.readingTime || 0,
              publishedAt: article.publishedAt || '',
              faqs: article.faqs || [],
              originalFAQs: [...(article.faqs || [])], // Store original FAQs for comparison
            newFaq: { question: '', answer: '', orderIndex: 0 },
            relatedTopics: article.relatedTopics || [],
            attachments: article.attachments || []
            };
            
            console.log('Setting form data:', newFormData);
            setFormData(newFormData);
            console.log('Form data set successfully');
          } else {
            console.error('No article object found in response');
            console.log('Full response:', articlesData);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          console.error('Error details:', {
            message: apiError.message,
            stack: apiError.stack
          });
        }
      } else {
        console.log('Not in edit mode, skipping article load');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setDataLoaded(true);
      loadingRef.current = false;
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toISOString(),
      s3FileId: null,
      s3Url: null,
      isUploaded: false
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    
    // Clear the input
    event.target.value = '';
  };

  const uploadFilesToS3 = async () => {
    const filesToUpload = formData.attachments.filter(att => !att.isUploaded);
    
    if (filesToUpload.length === 0) {
      displayToast('info', 'No files to upload');
      return;
    }

    // Check authentication before upload
    if (!isAuthenticated) {
      displayToast('error', 'Please log in to upload files');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadPromises = filesToUpload.map(async (attachment) => {
        try {
          const response = await uploadFileToS3(attachment.file);
          console.log('Upload response:', response); // Debug log
          
          // Extract from the actual API response structure
          const fileId = response.data?.file?.id;
          const fileUrl = response.data?.presignedUrl || response.data?.file?.url;
          
          console.log('Extracted fileId:', fileId, 'fileUrl:', fileUrl); // Debug log
          
          return {
            ...attachment,
            s3FileId: fileId,
            s3Url: fileUrl,
            isUploaded: true
          };
        } catch (error) {
          console.error(`Failed to upload ${attachment.name}:`, error);
          
          // Handle specific authentication errors
          if (error.message.includes('Invalid or expired context token')) {
            throw new Error('Authentication expired. Please refresh the page and try again.');
          } else if (error.message.includes('select platform context')) {
            throw new Error('Please select a platform context first before uploading files.');
          } else {
            throw new Error(`Failed to upload ${attachment.name}: ${error.message}`);
          }
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Update form data with uploaded file info
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.map(att => {
          const uploaded = uploadedFiles.find(uploaded => uploaded.id === att.id);
          return uploaded || att;
        })
      }));

      displayToast('success', `Successfully uploaded ${uploadedFiles.length} file(s)`);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message);
      displayToast('error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId) => {
    const attachment = formData.attachments.find(att => att.id === attachmentId);
    
    if (attachment && attachment.isUploaded && attachment.s3FileId) {
      try {
        await deleteFileFromS3(attachment.s3FileId);
        displayToast('success', 'File deleted from server');
      } catch (error) {
        console.error('Failed to delete file from server:', error);
        displayToast('warning', 'File removed locally but may still exist on server');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const copyUrlToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      displayToast('success', 'URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      displayToast('error', 'Failed to copy URL');
    }
  };

  // Process FAQ operations for smart patch API
  const processFAQOperations = () => {
    const operations = {};
    
    // Get original FAQs from when the article was loaded
    const originalFAQs = formData.originalFAQs || [];
    const currentFAQs = formData.faqs || [];
    
    console.log('Processing FAQ operations:');
    console.log('Original FAQs:', originalFAQs);
    console.log('Current FAQs:', currentFAQs);
    
    // Find FAQs to add (new FAQs without server IDs)
    const newFAQs = currentFAQs.filter(faq => !faq.id || faq.id.startsWith('temp-faq-'));
    if (newFAQs.length > 0) {
      // For now, just add the first new FAQ (API might only support one at a time)
      const newFAQ = newFAQs[0];
      operations.addFAQ = {
        question: newFAQ.question,
        answer: newFAQ.answer,
        orderIndex: newFAQ.orderIndex || 0,
        isPublished: true
      };
      console.log('Adding new FAQ:', operations.addFAQ);
    }
    
    // Find FAQs to update (existing FAQs with server IDs that have changed)
    const existingFAQs = currentFAQs.filter(faq => faq.id && !faq.id.startsWith('temp-faq-'));
    const updatedFAQs = existingFAQs.filter(currentFaq => {
      const originalFaq = originalFAQs.find(orig => orig.id === currentFaq.id);
      if (!originalFaq) return false;
      
      return (
        originalFaq.question !== currentFaq.question ||
        originalFaq.answer !== currentFaq.answer ||
        originalFaq.orderIndex !== currentFaq.orderIndex
      );
    });
    
    if (updatedFAQs.length > 0) {
      // For now, just update the first changed FAQ
      const updatedFAQ = updatedFAQs[0];
      operations.updateFAQ = {
        id: updatedFAQ.id,
        question: updatedFAQ.question,
        answer: updatedFAQ.answer,
        orderIndex: updatedFAQ.orderIndex || 0,
        isPublished: true
      };
      console.log('Updating FAQ:', operations.updateFAQ);
    }
    
    // Find FAQs to delete (FAQs that were in original but not in current)
    const deletedFAQs = originalFAQs.filter(originalFaq => 
      !currentFAQs.some(currentFaq => currentFaq.id === originalFaq.id)
    );
    
    if (deletedFAQs.length > 0) {
      // For now, just delete the first deleted FAQ
      operations.deleteFAQ = deletedFAQs[0].id;
      console.log('Deleting FAQ:', operations.deleteFAQ);
    }
    
    return operations;
  };

  const handleSave = async (publish = false) => {
    try {
      setSaving(true);
      setError(null);
      
      if (isEdit) {
        // For updates, use smart patch API with specific FAQ operations
        const patchData = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          type: formData.type,
          scope: formData.scope,
          categoryId: formData.categoryId || undefined,
          orderIndex: formData.orderIndex,
          isPublished: publish || formData.isPublished,
          status: publish ? 'published' : formData.status,
          readingTime: formData.readingTime,
          publishedAt: publish ? new Date().toISOString() : formData.publishedAt,
          relatedTopics: formData.relatedTopics,
          attachments: formData.attachments
        };
        
        // Process FAQ operations
        const faqOperations = processFAQOperations();
        Object.assign(patchData, faqOperations);
        
        console.log('Sending patch data:', patchData);
        await patchArticle(id, patchData);
      } else {
        // For creation, include FAQs directly
        const articleData = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          type: formData.type,
          scope: formData.scope,
          categoryId: formData.categoryId || undefined,
          orderIndex: formData.orderIndex,
          isPublished: publish || formData.isPublished,
          status: publish ? 'published' : formData.status,
          readingTime: formData.readingTime,
          publishedAt: publish ? new Date().toISOString() : formData.publishedAt,
          relatedTopics: formData.relatedTopics,
          faqs: formData.faqs,
          attachments: formData.attachments
        };
        
        await createArticle(articleData);
      }
      
      displayToast('success', `${isEdit ? 'Article updated' : 'Article created'} successfully!`);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to save article:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = () => {
    if (!formData.newFaq.question.trim() || !formData.newFaq.answer.trim()) {
      displayToast('warning', 'Please fill in both question and answer');
      return;
    }
    
    // For new FAQs, don't include an ID - let the server generate it
    const newFaq = {
      question: formData.newFaq.question.trim(),
      answer: formData.newFaq.answer.trim(),
      orderIndex: formData.newFaq.orderIndex || 0,
      isPublished: true
    };
    
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
      newFaq: { question: '', answer: '', orderIndex: 0 }
    }));
  };

  const removeFAQ = (faqId) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((faq, index) => {
        // If FAQ has an ID, compare by ID
        if (faq.id) {
          return faq.id !== faqId;
        }
        // For FAQs without IDs, compare by the temp ID we generate
        const tempId = `temp-faq-${index}`;
        return tempId !== faqId;
      })
    }));
  };

  const updateFAQ = (faqId, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, index) => {
        // Match by ID if available, otherwise by temp ID for temporary FAQs
        if (faq.id) {
          return faq.id === faqId ? { ...faq, [field]: value } : faq;
        }
        const tempId = `temp-faq-${index}`;
        return tempId === faqId ? { ...faq, [field]: value } : faq;
      })
    }));
  };

  // Related topics management functions
  const handleRelatedTopicsChange = (selectedArticleIds) => {
    setFormData(prev => ({
      ...prev,
      relatedTopics: selectedArticleIds
    }));
  };

  const removeRelatedTopic = (articleId) => {
    setFormData(prev => ({
      ...prev,
      relatedTopics: prev.relatedTopics.filter(id => id !== articleId)
    }));
  };

  // Function to reload articles when scope changes
  const reloadArticles = async (scope) => {
    try {
      const articlesData = await getPublicArticles({ 
        scope: scope
      });
      setAllArticles(articlesData.data?.articles || []);
    } catch (error) {
      console.error('Failed to load articles with scope, trying without scope:', error);
      // Fallback: try without scope parameter
      try {
        const articlesData = await getPublicArticles({});
        setAllArticles(articlesData.data?.articles || []);
      } catch (fallbackError) {
        console.error('Failed to load articles even without scope:', fallbackError);
        setAllArticles([]);
      }
    }
  };

  const handleScopeChange = (newScope) => {
    setArticleScope(newScope);
    reloadArticles(newScope);
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      displayToast('warning', 'Please enter a category name');
      return;
    }

    if (!newCategory.slug.trim()) {
      displayToast('warning', 'Please enter a category slug');
      return;
    }

    try {
      setCreatingCategory(true);
      setError(null);

      const categoryData = {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim(),
        scope: 'platform',
        icon: newCategory.icon || '📚',
        orderIndex: newCategory.orderIndex || 0,
        isActive: true,
        isExpanded: newCategory.isExpanded || false
      };
      

      const response = await createCategory(categoryData);
      
      // Refresh categories list
      const categoriesData = await getCategories({ isActive: true });
      setCategories(categoriesData.data || []);
      
      // Clear form
      setNewCategory({ 
        name: '', 
        slug: '', 
        icon: '📚', 
        orderIndex: 0, 
        isExpanded: false
      });
      
      displayToast('success', 'Category created successfully!');
    } catch (error) {
      console.error('Failed to create category:', error);
      setError(error.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    // Handle both object and string formats
    const categoryId = typeof selectedCategoryToDelete === 'object' 
      ? selectedCategoryToDelete?.value 
      : selectedCategoryToDelete;
    
    if (!categoryId) {
      displayToast('warning', 'Please select a category to delete');
      return;
    }

    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    
    if (!categoryToDelete) {
      displayToast('error', 'Selected category not found');
      return;
    }

    try {
      setDeletingCategory(true);
      setError(null);

      await deleteCategory(categoryId);
      
      // Refresh categories list
      const categoriesData = await getCategories({ isActive: true });
      setCategories(categoriesData.data || []);
      
      // Clear selected category if it was deleted
      if (formData.categoryId === categoryId) {
        setFormData(prev => ({ ...prev, categoryId: '' }));
      }
      
      // Clear the delete selection
      setSelectedCategoryToDelete('');
      
      displayToast('success', 'Category deleted successfully!');
    } catch (error) {
      console.error('Failed to delete category:', error);
      
      // Show user-friendly error message
      if (error.message.includes('Cannot delete category with articles')) {
        displayToast('error', 'Cannot delete this category because it contains articles. Please move or delete the articles first, then try deleting the category again.');
      } else {
        displayToast('error', error.message);
      }
    } finally {
      setDeletingCategory(false);
    }
  };

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
          <p className={`mb-6 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please log in to access the article editor.</p>
          <ButtonV1 
            onClick={() => redirectToLogin(`/admin/${isEdit ? 'edit' : 'create'}/${id || ''}`)}
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
          <h2 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDark ? 'text-red-300' : 'text-red-800'}`}>Access Denied</h2>
          <p className={`transition-colors duration-200 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse">
          <div className={`h-8 rounded w-1/4 mb-6 transition-colors duration-200 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="space-y-4">
            <div className={`h-4 rounded transition-colors duration-200 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-5/6 transition-colors duration-200 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-4/6 transition-colors duration-200 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log current form data
  console.log('=== RENDER DEBUG ===');
  console.log('Current formData:', formData);
  console.log('Component state:', { isEdit, id, loading, dataLoaded });

  return (
    <div className={`max-w-4xl pt-10 mx-auto p-6 pb-20 transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {isEdit ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className={`mt-2 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isEdit ? 'Update article content and settings' : 'Create a new documentation article'}
          </p>
        </div>
      </div>
      <div className='flex justify-end items-center mb-8'>
      <div className="flex gap-3">
          <ButtonV1
            onClick={() => navigate('/admin')}
            bgColor="#6B7280"
            textColor="white"
          >
            Cancel
          </ButtonV1>
          <ButtonV1
            onClick={() => handleSave(false)}
            disabled={saving}
            bgColor="#3B82F6"
            textColor="white"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </ButtonV1>
          <ButtonV1
            onClick={() => handleSave(true)}
            disabled={saving}
            bgColor="#10B981"
            textColor="white"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </ButtonV1>
        </div>
      </div>
        
       
      </div>

      {/* Error Display */}
      {error && (
        <div className={`border rounded-lg p-4 mb-6 transition-colors duration-200 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <p className={`transition-colors duration-200 ${isDark ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
        </div>
      )}

           {/* Category Management */}
           <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Category Management</h2>
          
           {/* Create New Category */}
           <div className={` p-4 mb-4 transition-colors duration-200 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
             <h3 className={`text-lg font-medium mb-3 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Create New Category</h3>
             <div className="space-y-4">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category Name *</label>
                   <IconInput
                     placeholder="Category name"
                     value={newCategory.name}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                     width="100%"
                     height="40px"
                     backgroundColor={isDark ? '#374151' : '#fff'}
                     textColor={isDark ? '#f3f4f6' : '#01274D'}
                     border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                   />
                 </div>
                 <div>
                   <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category Slug *</label>
                   <IconInput
                     placeholder="category-slug"
                     value={newCategory.slug}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                     width="100%"
                     height="40px"
                     backgroundColor={isDark ? '#374151' : '#fff'}
                     textColor={isDark ? '#f3f4f6' : '#01274D'}
                     border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                   />
                 </div>
               </div>

               {/* Icon and Order */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
                   <IconInput
                     placeholder="📚"
                     value={newCategory.icon}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                     width="100%"
                     height="40px"
                     backgroundColor={isDark ? '#374151' : '#fff'}
                     textColor={isDark ? '#f3f4f6' : '#01274D'}
                     border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                   />
                 </div>
                 <div>
                   <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Order Index</label>
                   <IconInput
                     type="number"
                     placeholder="0"
                     value={newCategory.orderIndex}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                     width="100%"
                     height="40px"
                     backgroundColor={isDark ? '#374151' : '#fff'}
                     textColor={isDark ? '#f3f4f6' : '#01274D'}
                     border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                   />
                 </div>
               </div>


               {/* Settings */}
               <div className="flex items-center space-x-4">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={newCategory.isExpanded}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, isExpanded: e.target.checked }))}
                     className={`mr-2 rounded transition-colors duration-200 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                   />
                   <span className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                     Expanded by default
                   </span>
                 </label>
               </div>

               <ButtonV1
                 onClick={handleCreateCategory}
                 disabled={creatingCategory}
                 bgColor="#10B981"
                 textColor="white"
               >
                 {creatingCategory ? 'Creating...' : 'Create Category'}
               </ButtonV1>
             </div>
           </div>
          
          {/* Delete Existing Category */}
          {categories.length > 0 && (
            <div className={` p-4 transition-colors duration-200 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-3 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Delete Existing Category</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Category to Delete</label>
                  <DropdownV1
                    options={[
                      { label: 'Select a category...', value: '' },
                      ...categories.map(cat => ({ 
                        label: `${cat.name}${cat.description ? ` - ${cat.description}` : ''}`, 
                        value: cat.id 
                      }))
                    ]}
                    value={selectedCategoryToDelete}
                    onSelect={(value) => setSelectedCategoryToDelete(value)}
                    width="100%"
                    backgroundColor={isDark ? '#374151' : '#fff'}
                    textColor={isDark ? '#f3f4f6' : '#4B5563'}
                    border={isDark ? '1px solid #4B5563' : '1px solid #111'}
                    dropdownBg={isDark ? '#374151' : '#fff'}
                    hoverBg={isDark ? '#4B5563' : '#f3f4f6'}
                  />
                </div>
                <ButtonV1
                  onClick={handleDeleteCategory}
                  disabled={deletingCategory || !selectedCategoryToDelete}
                  bgColor="#EF4444"
                  textColor="white"
                >
                  {deletingCategory ? 'Deleting...' : 'Delete Category'}
                </ButtonV1>
              </div>
            </div>
          )}
        </div>

      {/* Form */}
      <div className="space-y-6 mt-10">
        {/* Basic Information */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
              <IconInput
                placeholder="Article title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Slug *</label>
              <IconInput
                placeholder="article-slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Excerpt</label>
            <IconInput
              placeholder="Brief description of the article"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              width="100%"
              height="40px"
              backgroundColor={isDark ? '#374151' : '#fff'}
              textColor={isDark ? '#f3f4f6' : '#01274D'}
              border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Attachments</h2>
          
          <div className="space-y-4">
            {/* File Upload Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Files
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 transition-colors duration-200 ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium">Click to select files</span>
                  <span className="text-xs">PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR, MP4, AVI, MOV, WMV, FLV, WEBM, MKV, M4V</span>
                </label>
              </div>
            </div>

                              {/* Uploaded Files List */}
            {formData.attachments.length > 0 && (
              <div>
                <h3 className={`text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Files ({formData.attachments.length})
                </h3>
                <div className="space-y-3">
                  {formData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`p-4 rounded-lg transition-colors duration-200 ${
                        isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded transition-colors duration-200 ${
                            isDark ? 'bg-gray-600' : 'bg-gray-200'
                          }`}>
                            {attachment.type.startsWith('video/') ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            ) : attachment.type.startsWith('image/') ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium transition-colors duration-200 ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {attachment.name}
                            </p>
                            <p className={`text-xs transition-colors duration-200 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {attachment.isUploaded ? (
                            <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                              isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                            }`}>
                              ✓ Uploaded
                            </span>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                              isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              ⏳ Pending
                            </span>
                          )}
                          
                          {attachment.isUploaded && (
                            <button
                              onClick={() => {
                                if (attachment.s3Url) {
                                  copyUrlToClipboard(attachment.s3Url);
                                } else {
                                  // Fallback: copy file ID or show debug info
                                  const urlToCopy = attachment.s3FileId ? `File ID: ${attachment.s3FileId}` : 'No URL available';
                                  copyUrlToClipboard(urlToCopy);
                                  console.log('No S3 URL found, copied file ID instead:', attachment.s3FileId);
                                }
                              }}
                              className={`p-1 rounded transition-colors duration-200 ${
                                isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                              }`}
                              title={attachment.s3Url ? "Copy URL" : "Copy File ID (URL not available)"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                          
                          <ButtonV1
                            onClick={() => removeAttachment(attachment.id)}
                            bgColor="#EF4444"
                            textColor="white"
                            className="text-xs px-2 py-1"
                          >
                            Remove
                          </ButtonV1>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {formData.attachments.some(att => !att.isUploaded) && (
              <div className="flex justify-end">
                <ButtonV1
                  onClick={uploadFilesToS3}
                  disabled={uploading}
                  bgColor="#3B82F6"
                  textColor="white"
                >
                  {uploading ? 'Uploading...' :  'Upload File'}
                </ButtonV1>
              </div>
            )}


          </div>
        </div>

        {/* Content */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Content</h2>
          
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Article Content *</label>
            <div className={`border rounded-lg overflow-hidden transition-colors duration-200 ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <Editor
                apiKey={config.TINYMCE_API_KEY}
                value={formData.content}
                onEditorChange={(content) => handleInputChange('content', content)}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: isDark 
                    ? 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; background-color: #374151; color: #f3f4f6; }'
                    : 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; background-color: #ffffff; color: #111827; }',
                  skin: isDark ? 'oxide-dark' : 'oxide',
                  content_css: isDark ? 'dark' : 'default',
                  branding: false,
                  promotion: false
                }}
              />
            </div>
          </div>
        </div>

        {/* Related Topics */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Related Articles</h2>
          
          {/* Scope Selector */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Article Scope
            </label>
            <DropdownV1
              options={[
                { label: 'Platform Articles', value: 'platform' },
                { label: 'Organization Articles', value: 'organization' },
                { label: 'Branch Articles', value: 'branch' }
              ]}
              value={articleScope}
              onSelect={handleScopeChange}
              width="200px"
              backgroundColor={isDark ? '#374151' : '#fff'}
              textColor={isDark ? '#f3f4f6' : '#4B5563'}
              border={isDark ? '1px solid #4B5563' : '1px solid #111'}
              dropdownBg={isDark ? '#374151' : '#fff'}
              hoverBg={isDark ? '#4B5563' : '#f3f4f6'}
            />
          </div>
          
          {/* Multi-Select Articles Dropdown */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Related Articles ({allArticles.length} available)
            </label>
            <div className={`border rounded-lg p-3 transition-colors duration-200 ${
              isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
            }`}>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allArticles.map((article) => {
                  const isSelected = formData.relatedTopics.includes(article.id);
                  return (
                    <label
                      key={article.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors duration-200 ${
                        isSelected 
                          ? (isDark ? 'bg-blue-900/30' : 'bg-blue-100')
                          : (isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50')
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleRelatedTopicsChange([...formData.relatedTopics, article.id]);
                          } else {
                            removeRelatedTopic(article.id);
                          }
                        }}
                        className={`rounded transition-colors duration-200 ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                      />
                      <div className="flex-1">
                        <div className={`font-medium transition-colors duration-200 ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {article.title}
                        </div>
                        <div className={`text-sm transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                            isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {article.type}
                          </span>
                          {article.scope} • {article.slug}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Selected Articles Summary */}
          {formData.relatedTopics.length > 0 && (
            <div>
              <h3 className={`text-lg font-medium mb-3 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Selected Articles ({formData.relatedTopics.length})
              </h3>
              <div className="space-y-2">
                {formData.relatedTopics.map((articleId) => {
                  const article = allArticles.find(a => a.id === articleId);
                  if (!article) return null;
                  
                  return (
                    <div
                      key={articleId}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                          isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {article.type}
                        </span>
                        <div>
                          <span className={`font-medium transition-colors duration-200 ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {article.title}
                          </span>
                          <div className={`text-xs transition-colors duration-200 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {article.scope} • {article.slug}
                          </div>
                        </div>
                      </div>
                      <ButtonV1
                        onClick={() => removeRelatedTopic(articleId)}
                        bgColor="#EF4444"
                        textColor="white"
                        className="text-xs px-2 py-1"
                      >
                        Remove
                      </ButtonV1>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <p className={`text-sm mt-4 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select related articles from the list above. These will be shown as related articles to readers.
          </p>
        </div>

        {/* Settings */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
              <DropdownV1
                options={[
                  { label: 'Article', value: 'article' },
                  { label: 'Tutorial', value: 'tutorial' },
                  { label: 'Guide', value: 'guide' },
                  { label: 'FAQ', value: 'faq' },
                  { label: 'API Reference', value: 'api_reference' },
                  { label: 'Changelog', value: 'changelog' },
                  { label: 'Announcement', value: 'announcement' }
                ]}
                value={formData.type}
                onSelect={(value) => handleInputChange('type', value)}
                width="100%"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#4B5563'}
                border={isDark ? '1px solid #4B5563' : '1px solid #111'}
                dropdownBg={isDark ? '#374151' : '#fff'}
                hoverBg={isDark ? '#4B5563' : '#f3f4f6'}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Scope</label>
              <DropdownV1
                options={[
                  { label: 'Platform', value: 'platform' },
                  { label: 'Organization', value: 'organization' },
                  { label: 'Branch', value: 'branch' }
                ]}
                value={formData.scope}
                onSelect={(value) => handleInputChange('scope', value)}
                width="100%"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#4B5563'}
                border={isDark ? '1px solid #4B5563' : '1px solid #111'}
                dropdownBg={isDark ? '#374151' : '#fff'}
                hoverBg={isDark ? '#4B5563' : '#f3f4f6'}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
              <DropdownV1
                options={[
                  { label: 'No Category', value: '' },
                  ...categories.map(cat => ({ label: cat.name, value: cat.id }))
                ]}
                value={formData.categoryId}
                onSelect={(value) => handleInputChange('categoryId', value)}
                width="100%"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#4B5563'}
                border={isDark ? '1px solid #4B5563' : '1px solid #111'}
                dropdownBg={isDark ? '#374151' : '#fff'}
                hoverBg={isDark ? '#4B5563' : '#f3f4f6'}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reading Time (minutes)</label>
              <IconInput
                type="number"
                placeholder="5"
                value={formData.readingTime}
                onChange={(e) => handleInputChange('readingTime', parseInt(e.target.value) || 0)}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Order Index</label>
              <IconInput
                type="number"
                placeholder="0"
                value={formData.orderIndex}
                onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 0)}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className={`border rounded-lg p-6 transition-colors duration-200 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
          
          {/* Add New FAQ */}
          <div className={` p-4 mb-4 transition-colors duration-200 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-3 transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Add New FAQ</h3>
            <div className="space-y-3">
              <IconInput
                placeholder="Question"
                value={formData.newFaq.question}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newFaq: { ...prev.newFaq, question: e.target.value }
                }))}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
              <IconInput
                placeholder="Answer"
                value={formData.newFaq.answer}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newFaq: { ...prev.newFaq, answer: e.target.value }
                }))}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
              <IconInput
                type="number"
                placeholder="Order Index (0, 1, 2...)"
                value={formData.newFaq.orderIndex}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newFaq: { ...prev.newFaq, orderIndex: parseInt(e.target.value) || 0 }
                }))}
                width="100%"
                height="40px"
                backgroundColor={isDark ? '#374151' : '#fff'}
                textColor={isDark ? '#f3f4f6' : '#01274D'}
                border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
              />
              <ButtonV1
                onClick={addFAQ}
                bgColor="#3B82F6"
                textColor="white"
              >
                Add FAQ
              </ButtonV1>
            </div>
          </div>
          
          {/* Existing FAQs */}
          {formData.faqs.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-lg font-medium transition-colors duration-200 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Existing FAQs</h3>
              {formData.faqs.map((faq, index) => (
                <div key={faq.id || `temp-faq-${index}`} className={` p-4 transition-colors duration-200 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-sm font-medium transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>FAQ #{index + 1}</span>
                    <ButtonV1
                      onClick={() => removeFAQ(faq.id || `temp-faq-${index}`)}
                      bgColor="#EF4444"
                      textColor="white"
                      className="text-xs px-2 py-1"
                    >
                      Remove
                    </ButtonV1>
                  </div>
                  <div className="space-y-3">
                    <IconInput
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id || `temp-faq-${index}`, 'question', e.target.value)}
                      width="100%"
                      height="40px"
                      backgroundColor={isDark ? '#374151' : '#fff'}
                      textColor={isDark ? '#f3f4f6' : '#01274D'}
                      border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                    />
                    <IconInput
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id || `temp-faq-${index}`, 'answer', e.target.value)}
                      width="100%"
                      height="40px"
                      backgroundColor={isDark ? '#374151' : '#fff'}
                      textColor={isDark ? '#f3f4f6' : '#01274D'}
                      border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                    />
                    <IconInput
                      type="number"
                      placeholder="Order Index (0, 1, 2...)"
                      value={faq.orderIndex || 0}
                      onChange={(e) => updateFAQ(faq.id || `temp-faq-${index}`, 'orderIndex', parseInt(e.target.value) || 0)}
                      width="100%"
                      height="40px"
                      backgroundColor={isDark ? '#374151' : '#fff'}
                      textColor={isDark ? '#f3f4f6' : '#01274D'}
                      border={isDark ? '1px solid #4B5563' : '1px solid #01274D'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;

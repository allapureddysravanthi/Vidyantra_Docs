import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Documentation_Layout from './components/Documentation_Layout';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ScopePage from './components/ScopePage';
import Signin from './pages/Login';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Organization from './pages/Organization';
import Branch from './pages/Branch';
import ArticlePage from './pages/ArticlePage';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';
import ArticleEditor from './pages/ArticleEditor';
import FeedbackAnalytics from './pages/FeedbackAnalytics';
import { NavigationProvider } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { handleTokenFromUrl } from './utils/tokenHandler';

const App = () => {
  // Handle token from URL on app initialization
  useEffect(() => {
    handleTokenFromUrl();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <NavigationProvider>
          <Routes>
          {/* All Routes with Layout */}
          <Route path="/" element={<Documentation_Layout />}>
            <Route index element={<Home />} />
            
            {/* Protected Article Routes by ID - Must come before general routes */}
            <Route path="platform/article/:id" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            <Route path="organization/article/:id" element={<ArticlePage />} />
            <Route path="branch/article/:id" element={<ArticlePage />} />
            
            {/* Protected Article Routes by Slug - Must come before general routes */}
            <Route path="platform/doc/:slug" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            <Route path="organization/doc/:slug" element={<ArticlePage />} />
            <Route path="branch/doc/:slug" element={<ArticlePage />} />
            
            {/* Protected Platform Routes - Must come after specific routes */}
            <Route path="platform" element={
              <ProtectedRoute>
                <ScopePage scope="platform" StaticComponent={Platform} />
              </ProtectedRoute>
            } />
            <Route path="organization" element={
              <ScopePage scope="organization" StaticComponent={Organization} />
            } />
            <Route path="branch" element={
              <ScopePage scope="branch" StaticComponent={Branch} />
            } />
            
            {/* Protected Search Routes */}
            <Route path="platform/search" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            <Route path="organization/search" element={<SearchResults />} />
            <Route path="branch/search" element={<SearchResults />} />
            
            {/* Protected Admin Routes */}
            <Route path="admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/create" element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            } />
            <Route path="admin/edit/:id" element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            } />
            <Route path="admin/feedback" element={
              <ProtectedRoute>
                <FeedbackAnalytics />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="/signin" element={<Signin />} />
          <Route path="*" element={<NotFound/>} />
          </Routes>
        </NavigationProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

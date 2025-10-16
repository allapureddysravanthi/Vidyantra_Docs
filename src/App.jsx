import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Documentation_Layout from './components/Documentation_Layout';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
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
            <Route path="organization/article/:id" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            <Route path="branch/article/:id" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            
            {/* Protected Article Routes by Slug - Must come before general routes */}
            <Route path="platform/doc/:slug" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            <Route path="organization/doc/:slug" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            <Route path="branch/doc/:slug" element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            } />
            
            {/* Protected Platform Routes - Must come after specific routes */}
            <Route path="platform" element={
              <ProtectedRoute>
                <Platform />
              </ProtectedRoute>
            } />
            <Route path="organization" element={
              <ProtectedRoute>
                <Organization />
              </ProtectedRoute>
            } />
            <Route path="branch" element={
              <ProtectedRoute>
                <Branch />
              </ProtectedRoute>
            } />
            
            {/* Protected Search Routes */}
            <Route path="platform/search" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            <Route path="organization/search" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            <Route path="branch/search" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            
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

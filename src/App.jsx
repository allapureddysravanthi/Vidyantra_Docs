import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Documentation_Layout from './components/Documentation_Layout';
import NotFound from './components/NotFound';
import Signin from './pages/Login';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Organization from './pages/Organization';
import Branch from './pages/Branch';
import { NavigationProvider } from './contexts/NavigationContext';

const App = () => {

  return (
    <Router>
      <NavigationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Documentation_Layout />}>
            <Route index element={<Home />} />
            <Route path="platform" element={<Platform />} />
            <Route path="organization" element={<Organization />} />
            <Route path="branch" element={<Branch />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </NavigationProvider>
    </Router>
  );
};

export default App;

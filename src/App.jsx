import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Documentation_Layout from './components/Documentation_Layout';
import NotFound from './components/NotFound';
const App = () => {

  return (
<> 
<Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Documentation_Layout />} />
         <Route path="*" element={<NotFound/>} />
   
      </Routes>
    </Router>

</>
  );
};

export default App;

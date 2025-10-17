import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from 'react'
import Navbar from "./Navbar";
import { useTheme } from "../contexts/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <>
        <Navbar />
    
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-[#ffefea]'
    }`}>
  
      <div className={`w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 ${
        isDark ? 'bg-gray-800/50 rounded-2xl p-8 shadow-2xl' : ''
      }`}>
        {/* Left Side - Image */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2"
        >
          <img 
            src="https://qubinest-internal.s3.ap-south-1.amazonaws.com/Qubinest+Static/404+Image/404+image.png"
            alt="404 Illustration"
            className="w-full h-auto"
          />
        </motion.div>

        {/* Right Side - Content */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full lg:w-1/2 text-center lg:text-left"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`text-4xl md:text-6xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Oops! It looks like you're lost.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`text-lg mb-8 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            The page you're looking for isn't available. Try to search again or use the go to.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className={`px-8 py-3 rounded-lg font-medium 
                     transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2 ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-[#14183E] text-white hover:bg-[#0f1228]'
            }`}
          >
            Go Back To Homepage
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 10" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
    
    </>
  );
};

export default NotFound;
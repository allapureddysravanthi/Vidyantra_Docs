import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ButtonV2 from '../Design Library/Button/ButtonV2';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Signin = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login data:', formData);
      // Handle successful login here
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    border: `1px solid ${errors.email || errors.password ? '#EF4444' : (isDark ? '#374151' : '#D1D5DB')}`,
    borderRadius: '8px',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    color: isDark ? '#FFFFFF' : '#1F2937',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s, background-color 0.3s, color 0.3s'
  };

  const inputFocusStyle = {
    borderColor: isDark ? '#FFFFFF' : '#1F2937'
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w- flex items-center justify-center">
            <img
              src={isDark 
                ? "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550356/Group_15_ef35s1.png"
                : "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550717/Group_23_1_iax3ik.png"
              }
              alt="Logo"
              className="h-12 w-auto"
            />
          </div>

          <p className={`mt-2 text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email address
              </label>
               <div className="relative">
                 <input
                   id="email"
                   name="email"
                   type="email"
                   autoComplete="email"
                   required
                   value={formData.email}
                   onChange={handleInputChange}
                   style={inputStyle}
                   onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                   onBlur={(e) => e.target.style.borderColor = errors.email ? '#EF4444' : (isDark ? '#374151' : '#D1D5DB')}
                   placeholder="Enter your email"
                 />
               </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
               <div className="relative">
                 <input
                   id="password"
                   name="password"
                   type={showPassword ? 'text' : 'password'}
                   autoComplete="current-password"
                   required
                   value={formData.password}
                   onChange={handleInputChange}
                   style={inputStyle}
                   onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                   onBlur={(e) => e.target.style.borderColor = errors.password ? '#EF4444' : (isDark ? '#374151' : '#D1D5DB')}
                   className="pr-10"
                   placeholder="Enter your password"
                 />
                 <button
                   type="button"
                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
                   onClick={() => setShowPassword(!showPassword)}
                 >
                   {showPassword ? (
                     <EyeOff className={`h-5 w-5 transition-colors duration-200 ${
                       isDark ? 'text-gray-400' : 'text-gray-500'
                     }`} />
                   ) : (
                     <Eye className={`h-5 w-5 transition-colors duration-200 ${
                       isDark ? 'text-gray-400' : 'text-gray-500'
                     }`} />
                   )}
                 </button>
               </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>


          {/* Submit Button */}
          <div>
            <ButtonV2
              type="submit"
              disabled={isLoading}
              width="100%"
              height="48px"
              textColor={isDark ? "#FFFFFF" : "#FFFFFF"}
              bgColor={isDark ? "#1F2937" : "#1F2937"}
              border={isDark ? "1px solid #ffffff" : "1px solid #1F2937"}
              hoverBgColor={isDark ? "#374151" : "#374151"}
              customStyle={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </ButtonV2>
          </div>


        </form>
                {/* Back Button */}
                <div className="flex justify-center">
          <button
            onClick={handleBackClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signin;

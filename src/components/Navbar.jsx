import React, { useState, useRef, useEffect } from "react";
import { IoMdLogOut } from "react-icons/io";
import { Menu, Search, Bell, HelpCircle, Sun, Moon, User, Settings, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ButtonV2 from "../Design Library/Button/ButtonV2";
import SearchInput from "../Design Library/SearchInput/SearchInput";
import SearchResults from "./SearchResults";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../hooks/useAuth";
import { useSearch } from "../hooks/useSearch";
import { displayToast } from "../Design Library/Toast/Toast";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNavbarSearch, searchValue, setSearchValue, toggleSidebar } = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const { searchResults, isLoading, error, hasSearched, search, clearSearch } = useSearch();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Check if the click is on a search result
        const isSearchResult = event.target.closest('[data-search-result]');
        if (!isSearchResult) {
          setIsSearchFocused(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (searchValue) {
      search(searchValue);
    } else {
      clearSearch();
    }
  }, [searchValue, search, clearSearch]);

  // Custom logout handler that navigates to homepage
  const handleLogout = async () => {
    try {
      await logout();
      // Show success toast
      displayToast('success', 'Logged out successfully!');
      // Navigate to homepage after successful logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Show error toast
      displayToast('error', 'Logout failed, but you have been signed out locally.');
      // Still navigate to homepage even if logout API fails
      navigate('/');
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    // Don't prevent default navigation - let the Link handle it
    // Just clean up the search state
    setIsSearchFocused(false);
    setSearchValue("");
    clearSearch();
  };

  // Clear search when navigating away from current page
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSearchFocused(false);
      setSearchValue("");
      clearSearch();
    };

    // Listen for route changes
    const unlisten = () => {
      handleRouteChange();
    };

    // Clean up search when component unmounts or location changes
    return () => {
      handleRouteChange();
    };
  }, [location.pathname, clearSearch]);

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Close mobile menu when search is focused
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close search when mobile menu is opened
    if (!isMobileMenuOpen) {
      setIsSearchFocused(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="bg-white dark:bg-[#1F2937] w-full flex justify-between items-center px-4 sm:px-6 lg:px-12 border-b border-gray-200 dark:border-gray-700 py-3 transition-colors duration-200">
        <div className="flex justify-between w-full items-center">
          {/* Menu Icon - Only show on mobile/tablet, hide when search is focused */}
          {!isSearchFocused && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200 mr-2"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo - Hide when search is focused on mobile/tablet, keep visible on desktop */}
          <div className={`flex items-center space-x-2 transition-all duration-300 ${
            isSearchFocused ? 'hidden lg:flex' : 'flex'
          }`}>
            <img
              src={isDark 
                ? "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550356/Group_15_ef35s1.png"
                : "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550717/Group_23_1_iax3ik.png"
              }
              alt="Logo"
              className="w-32 sm:w-40 lg:w-56 h-6 sm:h-8 lg:h-11 transition-opacity duration-200"
            />
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#DE5E08] ml-1 sm:ml-2 mt-1">Docs</p>
          </div>

          {/* Desktop Search */}
          {showNavbarSearch && (
            <div className="hidden lg:flex flex-1 min-w-[150px] max-w-[500px] relative mx-8" ref={searchRef}>
              <SearchInput
                placeholder="Search for Documentation"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
                onFocus={handleSearchFocus}
                icon={searchValue ? "clear" : "search"}
                width="100%"
                height="40px"
                isDark={isDark}
              />
              
              {/* Search Results Dropdown */}
              {isSearchFocused && (hasSearched || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60]">
                  <SearchResults
                    results={searchResults}
                    isLoading={isLoading}
                    error={error}
                    hasSearched={hasSearched}
                    onResultClick={handleSearchResultClick}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          )}

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-20">
            <div className="hidden gap-2 md:flex items-center">
              <ButtonV2
                border=""
                width='100px'
                textColor={isDark ? "#FFFFFF" : "#01274D"}
                hoverTextColor="#F97316"
              >
                Home
              </ButtonV2>
              <ButtonV2
                border=""
                width='100px'
                textColor={isDark ? "#FFFFFF" : "#01274D"}
                hoverTextColor="#F97316"
              >
                Pricing
              </ButtonV2>
              <ButtonV2
                border=""
                width='100px'
                textColor={isDark ? "#FFFFFF" : "#01274D"}
                hoverTextColor="#F97316"
              >
                Contact
              </ButtonV2>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Button - Always visible */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {isAuthenticated ? (
                // Profile Dropdown
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-2">
                    <div className="w-8 h-8 rounded-full bg-[#DE5E08] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg border z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="py-1">
                        <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user?.name || 'User'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user?.email}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IoMdLogOut className="w-4 h-4" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Sign in button for non-authenticated users
                <Link to="/signin">
                  <ButtonV2 
                    textColor={isDark ? "#FFFFFF" : "#01274D"}
                    border={isDark ? "1px solid #ffffff" : "1px solid #1F2937"}
                  >
                    Sign in
                  </ButtonV2>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Search - Full width when focused */}
          {isSearchFocused && showNavbarSearch && (
            <div className="lg:hidden flex-1 relative mx-4" ref={searchRef}>
              <SearchInput
                placeholder="Search for Documentation"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
                onFocus={handleSearchFocus}
                icon={searchValue ? "clear" : "search"}
                width="100%"
                height="40px"
                isDark={isDark}
              />
              
              {/* Search Results Dropdown */}
              {hasSearched || isLoading ? (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60]">
                  <SearchResults
                    results={searchResults}
                    isLoading={isLoading}
                    error={error}
                    hasSearched={hasSearched}
                    onResultClick={handleSearchResultClick}
                    isDark={isDark}
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Mobile/Tablet Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile/Tablet Search Button */}
            {showNavbarSearch && !isSearchFocused && (
              <button
                onClick={() => setIsSearchFocused(!isSearchFocused)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            
            {/* Close Search Button - Show when search is focused */}
            {isSearchFocused && (
              <button
                onClick={() => setIsSearchFocused(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            

            {/* Mobile/Tablet Profile Button - Hide when search is focused */}
            {!isSearchFocused && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isMobileMenuOpen 
                    ? 'bg-[#DE5E08] text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`lg:hidden mobile-menu fixed top-16 right-0 w-80 bg-white dark:bg-[#1F2937] border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4">
          {/* Mobile Navigation Links */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate('/pricing');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                navigate('/contact');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Theme Toggle - Available to all users */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                toggleTheme();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </div>
            </button>
          </div>

          {/* Mobile User Section */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#DE5E08] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IoMdLogOut className="w-4 h-4" />
                  Sign out
                </div>
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                <ButtonV2 
                  textColor={isDark ? "#FFFFFF" : "#01274D"}
                  border={isDark ? "1px solid #ffffff" : "1px solid #1F2937"}
                  className="w-full"
                >
                  Sign in
                </ButtonV2>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
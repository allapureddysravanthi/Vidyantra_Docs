import React, { useState, useRef, useEffect } from "react";
import { IoMdLogOut } from "react-icons/io";
import { Menu, Search, Bell, HelpCircle, Sun, Moon, User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ButtonV2 from "../Design Library/Button/ButtonV2";
import SearchInput from "../Design Library/SearchInput/SearchInput";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useAuth } from "../hooks/useAuth";

const Navbar = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const { showNavbarSearch, searchValue, setSearchValue } = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="bg-white dark:bg-[#1F2937] w-full flex justify-between items-center px-12 border-b border-gray-200 dark:border-gray-700 py-3 transition-colors duration-200">
        <div className="flex justify-between w-full items-center ">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <Link to="/"> */}
              <img
                src={isDark 
                  ? "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550356/Group_15_ef35s1.png"
                  : "https://res.cloudinary.com/dk8aie9hy/image/upload/v1760550717/Group_23_1_iax3ik.png"
                }
                alt="Logo"
                className="w-56 h-11 transition-opacity duration-200"
              /><p className="text-2xl font-bold text-[#DE5E08] ml-2 mt-1">Docs</p>
            {/* </Link> */}
          </div>

          {showNavbarSearch && (
            <div className="flex-1 min-w-[150px] max-w-[500px]">
              <SearchInput
                placeholder="Search for Documentation"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
                icon={searchValue ? "clear" : "search"}
                width="100%"
                height="40px"
                isDark={isDark}
              />
            </div>
          )}

          {/* Desktop Menu */}
          <div className="flex gap-20">
            <div className="hidden  gap-2 md:flex items-center ">
              {/* <Link to="/home"> */}
                <ButtonV2
                  border=""
                  width='100px'
                  textColor={isDark ? "#FFFFFF" : "#01274D"}
                  hoverTextColor="#F97316"
                  // isActive={isActive("/home")}
                 
                >
                  Home
                </ButtonV2>
              {/* </Link> */}
              {/* <Link to="/pricing"> */}
                <ButtonV2
                  border=""
                  width='100px'
                  textColor={isDark ? "#FFFFFF" : "#01274D"}
                  hoverTextColor="#F97316"
                  // isActive={isActive("/pricing")}
                  

                >
                  Pricing
                </ButtonV2>
              {/* </Link>
              <Link to="/contact"> */}
                <ButtonV2
                  border=""
                  width='100px'
                  textColor={isDark ? "#FFFFFF" : "#01274D"}
                  hoverTextColor="#F97316"
                  // isActive={isActive("/contact")}
                  

                >
                  Contact
                </ButtonV2>
              {/* </Link> */}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
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
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#DE5E08] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || user?.email || 'User'}
                    </span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
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
                            // Navigate to profile/settings
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
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


        </div>

     
    </div>
  );
};

export default Navbar;

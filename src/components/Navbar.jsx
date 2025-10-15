import React, { useState, useRef, useEffect } from "react";
import { IoMdLogOut } from "react-icons/io";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import ButtonV2 from "../Design Library/Button/ButtonV2";
import SearchInput from "../Design Library/SearchInput/SearchInput";

const Navbar = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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
  const [normalValue, setNormalValue] = useState("");


  return (
    <div className=" bg-white w-full flex justify-between items-center px-12  border-b border-gray-200  py-3">
        <div className="flex justify-between w-full items-center  h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <Link to="/"> */}
              <img
                src="https://res.cloudinary.com/devewerw3/image/upload/v1749710248/Group_17_mvxfzb.png"
                alt="Logo"
                className="w-56 h-11"
              />
            {/* </Link> */}
          </div>

          <div className="flex-1 min-w-[150px] max-w-[300px]">
                <SearchInput
                  placeholder="Search for Documentation"
                  value={normalValue}
                  onChange={(e) => setNormalValue(e.target.value)}
                  onClear={() => setNormalValue("")}
                  icon={normalValue ? "clear" : "search"}
                  width="100%"
                  height="40px"
                  rounded
                />
              </div>

          {/* Desktop Menu */}
          <div className="flex gap-20">
            <div className="hidden  gap-2 md:flex items-center ">
              {/* <Link to="/home"> */}
                <ButtonV2
                  border=""
                  width='100px'
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
                  hoverTextColor="#F97316"
                  // isActive={isActive("/contact")}
                  

                >
                  Contact
                </ButtonV2>
              {/* </Link> */}
               {/* <Link to="/careers"> */}
                <ButtonV2
                  border=""
                  width='100px'
                  hoverTextColor="#F97316"
                  // isActive={isActive("/careers")}
                  

                >
                  Careers
                </ButtonV2>
              {/* </Link> */}
            </div>

            <div className="hidden md:block">
              {/* <Link to="/login"> */}
                <ButtonV2 
                // hoverTextColor="#F5F5F5" hoverBgColor='#00274D'
                >
                  Get Started
                </ButtonV2>
              {/* </Link> */}
            </div>
          </div>


        </div>

     
    </div>
  );
};

export default Navbar;

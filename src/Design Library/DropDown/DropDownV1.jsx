import React, { useState, useRef, useEffect } from "react";

const DropdownV1 = ({
  options = [],
  placeholder = "Select an option",
  onSelect,
  value = null,
  height = "48px",
  width = "250px",
  padding = "8px 16px",
  border = "1px solid #111",
  borderRadius = "4px",
  backgroundColor = "#fff",
  textColor = "#4B5563",
  dropdownBg = "#fff",
  hoverBg = "#f3f4f6",
  isLoading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(value);
  const [displayText, setDisplayText] = useState("");

  // Update selected when value prop changes
  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  // Set display text based on selected option
  useEffect(() => {
    if (selectedOption) {
      // If options are objects with label/value
      const option = options.find(opt => 
        typeof opt === 'object' ? opt.value === selectedOption : opt === selectedOption
      );
      
      if (option) {
        setDisplayText(typeof option === 'object' ? option.label : option);
      }
    } else {
      setDisplayText("");
    }
  }, [selectedOption, options]);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div 
        className="relative" 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid #6B7280',
          borderRadius
        }}
      >
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} style={{ width }}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height,
          width,
          padding,
          borderRadius,
          backgroundColor,
          color: textColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className={`border border-[#d1d5db] focus:outline-none focus:border-[#6B7280] transition-all`}
      >
        {displayText || placeholder}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border rounded-md shadow-lg"
          style={{
            backgroundColor: dropdownBg,
            borderRadius,
          }}
        >
          {options.map((option, index) => {
            const isObject = typeof option === 'object';
            const optionValue = isObject ? option.value : option;
            const optionLabel = isObject ? option.label : option;
            
            return (
              <li
                key={index}
                style={{ padding }}
                className={`cursor-pointer hover:bg-gray-100 ${
                  optionValue === selectedOption ? 'bg-gray-100' : ''
                }`}
                onClick={() => {  
                  setSelectedOption(optionValue);
                  setDisplayText(optionLabel);
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {optionLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DropdownV1;

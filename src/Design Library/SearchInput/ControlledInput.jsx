import React, { useState, useRef, useEffect } from "react";

const ControlledInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  suggestions = [],
  isSearchable = false,
  onBlur,
  fontSize='16px' ,
  height = "40px",
  width = "406px",
  padding = "4px 16px",
  border = "1px solid #D1D5DB",
  backgroundColor ="white",
  borderRadius = "4px",
  disabled = false,
   
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const inputRef = useRef(null);

  useEffect(() => {
    const handleDropdownPosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropdownPosition(spaceBelow < 200 ? "top" : "bottom");
      }
    };

    window.addEventListener("scroll", handleDropdownPosition);
    window.addEventListener("resize", handleDropdownPosition);
    handleDropdownPosition();

    return () => {
      window.removeEventListener("scroll", handleDropdownPosition);
      window.removeEventListener("resize", handleDropdownPosition);
    };
  }, []);

  useEffect(() => {
    if (isSearchable && value) {
      const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value, suggestions, isSearchable]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (isSearchable) {
      const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          onFocus={() => {
            if (isSearchable) {
              const filtered = value 
                ? suggestions.filter((item) => 
                    item.toLowerCase().includes(value.toLowerCase())
                  )
                : suggestions;
              setFilteredSuggestions(filtered);
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
            onBlur && onBlur();
          }}
           disabled={disabled} 
          style={{
            height,
            width,
            padding,
            border,
            borderRadius,
            fontSize: fontSize || '16px' ,// xs size
            backgroundColor: disabled ? "#D1D5DB" : backgroundColor ,
            cursor: disabled ? "not-allowed" : "text",
          }}
          className={`text-xs focus:outline-none focus:ring-1 focus:ring-gray-600 pr-8 placeholder:text-sm`}
          placeholder={placeholder}
        />
        {/* Icons Logic */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 ">
          {value ? (
            <button
              type="button"
              className="hover:text-gray-600"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
                setShowSuggestions(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : showSuggestions ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
           style={{ width }}  
            className={`absolute z-10    ${
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
            } max-h-44 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg`}
          >
            {filteredSuggestions.map((item, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item);
                  setShowSuggestions(false);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ControlledInput;

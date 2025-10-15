import React, { useState, useRef, useEffect } from "react";

const DropdownV2 = ({
  options = [],
  placeholder = "Select options",
  onSelect,
  value = [],
  height = "auto",
  width = "250px",
  padding = "8px 16px",
  borderRadius = "4px",
  backgroundColor = "#fff",
  textColor = "#4B5563",
  dropdownBg = "#fff",
  hoverBg = "#f3f4f6",
  isLoading = false,
}) => {
  const [selectedOptions, setSelectedOptions] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle select/deselect
  const handleSelect = (option) => {
    const optionValue = typeof option === "object" ? option.value : option;

    const exists = selectedOptions.some(
      (item) =>
        (typeof item === "object" ? item.value : item) === optionValue
    );

    let updated;
    if (exists) {
      updated = selectedOptions.filter(
        (item) =>
          (typeof item === "object" ? item.value : item) !== optionValue
      );
    } else {
      updated = [...selectedOptions, option];
    }

    setSelectedOptions(updated);
    onSelect && onSelect(updated);
  };

  const removeChip = (valueToRemove) => {
    const updated = selectedOptions.filter(
      (item) =>
        (typeof item === "object" ? item.value : item) !== valueToRemove
    );
    setSelectedOptions(updated);
    onSelect && onSelect(updated);
  };

  const getLabel = (opt) =>
    typeof opt === "object" ? opt.label : opt;

  if (isLoading) {
    return (
      <div
        className="relative flex items-center justify-center border border-gray-300"
        style={{ width, height, borderRadius }}
      >
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} style={{ width }}>
      {/* Dropdown Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 cursor-pointer flex items-center flex-wrap gap-1 min-h-[48px]"
        style={{
          padding,
          borderRadius,
          backgroundColor,
          color: textColor,
        }}
      >
        {selectedOptions.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}

        {selectedOptions.map((opt, index) => {
          const label = getLabel(opt);
          const value = typeof opt === "object" ? opt.value : opt;

          return (
           <div
  key={index}
  className="bg-blue-100 text-gray-500 w-auto py-1 px-2 rounded text-sm flex justify-between items-center w-full"
>
  <span className="truncate">{label}</span>
  <button
    onClick={(e) => {
      e.stopPropagation();
      removeChip(value);
    }}
    className="ml-2 text-blue-600 hover:text-blue-800"
  >
    &times;
  </button>
</div>

          );
        })}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-auto h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border rounded-md shadow-lg bg-white"
          style={{ backgroundColor: dropdownBg, borderRadius }}
        >
          {options.map((option, index) => {
            const optionValue = typeof option === "object" ? option.value : option;
            const optionLabel = typeof option === "object" ? option.label : option;
            const isSelected = selectedOptions.some(
              (item) =>
                (typeof item === "object" ? item.value : item) === optionValue
            );

            return (
              <li
                key={index}
                style={{ padding }}
                className={`cursor-pointer hover:bg-gray-100 ${
                  isSelected ? "bg-gray-100" : ""
                }`}
                onClick={() => handleSelect(option)}
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

export default DropdownV2;

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const SplitButton = ({
  title = "Title",
  disabled = false,
  bgColor = "#00274D",
  textColor = "#ffffff",
  border = "1px solid transparent",
  dropdownOptions = [],
  size = "medium", // "small" | "medium" | "large"
  leftIcon = null,
  rightIcon =null,
  iconBgColor='',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const sizes = {
    small: { height: "32px", fontSize: "12px", padding: "0 10px" },
    medium: { height: "40px", fontSize: "14px", padding: "0 14px" },
    large: { height: "48px", fontSize: "16px", padding: "0 16px" },
  };

  const currentSize = sizes[size];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) setShowDropdown((prev) => !prev);
  };

  return (
    <div
      ref={dropdownRef}
      style={{ display: "inline-flex", position: "relative" }}
      onClick={toggleDropdown}
    >
      <button
        disabled={disabled}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border,
          padding: currentSize.padding,
          fontSize: currentSize.fontSize,
          height: currentSize.height,
          borderTopLeftRadius: "6px",
          borderBottomLeftRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {leftIcon && <span style={{ display: "flex" }}>{leftIcon}</span>}
        <span>{title}</span>
        {rightIcon && <span style={{ display: "flex" }}>{rightIcon}</span>}
      </button>

      <button
        disabled={disabled}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border,
          height: currentSize.height,
          width: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: "6px",
          borderBottomRightRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <FiChevronDown />
      </button>

     {showDropdown && dropdownOptions.length > 0 && (
  <div
    style={{
      position: "absolute",
      top: "100%",
      right: 0,
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 999,
      marginTop: "4px",
      minWidth: "140px",
      overflow: "hidden",
      ...(dropdownOptions.length > 4 && {
        maxHeight: "200px",
        overflowY: "auto",
      }),
    }}
  >
    {dropdownOptions.map((option, idx) => (
      <div
        key={idx}
        onClick={() => {
          option.onClick?.();
          setShowDropdown(false);
        }}
        style={{
          padding: "10px 14px",
          fontSize: "14px",
          color: "#111827",
          cursor: "pointer",
          backgroundColor: "#fff",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#f1f5f9";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#fff";
        }}
      >
        {option.label}
      </div>
    ))}
  </div>
)}

    </div>
  );
};

export default SplitButton;

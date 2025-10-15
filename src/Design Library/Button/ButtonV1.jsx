import React, { useState } from "react";

const ButtonV1 = ({
  children,
  onClick,
  leftIcon = null,
  rightIcon = null,
  bgColor = "#F3F4F6",
  hoverBgColor = "",
  textColor = "#4B5563",
  hoverTextColor = "",
  border = "",
  borderRadius = "6px",
  disabled = false,
  customStyle = {},
  size = "large",
  width = "200px",
  fontWeight = "500", 
  iconSize = "16px",
  textSize = "", // ✅ New
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    small: { height: "32px", fontSize: "12px", padding: "0 10px" },
    medium: { height: "35px", fontSize: "14px", padding: "0 14px" },
    large: { height: "40px", fontSize: "16px", padding: "0 16px" },
  };

  const currentSize = sizes[size];
  const currentBg = isHovered && hoverBgColor ? hoverBgColor : bgColor;
  const currentText = isHovered && hoverTextColor ? hoverTextColor : textColor;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        width: width,
        fontWeight: fontWeight,
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: currentBg,
        color: currentText,
        border: border || "none",
        padding: currentSize.padding,
        height: currentSize.height,
        fontSize: textSize || currentSize.fontSize, // ✅ Use textSize if provided
        borderRadius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.3s ease",
        ...customStyle,
      }}
    >
      {leftIcon && (
        <span style={{ fontSize: iconSize, display: "flex", alignItems: "center" }}>
          {leftIcon}
        </span>
      )}
      <span style={{ fontWeight: fontWeight, fontSize: textSize || currentSize.fontSize }}>
        {children}
      </span>
      {rightIcon && (
        <span style={{ fontSize: iconSize, display: "flex", alignItems: "center" }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default ButtonV1;

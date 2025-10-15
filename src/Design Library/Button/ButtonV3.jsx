import React, { useState, useEffect } from "react";

const ButtonV3 = ({
  children,
  onClick,
  leftIcon = null,
  rightIcon = null,
  bgColor = "#00274D", //#00274D
  textColor = "#f5f5f5",
  hoverTextColor,        // ⬅️ no default now
  hoverBgColor,          // ⬅️ no default now
  border = "2px solid #01274D",
  borderRadius = "6px",
  disabled = false,
  customStyle = {},
  width = "200px",
  fontWeight = "500",
  className = "",
  size = null,
  iconSize = "16px",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getResponsiveSize = (width) => {
    if (width < 640) return "small";
    if (width < 1024) return "medium";
    return "large";
  };

  const [responsiveSize, setResponsiveSize] = useState(getResponsiveSize(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setResponsiveSize(getResponsiveSize(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sizes = {
    small: { height: "38px", fontSize: "12px", padding: "0 10px" },
    medium: { height: "40px", fontSize: "14px", padding: "0 14px" },
    large: { height: "40px", fontSize: "16px", padding: "0 0px" },
  };

  const currentSize = sizes[size || responsiveSize];

  const hasHoverTextColor = typeof hoverTextColor !== "undefined";
  const hasHoverBgColor = typeof hoverBgColor !== "undefined";

  const currentTextColor = isHovered && hasHoverTextColor ? hoverTextColor : textColor;
  const currentBgColor = isHovered && hasHoverBgColor ? hoverBgColor : bgColor;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: currentBgColor || "transparent",
        color: currentTextColor,
        border: border || "none",
        borderRadius,
        padding: currentSize.padding,
        height: currentSize.height,
        fontSize: currentSize.fontSize,
        width,
        fontWeight,
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
      <span style={{ fontSize: currentSize.fontSize, fontWeight }}>{children}</span>
      {rightIcon && (
        <span style={{ fontSize: iconSize, display: "flex", alignItems: "center" }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default ButtonV3;

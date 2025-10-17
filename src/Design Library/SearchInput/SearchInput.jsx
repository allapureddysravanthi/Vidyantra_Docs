import React, { useState } from 'react';
import { IoSearchOutline } from "react-icons/io5";
import { MdClear } from "react-icons/md";

const SearchInput = ({
  placeholder = 'Enter text',
  value,
  onChange,
  onClear,
  onFocus,
  icon = 'search',
  disabled = false,
  width = '200px',
  height = '40px',
  backgroundColor = '#fff',
  color = '',
  isDark = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = {
    // flex: 1, 
    width: width,
    height: height,
    border: `1px solid ${isFocused ? (isDark ? '#FFFFFF' : '#999') : (isDark ? '#FFFFFF' : '#ccc')}`,
    borderRadius: '4px',
    padding: '0 1rem',
    paddingRight: '2.5rem',
    outline: 'none',
    color: isDark ? '#FFFFFF' : '#4B5563',
    backgroundColor: disabled ? '#D1D5DB' : (isDark ? '#1F2937' : backgroundColor),
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.3s, background-color 0.3s, color 0.3s',
    ...(!disabled && parseStyleString(color)) // Only apply custom color if not disabled
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width,
  };

  const iconStyle = {
    position: 'absolute',
    right: '10px',
    color: isDark ? '#FFFFFF' : '#4B5563',
    cursor: icon === 'clear' ? 'pointer' : 'default',
    pointerEvents: icon === 'search' ? 'none' : 'auto',
    transition: 'color 0.3s'
  };

  return (
    <div style={wrapperStyle}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus && onFocus(e);
        }}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        style={inputStyle}
      />
      {!disabled && icon === 'search' && <IoSearchOutline size={20} style={iconStyle} />}
      {!disabled && icon === 'clear' && value && <MdClear size={20} style={iconStyle} onClick={onClear} />}
    </div>
  );
};

function parseStyleString(styleStr) {
  if (!styleStr || typeof styleStr !== 'string') return {};
  return styleStr.split(';').reduce((acc, line) => {
    const [prop, value] = line.split(':').map(s => s && s.trim());
    if (prop && value) {
      const jsProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
      acc[jsProp] = value;
    }
    return acc;
  }, {});
}

export default SearchInput;

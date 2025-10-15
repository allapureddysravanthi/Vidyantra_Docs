import React, { useState } from 'react';

const IconInput = ({
  placeholder = 'Enter Email',
  value,
  onChange,
  disabled = false,
  width = '300px',
  height = '42px',
  backgroundColor = '#fff',
  color = '#01274D',
  icon: IconComponent = null,
  className = '',
  borderColor = '#01274D',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: width,
  };

  const inputStyle = {
    height: height,
    width: '100%',
    border: `1px solid ${isFocused ? borderColor : borderColor}`,
    borderRadius: '4px',
    padding: '0 1rem',
    paddingRight: IconComponent ? '2.5rem' : '1rem',
    outline: 'none',
    fontSize: '14px',
    color:  color ,
    backgroundColor: disabled ? '#F3F4F6' : backgroundColor,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.3s',
    ...parseStyleString(color),
  };

  const iconStyle = {
    position: 'absolute',
    right: '12px',
    color: '#4B5563',
    pointerEvents: 'none',
    fontSize: '18px',
  };

  return (
    <div style={wrapperStyle}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        style={inputStyle}
        className={className}
      />
      {IconComponent && <IconComponent style={iconStyle} />}
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

export default IconInput;

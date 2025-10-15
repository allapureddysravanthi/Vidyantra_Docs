import React, { useRef } from 'react';

const IconInput = ({
  placeholder = 'Enter Email',
  value,
  onChange,
  disabled = false,
  width = '300px',
  height = '40px',
  backgroundColor = '#fff',
  color = '',
  border = '1px solid #01274D',
  focusColor = '',
  borderRadius = '4px',
  textColor = '#01274D',
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  onLeftIconClick = null,
  onRightIconClick = null,
  onKeyDown,
}) => {
  const inputRef = useRef(null);

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: width,
  };

  const inputStyle = {
    height: height,
    width: '100%',
    border: border,
    borderRadius: borderRadius,
    paddingLeft: LeftIcon ? '2.5rem' : '1rem',
    paddingRight: RightIcon ? '2.5rem' : '1rem',
    outline: 'none',
    fontSize: '16px',
    color: textColor,
    backgroundColor: disabled ? '#F3F4F6' : backgroundColor,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border 0.3s ease',
    ...parseStyleString(color),
  };

  const iconBaseStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: textColor,
    cursor: 'pointer',
  };

  const leftIconStyle = {
    ...iconBaseStyle,
    left: '12px',
  };

  const rightIconStyle = {
    ...iconBaseStyle,
    right: '12px',
  };

  const handleFocus = () => {
    if (inputRef.current && focusColor) {
      inputRef.current.style.border = `1px solid ${focusColor}`;
    }
  };

  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.style.border = border;
    }
  };

  return (
    <div style={wrapperStyle}>
      {LeftIcon && (
        <div style={leftIconStyle} onClick={onLeftIconClick}>
          <LeftIcon />
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={inputStyle}
        onKeyDown={onKeyDown}
      />
      {RightIcon && (
        <div style={rightIconStyle} onClick={onRightIconClick}>
          <RightIcon />
        </div>
      )}
    </div>
  );
};

function parseStyleString(styleStr) {
  if (!styleStr || typeof styleStr !== 'string') return {};
  return styleStr.split(';').reduce((acc, line) => {
    const [prop, value] = line.split(':').map((s) => s && s.trim());
    if (prop && value) {
      const jsProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      acc[jsProp] = value;
    }
    return acc;
  }, {});
}

export default IconInput;

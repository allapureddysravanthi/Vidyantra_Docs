import React from 'react';
import { createRoot } from 'react-dom/client';
import { BsExclamationCircle, BsExclamationTriangle } from 'react-icons/bs';
import { IoMdCheckmark } from 'react-icons/io';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';

const Toast = ({ message, type = 'info', onClose }) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600',
          icon: <IoCheckmarkCircle className="w-6 h-6 text-white" />
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: <BsExclamationTriangle className="w-6 h-6 text-white" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          icon: <BsExclamationCircle className="w-6 h-6 text-white" />
        };
      default:
        return {
          bg: 'bg-blue-600',
          icon: <BsExclamationCircle className="w-6 h-6 text-white" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div 
      className={`
        ${styles.bg} 
        fixed
        top-20
        right-6
        text-white 
        rounded-lg
        p-4
        flex 
        items-center 
        justify-between 
        gap-3
        min-w-[300px]
        max-w-[400px]
        shadow-lg
        z-50
        border-t-2
        border-white/20
        animate-slideIn
      `}
    >
      <div className="flex items-center gap-3">
        {styles.icon}
        <span className="text-sm font-medium">
          {message}
        </span>
      </div>
      <button 
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        <IoClose className="w-5 h-5" />
      </button>
    </div>
  );
};

export const displayToast = (type, message) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3';
    document.body.appendChild(container);
  }

  const toastElement = document.createElement('div');
  const root = createRoot(toastElement);
  
  const handleClose = () => {
    toastElement.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (container.contains(toastElement)) {
        container.removeChild(toastElement);
      }
    }, 300);
  };

  root.render(
    <Toast 
      type={type} 
      message={message}
      onClose={handleClose}
    />
  );
  
  container.appendChild(toastElement);
  setTimeout(handleClose, 4000);
};

export default Toast;

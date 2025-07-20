import React, { useRef, useEffect } from 'react';
import focusManager from '../services/FocusManager.js';

const TestButton = ({ label, onClick }) => {
  const buttonRef = useRef(null);

  // Register with focus manager
  useEffect(() => {
    if (buttonRef.current) {
      focusManager.register(buttonRef.current, 'root');
      buttonRef.current.onActivate = onClick;
    }

    return () => {
      if (buttonRef.current) {
        focusManager.unregister(buttonRef.current);
      }
    };
  }, [onClick]);

  return (
    <button 
      ref={buttonRef}
      onClick={onClick}
      style={{
        padding: '12px 16px',
        backgroundColor: '#444',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        minWidth: '200px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {label}
    </button>
  );
};

export default TestButton; 
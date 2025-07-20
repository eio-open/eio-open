import React, { useRef, useEffect } from 'react';
import focusManager from '../services/FocusManager.js';

const LocaleItem = ({ locale, isSelected, onSelect, index }) => {
  const itemRef = useRef(null);

  // Register with focus manager
  useEffect(() => {
    if (itemRef.current) {
      focusManager.register(itemRef.current, 'panel');
      itemRef.current.onActivate = onSelect;
    }

    return () => {
      if (itemRef.current) {
        focusManager.unregister(itemRef.current);
      }
    };
  }, [onSelect]);

  return (
    <div 
      ref={itemRef}
      className={`locale-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="locale-name">{locale.native} ({locale.code.toUpperCase()})</div>
      {isSelected && (
        <div className="locale-check">✓</div>
      )}
    </div>
  );
};

export default LocaleItem; 
import React, { useState, useEffect, useRef } from 'react';
import focusManager from '../services/FocusManager.js';

const StatusBar = ({ onTogglePanel }) => {
  const [currentTime, setCurrentTime] = useState('');
  const statusBarRef = useRef(null);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Mock data
  const batteryLevel = 85;
  const hasWifi = false; // Mock: no Wi-Fi in emulator

  const getBatteryIcon = (level) => {
    if (level > 80) return '🔋';
    if (level > 60) return '🔋';
    if (level > 40) return '🔋';
    if (level > 20) return '🔋';
    return '🔋';
  };

  const getWifiIcon = (connected) => {
    return connected ? '📶' : '📶';
  };

  // Register with focus manager
  useEffect(() => {
    if (statusBarRef.current) {
      focusManager.register(statusBarRef.current, 'root');
      statusBarRef.current.onActivate = onTogglePanel;
    }

    return () => {
      if (statusBarRef.current) {
        focusManager.unregister(statusBarRef.current);
      }
    };
  }, [onTogglePanel]);

  // Re-register if focus is lost (fallback)
  useEffect(() => {
    const checkFocus = () => {
      if (statusBarRef.current && !focusManager.getFocusableElements().includes(statusBarRef.current)) {
        console.log('Status bar lost focus registration, re-registering...');
        focusManager.register(statusBarRef.current, 'root');
        statusBarRef.current.onActivate = onTogglePanel;
      }
    };

    const interval = setInterval(checkFocus, 1000); // Check every second
    return () => clearInterval(interval);
  }, [onTogglePanel]);

  return (
    <div ref={statusBarRef} className="status-bar" onClick={onTogglePanel}>
      <div className="status-left">
        <span className="status-icon">🕑</span>
        <span className="status-text">{currentTime}</span>
      </div>
      
      <div className="status-right">
        <span className="status-icon">{getWifiIcon(hasWifi)}</span>
        <span className="status-icon">{getBatteryIcon(batteryLevel)}</span>
        <span className="status-text">{batteryLevel}%</span>
      </div>
    </div>
  );
};

export default StatusBar; 
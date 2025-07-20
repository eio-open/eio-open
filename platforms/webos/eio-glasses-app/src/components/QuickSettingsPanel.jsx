import React, { useState, useEffect, useRef } from 'react';
import { ls2Request } from '../services/ls2';
import focusManager from '../services/FocusManager.js';
import LocaleItem from './LocaleItem.jsx';

const QuickSettingsPanel = ({ open, onClose, translations, currentLocale, onLocaleChange }) => {
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [wifiLoading, setWifiLoading] = useState(false);
  const [wifiError, setWifiError] = useState(null);
  const closeButtonRef = useRef(null);
  const refreshButtonRef = useRef(null);

  const scanWifiNetworks = async () => {
    setWifiLoading(true);
    setWifiError(null);
    
    try {
      const result = await ls2Request('luna://com.webos.service.wifi', 'getNetworks', {});
      console.log('Wi-Fi scan result:', result);
      
      if (result && result.networks) {
        setWifiNetworks(result.networks);
      } else {
        setWifiNetworks([]);
      }
    } catch (error) {
      console.error('Wi-Fi scan error:', error);
      setWifiError(error.message);
      window.alert('Wi-Fi scan error: ' + error.message);
    } finally {
      setWifiLoading(false);
    }
  };

  // Scan Wi-Fi networks when panel opens
  useEffect(() => {
    if (open) {
      scanWifiNetworks();
    }
  }, [open]);

  // Register focusable elements when panel opens
  useEffect(() => {
    if (open) {
      console.log('Panel opening - registering focusable elements');
      
      // Register close button
      if (closeButtonRef.current) {
        focusManager.register(closeButtonRef.current, 'panel');
        closeButtonRef.current.onActivate = onClose;
      }

      // Register refresh button if it exists
      if (refreshButtonRef.current) {
        focusManager.register(refreshButtonRef.current, 'panel');
        refreshButtonRef.current.onActivate = scanWifiNetworks;
      }

      // Push panel view onto stack
      focusManager.pushView('panel');
      
      // Restore focus for panel view
      setTimeout(() => {
        focusManager.restoreFocus();
      }, 100);
    } else {
      console.log('Panel closing - clearing focusable elements');
      
      // Clear panel focusable elements and pop view
      focusManager.clearView('panel');
      focusManager.popView(); // Ensure we return to root view
      
      // Simple, direct focus restoration
      setTimeout(() => {
        console.log('Simple focus restoration after panel close');
        
        // Clear ALL focus indicators
        document.querySelectorAll('.focused').forEach(el => {
          el.classList.remove('focused');
        });
        
        // Force root view
        focusManager.currentView = 'root';
        focusManager.currentFocusIndex = -1;
        
        // Find and focus status bar directly
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
          console.log('Direct status bar focus');
          // Register if not already registered
          if (!focusManager.focusableElements.includes(statusBar)) {
            focusManager.register(statusBar, 'root');
          }
          
          // Set onActivate
          statusBar.onActivate = onClose;
          
          // Find index and set focus
          const index = focusManager.focusableElements.indexOf(statusBar);
          if (index >= 0) {
            console.log('Setting focus to status bar at index:', index);
            focusManager.currentFocusIndex = index;
            statusBar.classList.add('focused');
            statusBar.focus();
          }
        }
      }, 100);
    }
  }, [open, onClose]);

  const renderWifiContent = () => {
    if (wifiLoading) {
      return <div className="loading">Scanning for Wi-Fi networks...</div>;
    }
    
    if (wifiError) {
      return <div className="error">Error: {wifiError}</div>;
    }
    
    if (wifiNetworks.length === 0) {
      return <div className="empty-state">No Wi-Fi adapter in emulator</div>;
    }
    
    return (
      <div>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>
          Available Networks ({wifiNetworks.length}):
        </div>
        <div className="wifi-list">
          {wifiNetworks.map((network, index) => (
            <div key={index} className="wifi-item">
              <div className="wifi-name">{network.ssid || 'Unknown'}</div>
              <div className="wifi-details">
                Signal: {network.signalStrength || 'Unknown'} | 
                Security: {network.security || 'Open'}
              </div>
            </div>
          ))}
        </div>
        <button 
          ref={refreshButtonRef}
          onClick={scanWifiNetworks}
          className="btn"
          style={{ marginTop: '12px' }}
        >
          Refresh
        </button>
      </div>
    );
  };

  const renderLocaleContent = () => {
    const locales = [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'zh', name: 'Chinese', native: '中文' },
      { code: 'fr', name: 'French', native: 'Français' }
    ];

    return (
      <div>
        <div style={{ marginBottom: '12px', fontSize: '11px', color: '#999' }}>
          {translations?.locale?.current || 'Current Language'}
        </div>
        <div className="locale-list">
          {locales.map((locale, index) => (
            <LocaleItem
              key={locale.code}
              locale={locale}
              isSelected={currentLocale === locale.code}
              onSelect={() => onLocaleChange(locale.code)}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`settings-panel ${open ? 'open' : ''}`}>
      <div className="panel-content">
        <div className="panel-header">
          <h2 className="panel-title">{translations?.panel?.title || 'Quick Settings'}</h2>
                  <button ref={closeButtonRef} className="close-button" onClick={onClose}>
          ×
        </button>
        </div>
        
        <div className="panel-sections">
          <div className="section">
            <h3 className="section-title">
              {translations?.panel?.section?.wifi || 'Wi-Fi'}
            </h3>
            <div className="section-content">
              {renderWifiContent()}
            </div>
          </div>
          
          <div className="section">
            <h3 className="section-title">
              {translations?.locale?.title || translations?.panel?.section?.locale || 'Locale'}
            </h3>
            <div className="section-content">
              {renderLocaleContent()}
            </div>
          </div>
          
          <div className="section">
            <h3 className="section-title">
              {translations?.panel?.section?.status || 'Status'}
            </h3>
            <div className="section-content">
              System status information will be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSettingsPanel; 
import React, { useState, useEffect } from 'react';
import StatusBar from './components/StatusBar.jsx';
import QuickSettingsPanel from './components/QuickSettingsPanel.jsx';
import TestButton from './components/TestButton.jsx';
import { ls2Request } from './services/ls2';
import focusManager from './services/FocusManager.js';
import rotaryInput from './services/RotaryInput.js';
import './styles/shell.css';

// Import locale files
import enTranslations from './i18n/en.json';
import zhTranslations from './i18n/zh.json';
import frTranslations from './i18n/fr.json';

const localeMap = {
  'en': enTranslations,
  'zh': zhTranslations,
  'fr': frTranslations
};

// Debug panel component
const DebugPanel = ({ debugInfo }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '6px',
      border: '1px solid #007acc',
      zIndex: 1000,
      fontFamily: 'monospace',
      fontSize: '12px',
      minWidth: '250px',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#007acc', fontSize: '14px' }}>Debug Info</h4>
      <div style={{ lineHeight: '1.4' }}>
        <div><strong>Index:</strong> {debugInfo.currentIndex}</div>
        <div><strong>Elements:</strong> {debugInfo.totalElements}</div>
        <div><strong>View:</strong> {debugInfo.currentView}</div>
        <div><strong>Focused:</strong> {debugInfo.focusedElements}</div>
        <div><strong>Element:</strong> {debugInfo.currentElement}</div>
        <div><strong>Handler:</strong> {debugInfo.onActivate}</div>
      </div>
    </div>
  );
};

const ShellRoot = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [translations, setTranslations] = useState(enTranslations);
  const [systemLocale, setSystemLocale] = useState(null);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [debugInfo, setDebugInfo] = useState({
    currentIndex: -1,
    totalElements: 0,
    currentView: 'none',
    focusedElements: 0,
    currentElement: 'none',
    onActivate: 'none'
  });

  // Load locale based on navigator.language
  useEffect(() => {
    const loadLocale = () => {
      const language = navigator.language.split('-')[0];
      const localeTranslations = localeMap[language] || enTranslations;
      setTranslations(localeTranslations);
      setCurrentLocale(language in localeMap ? language : 'en');
      console.log('Loaded locale:', language, 'fallback to en:', !localeMap[language]);
    };

    loadLocale();
  }, []);

  // Read system locale via LS2
  useEffect(() => {
    const readSystemLocale = async () => {
      try {
        const result = await ls2Request('luna://com.webos.settingsservice', 'getSystemSettings', { category: 'localeInfo' });
        console.log('System locale result:', result);
        
        if (result && result.settings && result.settings.localeInfo) {
          const locale = result.settings.localeInfo.locale;
          setSystemLocale(locale);
          
          // Update current locale based on system locale
          const localeCode = locale.split('_')[0]; // Extract language code (e.g., 'en' from 'en_US')
          if (localeCode in localeMap) {
            setCurrentLocale(localeCode);
            setTranslations(localeMap[localeCode]);
          }
          
          console.log('System locale:', locale, 'mapped to:', localeCode);
        } else {
          console.log('No locale info found in system settings');
        }
      } catch (error) {
        console.error('Failed to read system locale:', error);
      }
    };

    readSystemLocale();
  }, []);

  // Initialize rotary input and keyboard listeners
  useEffect(() => {
    // Initialize rotary input
    rotaryInput.init();
    
    // Initialize focus manager with root view
    focusManager.pushView('root');
    
    // Set initial focus to status bar
    setTimeout(() => {
      focusManager.restoreFocus();
    }, 100);



      // Listen for rotary panel close events
  const handleRotaryPanelClose = (event) => {
    setPanelOpen(false);
    // Restore focus to status bar
    setTimeout(() => {
      focusManager.restoreFocus();
    }, 100);
  };

  // Debug focus manager state
  const debugFocus = () => {
    console.log('=== Focus Debug ===');
    focusManager.debug();
    console.log('Panel open:', panelOpen);
    console.log('==================');
  };

  // Add debug key (F2)
  const handleKeyDown = (event) => {
    if (event.key === 'F1') {
      event.preventDefault();
      setPanelOpen(prev => !prev);
    } else if (event.key === 'F2') {
      event.preventDefault();
      debugFocus();
    }
  };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('rotaryPanelClose', handleRotaryPanelClose);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('rotaryPanelClose', handleRotaryPanelClose);
    };
  }, []);

  const togglePanel = () => {
    setPanelOpen(prev => !prev);
  };

  const closePanel = () => {
    setPanelOpen(false);
    // Ensure focus returns to status bar when panel closes
    setTimeout(() => {
      focusManager.restoreFocus();
    }, 100);
  };

  const handleLocaleChange = async (newLocale) => {
    const previousLocale = currentLocale;
    
    try {
      console.log('Setting system locale to:', newLocale);
      const result = await ls2Request('luna://com.webos.settingsservice', 'setSystemSettings', { 
        category: 'localeInfo', 
        settings: { locale: newLocale } 
      });
      
      console.log('Locale change result:', result);
      
      // Update local state
      setCurrentLocale(newLocale);
      setTranslations(localeMap[newLocale]);
      setSystemLocale(newLocale);
      
      console.log('Locale changed successfully to:', newLocale);
    } catch (error) {
      console.error('Locale change failed:', error);
      alert('Locale change failed: ' + error.message);
      
      // Revert to previous locale
      setCurrentLocale(previousLocale);
      setTranslations(localeMap[previousLocale]);
    }
  };

  return (
    <div className="shell-root">
      <StatusBar onTogglePanel={togglePanel} />
      
      <div className="content-area">
        {/* Main content area with test buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '14px',
          gap: '20px'
        }}>
          {systemLocale && (
            <div style={{ textAlign: 'center' }}>
              <div>System locale: {systemLocale}</div>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Tap status bar or press F1 for settings
              </div>
            </div>
          )}
          
          {/* Test buttons for debugging */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TestButton 
              label="Test Focus - Status Bar" 
              onClick={() => {
                console.log('Test button clicked - Status Bar');
                const statusBar = document.querySelector('.status-bar');
                if (statusBar) {
                  console.log('Status bar found, triggering click');
                  statusBar.click();
                } else {
                  console.log('Status bar not found');
                }
              }}
            />
            
            <TestButton 
              label="Test Focus - Direct Toggle" 
              onClick={() => {
                console.log('Test button clicked - Direct Toggle');
                togglePanel();
              }}
            />
            
            <TestButton 
              label="Debug Focus State" 
              onClick={() => {
                console.log('=== Debug Focus State ===');
                focusManager.debug();
                console.log('Panel open:', panelOpen);
                console.log('Status bar element:', document.querySelector('.status-bar'));
                console.log('Status bar focusable:', document.querySelector('.status-bar')?.getAttribute('data-focusable'));
                
                // Test rotary input
                console.log('Rotary input enabled:', rotaryInput.isEnabled);
                console.log('Rotary input event listener active:', !!document.onkeydown);
                
                // Test focus manager state
                console.log('Focus manager state:', {
                  currentElement: focusManager.getCurrentElement(),
                  currentIndex: focusManager.currentFocusIndex,
                  totalElements: focusManager.focusableElements.length,
                  currentView: focusManager.getCurrentView(),
                  viewStack: focusManager.viewStack
                });
                
                // Test if elements are actually focusable
                const allFocusable = document.querySelectorAll('[data-focusable="true"]');
                console.log('DOM elements with data-focusable:', allFocusable.length);
                allFocusable.forEach((el, i) => {
                  console.log(`Element ${i}:`, el, 'view:', el.getAttribute('data-view-id'));
                });
                
                // Check for focused elements in DOM
                const focusedElements = document.querySelectorAll('.focused');
                console.log('Focused elements in DOM:', focusedElements.length);
                focusedElements.forEach((el, i) => {
                  console.log(`Focused element ${i}:`, el);
                });
                
                // Test if current element has onActivate
                const currentElement = focusManager.getCurrentElement();
                if (currentElement) {
                  console.log('Current element onActivate:', typeof currentElement.onActivate);
                }
                
                // Update debug info on screen
                const debugInfoData = {
                  currentIndex: focusManager.currentFocusIndex,
                  totalElements: focusManager.focusableElements.length,
                  currentView: focusManager.getCurrentView(),
                  focusedElements: focusedElements.length,
                  currentElement: currentElement ? currentElement.textContent?.substring(0, 20) : 'none',
                  onActivate: currentElement ? typeof currentElement.onActivate : 'none'
                };
                
                setDebugInfo(debugInfoData);
                
                console.log('=======================');
              }}
            />
            
            <TestButton 
              label="Force Focus to Status Bar" 
              onClick={() => {
                console.log('Force focusing to status bar');
                const statusBar = document.querySelector('.status-bar');
                if (statusBar) {
                  focusManager.register(statusBar, 'root');
                  statusBar.onActivate = togglePanel;
                  focusManager.setFocus(0);
                }
              }}
            />
            
            <TestButton 
              label="Test Rotary Input" 
              onClick={() => {
                console.log('Testing rotary input simulation');
                console.log('Simulating KEY_UP...');
                rotaryInput.simulateInput('KEY_UP');
                console.log('Simulating KEY_DOWN...');
                rotaryInput.simulateInput('KEY_DOWN');
                console.log('Simulating KEY_ENTER...');
                rotaryInput.simulateInput('KEY_ENTER');
              }}
            />
          </div>
        </div>
        
        <QuickSettingsPanel 
          open={panelOpen} 
          onClose={closePanel}
          translations={translations}
          currentLocale={currentLocale}
          onLocaleChange={handleLocaleChange}
        />
        
        <DebugPanel 
          debugInfo={debugInfo}
        />
      </div>
    </div>
  );
};

export default ShellRoot; 
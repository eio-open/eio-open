// AR Shell - Vanilla JavaScript Version (480×320)
// Compatible with webOS ares-package

// Translations
var translations = {
    en: {
        title: { app: "AR Shell" },
        panel: { 
            title: "Quick Settings",
            section: { wifi: "Wi-Fi", locale: "Locale", status: "Status" }
        },
        button: { close: "Close", toggle: "Settings" },
        locale: {
            title: "Language",
            select: "Select Language",
            current: "Current Language"
        }
    },
    zh: {
        title: { app: "AR 外壳" },
        panel: { 
            title: "快速设置",
            section: { wifi: "Wi-Fi", locale: "语言", status: "状态" }
        },
        button: { close: "关闭", toggle: "设置" },
        locale: {
            title: "语言",
            select: "选择语言",
            current: "当前语言"
        }
    },
    fr: {
        title: { app: "Coquille AR" },
        panel: { 
            title: "Paramètres Rapides",
            section: { wifi: "Wi-Fi", locale: "Langue", status: "Statut" }
        },
        button: { close: "Fermer", toggle: "Paramètres" },
        locale: {
            title: "Langue",
            select: "Sélectionner la langue",
            current: "Langue actuelle"
        }
    }
};

// LS2 Service Wrapper - Production Grade
function ls2Request(uri, method, params, options) {
    options = options || {};
    var subscribe = options.subscribe || false;
    var timeout = options.timeout || 10000;
    
    return new Promise(function(resolve, reject) {
        var controller = window.webOS && window.webOS.service && window.webOS.service.request;
        if (!controller) {
            return reject(new Error('LS2 unavailable'));
        }

        var timedOut = false;
        var timer = setTimeout(function() {
            timedOut = true;
            reject(new Error('LS2 timeout after ' + timeout + ' ms'));
        }, timeout);

        var req = controller(uri, {
            method: method,
            parameters: params,
            subscribe: subscribe,
            onSuccess: function(res) { 
                if (!timedOut) { 
                    clearTimeout(timer); 
                    resolve(subscribe ? req : res); 
                } 
            },
            onFailure: function(err) { 
                if (!timedOut) { 
                    clearTimeout(timer); 
                    reject(new Error(err.errorText || 'LS2 failure')); 
                } 
            }
        });
    });
}

// App state
var panelOpen = false;
var currentLocale = 'en';
var systemLocale = null;
var wifiNetworks = [];
var wifiLoading = false;
var wifiError = null;

// Focus management
var focusableElements = [];
var currentFocusIndex = -1;
var viewStack = ['root'];
var currentView = 'root';
var focusHistory = new Map();

// Update time display
function updateTime() {
    var now = new Date();
    var timeString = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    var timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Load locale based on navigator.language
function loadLocale() {
    var language = navigator.language.split('-')[0];
    var localeTranslations = translations[language] || translations.en;
    currentLocale = language in translations ? language : 'en';
    
    // Update UI with translations
    updateUITranslations(localeTranslations);
    
    console.log('Loaded locale:', currentLocale, 'fallback to en:', !(language in translations));
}

// Update UI with translations
function updateUITranslations(localeTranslations) {
    document.getElementById('panel-title').textContent = localeTranslations.panel.title;
    document.getElementById('wifi-title').textContent = localeTranslations.panel.section.wifi;
    document.getElementById('locale-title').textContent = localeTranslations.locale.title || localeTranslations.panel.section.locale;
    document.getElementById('status-title').textContent = localeTranslations.panel.section.status;
    
    // Update locale content
    updateLocaleDisplay();
}

// Read system locale via LS2
function readSystemLocale() {
    ls2Request('luna://com.webos.settingsservice', 'getSystemSettings', { category: 'localeInfo' })
        .then(function(result) {
            console.log('System locale result:', result);
            
            if (result && result.settings && result.settings.localeInfo) {
                systemLocale = result.settings.localeInfo.locale;
                console.log('System locale:', systemLocale);
                
                // Update current locale based on system locale
                var localeCode = systemLocale.split('_')[0]; // Extract language code (e.g., 'en' from 'en_US')
                if (localeCode in translations) {
                    currentLocale = localeCode;
                    updateUITranslations(translations[localeCode]);
                }
                
                // Update UI to show system locale
                var localeDisplay = document.getElementById('locale-display');
                if (localeDisplay) {
                    localeDisplay.textContent = 'System locale: ' + systemLocale;
                }
            } else {
                console.log('No locale info found in system settings');
                var localeDisplay = document.getElementById('locale-display');
                if (localeDisplay) {
                    localeDisplay.textContent = 'System locale: Not available';
                }
            }
        })
        .catch(function(error) {
            console.error('Failed to read system locale:', error);
            var localeDisplay = document.getElementById('locale-display');
            if (localeDisplay) {
                localeDisplay.textContent = 'System locale: Error';
            }
        });
}

// Scan Wi-Fi networks
function scanWifiNetworks() {
    wifiLoading = true;
    wifiError = null;
    updateWifiDisplay();
    
    ls2Request('luna://com.webos.service.wifi', 'getNetworks', {})
        .then(function(result) {
            console.log('Wi-Fi scan result:', result);
            
            if (result && result.networks) {
                wifiNetworks = result.networks;
            } else {
                wifiNetworks = [];
            }
            wifiLoading = false;
            updateWifiDisplay();
        })
        .catch(function(error) {
            console.error('Wi-Fi scan error:', error);
            wifiError = error.message;
            wifiLoading = false;
            updateWifiDisplay();
            window.alert('Wi-Fi scan error: ' + error.message);
        });
}

// Update Wi-Fi display
function updateWifiDisplay() {
    var wifiContent = document.getElementById('wifi-content');
    if (!wifiContent) return;
    
    if (wifiLoading) {
        wifiContent.innerHTML = '<div class="loading">Scanning for Wi-Fi networks...</div>';
        return;
    }
    
    if (wifiError) {
        wifiContent.innerHTML = '<div class="error">Error: ' + wifiError + '</div>';
        return;
    }
    
    if (wifiNetworks.length === 0) {
        wifiContent.innerHTML = '<div class="empty-state">No Wi-Fi adapter in emulator</div>';
        return;
    }
    
    var html = '<div style="margin-bottom: 8px; font-weight: 600;">Available Networks (' + wifiNetworks.length + '):</div>';
    html += '<div class="wifi-list">';
    
    wifiNetworks.forEach(function(network, index) {
        html += '<div class="wifi-item">';
        html += '<div class="wifi-name">' + (network.ssid || 'Unknown') + '</div>';
        html += '<div class="wifi-details">';
        html += 'Signal: ' + (network.signalStrength || 'Unknown') + ' | ';
        html += 'Security: ' + (network.security || 'Open');
        html += '</div></div>';
    });
    
    html += '</div>';
    html += '<button onclick="scanWifiNetworks()" class="btn" style="margin-top: 12px;">Refresh</button>';
    
    wifiContent.innerHTML = html;
}

// Update locale display
function updateLocaleDisplay() {
    var localeContent = document.getElementById('locale-content');
    if (!localeContent) return;
    
    var locales = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'zh', name: 'Chinese', native: '中文' },
        { code: 'fr', name: 'French', native: 'Français' }
    ];
    
    var currentTranslations = translations[currentLocale] || translations.en;
    
    var html = '<div style="margin-bottom: 12px; font-size: 11px; color: #999;">';
    html += currentTranslations.locale.current || 'Current Language';
    html += '</div>';
    html += '<div class="locale-list">';
    
    locales.forEach(function(locale) {
        var isSelected = currentLocale === locale.code;
        html += '<div class="locale-item' + (isSelected ? ' selected' : '') + '" data-locale="' + locale.code + '" onclick="changeLocale(\'' + locale.code + '\')">';
        html += '<div class="locale-name">' + locale.native + ' (' + locale.code.toUpperCase() + ')</div>';
        if (isSelected) {
            html += '<div class="locale-check">✓</div>';
        }
        html += '</div>';
    });
    
    html += '</div>';
    localeContent.innerHTML = html;
}

// Change locale
function changeLocale(newLocale) {
    var previousLocale = currentLocale;
    
    // Optimistically update UI
    currentLocale = newLocale;
    updateUITranslations(translations[newLocale]);
    
    // Call LS2 to set system locale
    ls2Request('luna://com.webos.settingsservice', 'setSystemSettings', { 
        category: 'localeInfo', 
        settings: { locale: newLocale } 
    })
    .then(function(result) {
        console.log('Locale change result:', result);
        systemLocale = newLocale;
        console.log('Locale changed successfully to:', newLocale);
    })
    .catch(function(error) {
        console.error('Locale change failed:', error);
        alert('Locale change failed: ' + error.message);
        
        // Revert to previous locale
        currentLocale = previousLocale;
        updateUITranslations(translations[previousLocale]);
    });
}

// Panel functions
function togglePanel() {
    panelOpen = !panelOpen;
    var panel = document.getElementById('settings-panel');
    if (panelOpen) {
        panel.classList.add('open');
        pushView('panel');
        
        // Register panel focusable elements
        registerPanelFocusableElements();
        
        // Restore focus for panel
        setTimeout(function() {
            restoreFocus();
        }, 100);
        
        // Scan Wi-Fi when panel opens
        scanWifiNetworks();
    } else {
        panel.classList.remove('open');
        popView();
        
        // Clear panel focusable elements
        focusableElements = focusableElements.filter(function(element) {
            return element.getAttribute('data-view-id') !== 'panel';
        });
        
        // Restore focus to status bar
        setTimeout(function() {
            restoreFocus();
        }, 100);
    }
}

function registerPanelFocusableElements() {
    // Register close button
    var closeButton = document.querySelector('.close-button');
    if (closeButton) {
        registerFocusable(closeButton, 'panel');
        closeButton.onActivate = closePanel;
    }
    
    // Register locale items
    var localeItems = document.querySelectorAll('.locale-item');
    localeItems.forEach(function(item) {
        registerFocusable(item, 'panel');
        item.onActivate = function() {
            var localeCode = item.getAttribute('data-locale');
            if (localeCode) {
                changeLocale(localeCode);
            }
        };
    });
}

function closePanel() {
    panelOpen = false;
    document.getElementById('settings-panel').classList.remove('open');
    
    // Clear panel focusable elements
    clearView('panel');
    popView();
    
    // Force reset to root view and clear focus
    currentView = 'root';
    currentFocusIndex = -1;
    
    // Clear any remaining focus indicators
    document.querySelectorAll('.focused').forEach(function(el) {
        el.classList.remove('focused');
    });
    
    // Restore focus to root view
    setTimeout(function() {
        restoreFocus();
        updateDebugPanel(); // Update debug panel
    }, 100);
}

// Keyboard listener for F1 key
function handleKeyDown(event) {
    if (event.key === 'F1') {
        event.preventDefault();
        togglePanel();
    }
}

// Focus management functions
function registerFocusable(element, viewId) {
    if (!element || focusableElements.includes(element)) return;
    
    element.setAttribute('data-focusable', 'true');
    element.setAttribute('data-view-id', viewId);
    focusableElements.push(element);
    sortFocusableElements();
    
    console.log('Registered element for view ' + viewId + ', total elements: ' + focusableElements.length);
}

function unregisterFocusable(element) {
    var index = focusableElements.indexOf(element);
    if (index > -1) {
        focusableElements.splice(index, 1);
        element.removeAttribute('data-focusable');
        element.removeAttribute('data-view-id');
        
        if (currentFocusIndex >= focusableElements.length) {
            currentFocusIndex = focusableElements.length - 1;
        }
        
        console.log('Unregistered element, total elements: ' + focusableElements.length);
    }
}

function clearView(viewId) {
    var elementsToRemove = focusableElements.filter(function(element) {
        return element.getAttribute('data-view-id') === viewId;
    });
    
    elementsToRemove.forEach(function(element) {
        element.removeAttribute('data-focusable');
        element.removeAttribute('data-view-id');
    });
    
    focusableElements = focusableElements.filter(function(element) {
        return element.getAttribute('data-view-id') !== viewId;
    });
    
    // Adjust current focus index if needed
    if (currentFocusIndex >= focusableElements.length) {
        currentFocusIndex = focusableElements.length - 1;
    }
    
    console.log('Cleared view ' + viewId + ', remaining elements: ' + focusableElements.length);
}

// Auto-scroll to keep focused element visible
function scrollToElement(element) {
    if (!element || !document.contains(element)) return;
    
    var rect = element.getBoundingClientRect();
    var container = findScrollableContainer(element);
    
    if (!container) return;
    
    var containerRect = container.getBoundingClientRect();
    var scrollTop = container.scrollTop;
    var scrollLeft = container.scrollLeft;
    
    // Check if element is outside visible area
    var shouldScroll = false;
    var newScrollTop = scrollTop;
    var newScrollLeft = scrollLeft;
    
    // Vertical scrolling
    if (rect.top < containerRect.top) {
        // Element is above visible area
        newScrollTop = scrollTop - (containerRect.top - rect.top) - 20; // 20px margin
        shouldScroll = true;
    } else if (rect.bottom > containerRect.bottom) {
        // Element is below visible area
        newScrollTop = scrollTop + (rect.bottom - containerRect.bottom) + 20; // 20px margin
        shouldScroll = true;
    }
    
    // Horizontal scrolling
    if (rect.left < containerRect.left) {
        // Element is left of visible area
        newScrollLeft = scrollLeft - (containerRect.left - rect.left) - 20; // 20px margin
        shouldScroll = true;
    } else if (rect.right > containerRect.right) {
        // Element is right of visible area
        newScrollLeft = scrollLeft + (rect.right - containerRect.right) + 20; // 20px margin
        shouldScroll = true;
    }
    
    if (shouldScroll) {
        container.scrollTo({
            top: newScrollTop,
            left: newScrollLeft,
            behavior: 'smooth'
        });
    }
}

// Find the scrollable container for an element
function findScrollableContainer(element) {
    var parent = element.parentElement;
    var bestContainer = null;
    
    while (parent && parent !== document.body) {
        var style = window.getComputedStyle(parent);
        var overflow = style.overflow + style.overflowY + style.overflowX;
        
        if (overflow.includes('auto') || overflow.includes('scroll')) {
            // Prefer the main panel container over smaller list containers
            if (parent.classList.contains('panel-sections')) {
                return parent; // This is the main panel scroll container
            }
            bestContainer = parent; // Keep track of any scrollable container as fallback
        }
        
        parent = parent.parentElement;
    }
    
    return bestContainer;
}

function sortFocusableElements() {
    focusableElements.sort(function(a, b) {
        var rectA = a.getBoundingClientRect();
        var rectB = b.getBoundingClientRect();
        
        if (Math.abs(rectA.top - rectB.top) > 10) {
            return rectA.top - rectB.top;
        }
        return rectA.left - rectB.left;
    });
}

// Get elements for current view
function getCurrentViewElements() {
    return focusableElements.filter(function(element) {
        return element.getAttribute('data-view-id') === currentView;
    });
}

// Get view-specific index for current view
function getViewIndex(globalIndex) {
    var currentViewElements = getCurrentViewElements();
    if (globalIndex >= 0 && globalIndex < focusableElements.length) {
        var element = focusableElements[globalIndex];
        return currentViewElements.indexOf(element);
    }
    return -1;
}

// Get global index from view index
function getGlobalIndex(viewIndex) {
    var currentViewElements = getCurrentViewElements();
    if (viewIndex >= 0 && viewIndex < currentViewElements.length) {
        var element = currentViewElements[viewIndex];
        return focusableElements.indexOf(element);
    }
    return -1;
}

function clearFocus() {
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
        var element = focusableElements[currentFocusIndex];
        if (document.contains(element)) {
            element.classList.remove('focused');
        }
    }
}

function setFocus(index) {
    if (index >= 0 && index < focusableElements.length) {
        var element = focusableElements[index];
        
        // Validate element still exists in DOM
        if (!document.contains(element)) {
            console.warn('Element no longer in DOM, removing from focusable elements');
            unregisterFocusable(element);
            return;
        }
        
        currentFocusIndex = index;
        element.classList.add('focused');
        element.focus();
        
        // Auto-scroll to keep focused element visible
        scrollToElement(element);
        
        // Save focus position for current view
        var viewIndex = getViewIndex(index);
        if (viewIndex >= 0) {
            focusHistory.set(currentView, viewIndex);
        }
        
        console.log('Set focus to element at index ' + index + ', view index ' + viewIndex);
        
        // Update debug panel
        updateDebugPanel();
    } else {
        console.warn('Invalid focus index: ' + index + ', total elements: ' + focusableElements.length);
    }
}

function moveNext() {
    var currentViewElements = getCurrentViewElements();
    if (currentViewElements.length === 0) {
        console.log('No focusable elements in current view');
        return;
    }
    
    clearFocus();
    
    var nextViewIndex;
    if (currentFocusIndex < 0) {
        // No current focus, start at first element
        nextViewIndex = 0;
    } else {
        var currentViewIndex = getViewIndex(currentFocusIndex);
        if (currentViewIndex < currentViewElements.length - 1) {
            nextViewIndex = currentViewIndex + 1;
        } else {
            // Wrap to first element
            nextViewIndex = 0;
        }
    }
    
    var nextGlobalIndex = getGlobalIndex(nextViewIndex);
    setFocus(nextGlobalIndex);
    
    console.log('Moved to next element, view index: ' + nextViewIndex + ', global index: ' + nextGlobalIndex);
}

function movePrev() {
    var currentViewElements = getCurrentViewElements();
    if (currentViewElements.length === 0) {
        console.log('No focusable elements in current view');
        return;
    }
    
    clearFocus();
    
    var prevViewIndex;
    if (currentFocusIndex < 0) {
        // No current focus, start at last element
        prevViewIndex = currentViewElements.length - 1;
    } else {
        var currentViewIndex = getViewIndex(currentFocusIndex);
        if (currentViewIndex > 0) {
            prevViewIndex = currentViewIndex - 1;
        } else {
            // Wrap to last element
            prevViewIndex = currentViewElements.length - 1;
        }
    }
    
    var prevGlobalIndex = getGlobalIndex(prevViewIndex);
    setFocus(prevGlobalIndex);
    
    console.log('Moved to previous element, view index: ' + prevViewIndex + ', global index: ' + prevGlobalIndex);
}

function activate() {
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
        var element = focusableElements[currentFocusIndex];
        
        // Validate element still exists
        if (!document.contains(element)) {
            console.warn('Focused element no longer in DOM');
            unregisterFocusable(element);
            return;
        }
        
        if (element.onActivate) {
            console.log('Activating element with onActivate handler');
            element.onActivate();
        } else {
            console.log('Activating element with click event');
            element.click();
        }
    } else {
        console.warn('No element focused to activate');
    }
}

function pushView(viewId) {
    viewStack.push(viewId);
    currentView = viewId;
    console.log('View stack:', viewStack, 'Current view:', currentView);
}

function popView() {
    if (viewStack.length > 1) {
        var poppedView = viewStack.pop();
        currentView = viewStack[viewStack.length - 1];
        console.log('Popped view:', poppedView, 'Current view:', currentView);
        return currentView;
    }
    return null;
}

function restoreFocus() {
    var savedViewIndex = focusHistory.get(currentView);
    var currentViewElements = getCurrentViewElements();
    
    if (savedViewIndex !== undefined && savedViewIndex >= 0 && savedViewIndex < currentViewElements.length) {
        var globalIndex = getGlobalIndex(savedViewIndex);
        setFocus(globalIndex);
        console.log('Restored focus to view index ' + savedViewIndex + ', global index ' + globalIndex);
    } else if (currentViewElements.length > 0) {
        // Default to first element if no saved focus
        var globalIndex = getGlobalIndex(0);
        setFocus(globalIndex);
        console.log('Set focus to first element, global index ' + globalIndex);
    } else {
        console.log('No focusable elements in current view');
    }
}

// Rotary input handling
function handleRotaryInput(event) {
    var keyCode = event.code;
    
    switch (keyCode) {
        case 'ArrowUp':
            event.preventDefault();
            console.log('Scroll forward - focus next');
            moveNext();
            break;
        case 'ArrowDown':
            event.preventDefault();
            console.log('Scroll back - focus previous');
            movePrev();
            break;
        case 'Enter':
            event.preventDefault();
            console.log('Single click - activate');
            activate();
            break;
        case 'Escape':
            event.preventDefault();
            console.log('Double click - back');
            handleBack();
            break;
    }
}

function handleBack() {
    var currentView = viewStack[viewStack.length - 1];
    
    if (currentView === 'panel') {
        closePanel();
    }
}

function handleRotaryPanelClose() {
    panelOpen = false;
    document.getElementById('settings-panel').classList.remove('open');
    
    // Clear panel focusable elements
    clearView('panel');
    
    // Restore focus to status bar
    setTimeout(function() {
        restoreFocus();
    }, 100);
}

// Initialize app
function initApp() {
    // Update time immediately and set interval
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
    
    // Load locale
    loadLocale();
    
    // Read system locale
    readSystemLocale();
    
    // Register status bar as focusable
    var statusBar = document.querySelector('.status-bar');
    if (statusBar) {
        registerFocusable(statusBar, 'root');
        statusBar.onActivate = togglePanel;
    }

    // Register test buttons as focusable
    var testButtons = document.querySelectorAll('.test-button');
    testButtons.forEach(function(button) {
        registerFocusable(button, 'root');
        button.onActivate = function() {
            if (button.textContent.includes('Status Bar')) {
                testStatusBarClick();
            } else if (button.textContent.includes('Direct Toggle')) {
                testDirectToggle();
            } else if (button.textContent.includes('Debug Focus')) {
                debugFocusState();
            } else if (button.textContent.includes('Force Focus')) {
                forceFocusToStatusBar();
            } else if (button.textContent.includes('Emergency Recovery')) {
                emergencyRecovery();
            }
        };
    });
    
    // Set initial focus
    setTimeout(function() {
        restoreFocus();
        updateDebugPanel(); // Initialize debug panel
    }, 100);
    
    // Add event listeners
    document.addEventListener('keydown', handleRotaryInput);
    document.addEventListener('rotaryPanelClose', handleRotaryPanelClose);
}

// Test button functions
function testStatusBarClick() {
    console.log('Test button clicked - Status Bar');
    var statusBar = document.querySelector('.status-bar');
    if (statusBar) {
        console.log('Status bar found, triggering click');
        statusBar.click();
    } else {
        console.log('Status bar not found');
    }
}

function testDirectToggle() {
    console.log('Test button clicked - Direct Toggle');
    togglePanel();
}

function debugFocusState() {
    console.log('=== Debug Focus State ===');
    console.log('Panel open:', panelOpen);
    console.log('Status bar element:', document.querySelector('.status-bar'));
    var statusBarElement = document.querySelector('.status-bar');
    console.log('Status bar focusable:', statusBarElement ? statusBarElement.getAttribute('data-focusable') : 'null');
    console.log('Current view:', currentView);
    console.log('View stack:', viewStack);
    console.log('Focusable elements:', focusableElements.length);
    console.log('Current focus index:', currentFocusIndex);
    console.log('Focus history:', Object.fromEntries(focusHistory));
    console.log('=======================');
    
    // Update debug panel
    updateDebugPanel();
}

function updateDebugPanel() {
    var currentElement = currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length ? focusableElements[currentFocusIndex] : null;
    var focusedElements = document.querySelectorAll('.focused').length;
    
    document.getElementById('debug-index').textContent = currentFocusIndex;
    document.getElementById('debug-elements').textContent = focusableElements.length;
    document.getElementById('debug-view').textContent = currentView;
    document.getElementById('debug-focused').textContent = focusedElements;
    document.getElementById('debug-element').textContent = currentElement ? currentElement.textContent.substring(0, 20) : 'none';
    document.getElementById('debug-handler').textContent = currentElement && typeof currentElement.onActivate === 'function' ? 'function' : 'none';
}

function forceFocusToStatusBar() {
    console.log('Force focusing to status bar');
    var statusBar = document.querySelector('.status-bar');
    if (statusBar) {
        registerFocusable(statusBar, 'root');
        statusBar.onActivate = togglePanel;
        setFocus(0);
    }
}

function emergencyRecovery() {
    console.log('Emergency focus recovery triggered');
    
    // Clear any current focus
    clearFocus();
    
    // Reset focus index
    currentFocusIndex = -1;
    
    // Validate all elements
    var validElements = focusableElements.filter(function(element) {
        return document.contains(element);
    });
    focusableElements = validElements;
    
    // Try to set focus to first available element
    if (focusableElements.length > 0) {
        setFocus(0);
        console.log('Emergency recovery: focus set to first element');
    } else {
        console.log('Emergency recovery: no focusable elements available');
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 
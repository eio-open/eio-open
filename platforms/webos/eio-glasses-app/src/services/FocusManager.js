// FocusManager - Singleton for managing focusable elements
class FocusManager {
  constructor() {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.viewStack = ['root'];
    this.focusHistory = new Map(); // Remember last focus per view
    this.currentView = 'root';
  }

  // Register a focusable element
  register(element, viewId = 'default') {
    if (!element || this.focusableElements.includes(element)) {
      return;
    }

    element.setAttribute('data-focusable', 'true');
    element.setAttribute('data-view-id', viewId);
    this.focusableElements.push(element);
    
    // Sort elements by visual order (top-to-bottom, left-to-right)
    this.sortElements();
    
    console.log(`Registered element for view ${viewId}, total elements: ${this.focusableElements.length}`);
  }

  // Unregister a focusable element
  unregister(element) {
    const index = this.focusableElements.indexOf(element);
    if (index > -1) {
      this.focusableElements.splice(index, 1);
      element.removeAttribute('data-focusable');
      element.removeAttribute('data-view-id');
      
      // Adjust current focus index if needed
      if (this.currentFocusIndex >= this.focusableElements.length) {
        this.currentFocusIndex = this.focusableElements.length - 1;
      }
      
      console.log(`Unregistered element, total elements: ${this.focusableElements.length}`);
    }
  }

  // Clear all focusable elements for a specific view
  clearView(viewId) {
    const elementsToRemove = this.focusableElements.filter(element => 
      element.getAttribute('data-view-id') === viewId
    );
    
    // Check if current focus is on an element being removed
    const currentElement = this.getCurrentElement();
    const isRemovingCurrentFocus = currentElement && elementsToRemove.includes(currentElement);
    
    elementsToRemove.forEach(element => {
      element.removeAttribute('data-focusable');
      element.removeAttribute('data-view-id');
    });
    
    this.focusableElements = this.focusableElements.filter(element => 
      element.getAttribute('data-view-id') !== viewId
    );
    
    // If we removed the current focus, reset it
    if (isRemovingCurrentFocus) {
      this.currentFocusIndex = -1;
      console.log('Removed current focus element, resetting focus index');
    } else if (this.currentFocusIndex >= this.focusableElements.length) {
      // Adjust current focus index if needed
      this.currentFocusIndex = this.focusableElements.length - 1;
    }
    
    console.log(`Cleared view ${viewId}, remaining elements: ${this.focusableElements.length}, current focus index: ${this.currentFocusIndex}`);
  }

  // Clear all focusable elements
  clear() {
    this.focusableElements.forEach(element => {
      element.removeAttribute('data-focusable');
      element.removeAttribute('data-view-id');
    });
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    console.log('Cleared all focusable elements');
  }

  // Sort elements by visual order (top-to-bottom, left-to-right)
  sortElements() {
    this.focusableElements.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      
      // First by vertical position (top-to-bottom)
      if (Math.abs(rectA.top - rectB.top) > 10) {
        return rectA.top - rectB.top;
      }
      
      // Then by horizontal position (left-to-right)
      return rectA.left - rectB.left;
    });
  }

  // Get elements for current view
  getCurrentViewElements() {
    return this.focusableElements.filter(element => 
      element.getAttribute('data-view-id') === this.currentView
    );
  }

  // Get view-specific index for current view
  getViewIndex(globalIndex) {
    const currentViewElements = this.getCurrentViewElements();
    if (globalIndex >= 0 && globalIndex < this.focusableElements.length) {
      const element = this.focusableElements[globalIndex];
      return currentViewElements.indexOf(element);
    }
    return -1;
  }

  // Get global index from view index
  getGlobalIndex(viewIndex) {
    const currentViewElements = this.getCurrentViewElements();
    if (viewIndex >= 0 && viewIndex < currentViewElements.length) {
      const element = currentViewElements[viewIndex];
      return this.focusableElements.indexOf(element);
    }
    return -1;
  }

  // Move focus to next element in current view
  moveNext() {
    const currentViewElements = this.getCurrentViewElements();
    if (currentViewElements.length === 0) {
      console.log('No focusable elements in current view');
      return;
    }

    this.clearCurrentFocus();
    
    let nextViewIndex;
    if (this.currentFocusIndex < 0) {
      // No current focus, start at first element
      nextViewIndex = 0;
    } else {
      const currentViewIndex = this.getViewIndex(this.currentFocusIndex);
      if (currentViewIndex < currentViewElements.length - 1) {
        nextViewIndex = currentViewIndex + 1;
      } else {
        // Wrap to first element
        nextViewIndex = 0;
      }
    }
    
    const nextGlobalIndex = this.getGlobalIndex(nextViewIndex);
    this.setFocus(nextGlobalIndex);
    
    console.log(`Moved to next element, view index: ${nextViewIndex}, global index: ${nextGlobalIndex}`);
  }

  // Move focus to next element globally (simplified)
  moveNextGlobal() {
    if (this.focusableElements.length === 0) {
      console.log('No focusable elements at all');
      return;
    }

    this.clearCurrentFocus();
    
    // Safety check: if current focus index is invalid, start from beginning
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      console.log('Invalid focus index, resetting to 0');
      this.currentFocusIndex = 0;
    } else if (this.currentFocusIndex < this.focusableElements.length - 1) {
      this.currentFocusIndex++;
    } else {
      // Wrap to first element
      this.currentFocusIndex = 0;
    }
    
    this.setFocus(this.currentFocusIndex);
    console.log(`Moved to next element globally, index: ${this.currentFocusIndex}`);
  }

  // Move focus to previous element in current view
  movePrev() {
    const currentViewElements = this.getCurrentViewElements();
    if (currentViewElements.length === 0) {
      console.log('No focusable elements in current view');
      return;
    }

    this.clearCurrentFocus();
    
    let prevViewIndex;
    if (this.currentFocusIndex < 0) {
      // No current focus, start at last element
      prevViewIndex = currentViewElements.length - 1;
    } else {
      const currentViewIndex = this.getViewIndex(this.currentFocusIndex);
      if (currentViewIndex > 0) {
        prevViewIndex = currentViewIndex - 1;
      } else {
        // Wrap to last element
        prevViewIndex = currentViewElements.length - 1;
      }
    }
    
    const prevGlobalIndex = this.getGlobalIndex(prevViewIndex);
    this.setFocus(prevGlobalIndex);
    
    console.log(`Moved to previous element, view index: ${prevViewIndex}, global index: ${prevGlobalIndex}`);
  }

  // Move focus to previous element globally (simplified)
  movePrevGlobal() {
    if (this.focusableElements.length === 0) {
      console.log('No focusable elements at all');
      return;
    }

    this.clearCurrentFocus();
    
    // Safety check: if current focus index is invalid, start from end
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      console.log('Invalid focus index, resetting to last element');
      this.currentFocusIndex = this.focusableElements.length - 1;
    } else if (this.currentFocusIndex > 0) {
      this.currentFocusIndex--;
    } else {
      // Wrap to last element
      this.currentFocusIndex = this.focusableElements.length - 1;
    }
    
    this.setFocus(this.currentFocusIndex);
    console.log(`Moved to previous element globally, index: ${this.currentFocusIndex}`);
  }

  // Set focus to specific element
  setFocus(globalIndex) {
    if (globalIndex >= 0 && globalIndex < this.focusableElements.length) {
      const element = this.focusableElements[globalIndex];
      
      // Validate element still exists in DOM
      if (!document.contains(element)) {
        console.warn('Element no longer in DOM, removing from focusable elements');
        this.unregister(element);
        return;
      }
      
      // Clear any existing focus first
      this.clearCurrentFocus();
      
      // Set new focus
      this.currentFocusIndex = globalIndex;
      element.classList.add('focused');
      element.focus();
      
      // Auto-scroll to keep focused element visible
      this.scrollToElement(element);
      
      // Save focus position for current view (using view-specific index)
      const viewIndex = this.getViewIndex(globalIndex);
      if (viewIndex >= 0) {
        this.focusHistory.set(this.currentView, viewIndex);
      }
      
      console.log(`Set focus to element at global index ${globalIndex}, view index ${viewIndex}, element:`, element);
    } else {
      console.warn(`Invalid focus index: ${globalIndex}, total elements: ${this.focusableElements.length}`);
    }
  }

  // Clear current focus
  clearCurrentFocus() {
    // Clear focus from current element
    if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
      const element = this.focusableElements[this.currentFocusIndex];
      if (document.contains(element)) {
        element.classList.remove('focused');
      }
    }
    
    // Also clear any stray focus indicators
    document.querySelectorAll('.focused').forEach(el => {
      el.classList.remove('focused');
    });
    
    // Reset focus index
    this.currentFocusIndex = -1;
    
    console.log('Cleared current focus completely');
  }

  // Activate currently focused element
  activate() {
    if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
      const element = this.focusableElements[this.currentFocusIndex];
      
      // Validate element still exists
      if (!document.contains(element)) {
        console.warn('Focused element no longer in DOM');
        this.unregister(element);
        return;
      }
      
      const onActivate = element.onActivate;
      
      if (typeof onActivate === 'function') {
        console.log('Activating element with onActivate handler');
        onActivate();
      } else {
        // Fallback: trigger click event
        console.log('Activating element with click event');
        element.click();
      }
    } else {
      console.warn('No element focused to activate');
    }
  }

  // Push a new view onto the stack
  pushView(viewId) {
    this.viewStack.push(viewId);
    this.currentView = viewId;
    console.log('View stack:', this.viewStack, 'Current view:', this.currentView);
  }

  // Pop the current view from the stack
  popView() {
    if (this.viewStack.length > 1) {
      // Clear current focus before switching
      this.clearCurrentFocus();
      
      const poppedView = this.viewStack.pop();
      this.currentView = this.viewStack[this.viewStack.length - 1];
      console.log('Popped view:', poppedView, 'Current view:', this.currentView);
      
      // Restore focus for the new current view
      setTimeout(() => {
        this.restoreFocus();
      }, 50);
      
      return this.currentView;
    }
    return null;
  }

  // Get current view ID
  getCurrentView() {
    return this.currentView;
  }

  // Restore focus for current view
  restoreFocus() {
    // Clear any existing focus first
    this.clearCurrentFocus();
    
    const savedViewIndex = this.focusHistory.get(this.currentView);
    const currentViewElements = this.getCurrentViewElements();
    
    console.log(`RestoreFocus: currentView=${this.currentView}, savedViewIndex=${savedViewIndex}, currentViewElements.length=${currentViewElements.length}`);
    
    if (savedViewIndex !== undefined && savedViewIndex >= 0 && savedViewIndex < currentViewElements.length) {
      const globalIndex = this.getGlobalIndex(savedViewIndex);
      this.setFocus(globalIndex);
      console.log(`Restored focus to view index ${savedViewIndex}, global index ${globalIndex}`);
    } else if (currentViewElements.length > 0) {
      // Default to first element if no saved focus
      const globalIndex = this.getGlobalIndex(0);
      this.setFocus(globalIndex);
      console.log(`Set focus to first element, global index ${globalIndex}`);
    } else {
      console.log('No focusable elements in current view');
      console.log('All focusable elements:', this.focusableElements.map(el => ({
        viewId: el.getAttribute('data-view-id'),
        element: el
      })));
    }
  }

  // Get currently focused element
  getCurrentElement() {
    if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
      const element = this.focusableElements[this.currentFocusIndex];
      if (document.contains(element)) {
        return element;
      } else {
        console.warn('Current element no longer in DOM');
        this.unregister(element);
        return null;
      }
    }
    return null;
  }

  // Get all focusable elements for current view
  getFocusableElements() {
    return this.getCurrentViewElements();
  }

  // Validate and clean up invalid elements
  validateElements() {
    const validElements = this.focusableElements.filter(element => document.contains(element));
    const removedCount = this.focusableElements.length - validElements.length;
    
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} invalid elements from focus manager`);
      this.focusableElements = validElements;
      
      // Adjust current focus index if needed
      if (this.currentFocusIndex >= this.focusableElements.length) {
        this.currentFocusIndex = this.focusableElements.length - 1;
      }
    }
  }

  // Emergency recovery - reset focus state
  emergencyRecovery() {
    console.log('Emergency focus recovery triggered');
    
    // Clear ALL focus indicators
    document.querySelectorAll('.focused').forEach(el => {
      el.classList.remove('focused');
    });
    
    // Reset state
    this.currentFocusIndex = -1;
    this.currentView = 'root';
    
    // Re-register all visible focusable elements
    this.reRegisterAllElements();
    
    // Find status bar and focus it directly
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
      console.log('Emergency recovery: focusing status bar directly');
      
      // Register if needed
      if (!this.focusableElements.includes(statusBar)) {
        this.register(statusBar, 'root');
      }
      
      // Find index and set focus directly
      const index = this.focusableElements.indexOf(statusBar);
      if (index >= 0) {
        console.log('Emergency recovery: setting focus to status bar at index:', index);
        this.currentFocusIndex = index;
        statusBar.classList.add('focused');
        statusBar.focus();
        return;
      }
    }
    
    // Fallback to first element
    if (this.focusableElements.length > 0) {
      console.log('Emergency recovery: setting focus to first element');
      this.currentFocusIndex = 0;
      const firstElement = this.focusableElements[0];
      firstElement.classList.add('focused');
      firstElement.focus();
    } else {
      console.log('Emergency recovery: no focusable elements available');
    }
  }

  // Re-register all visible focusable elements
  reRegisterAllElements() {
    console.log('Re-registering all focusable elements');
    
    // Clear current list
    this.focusableElements = [];
    
    // Find all elements with data-focusable attribute
    const allFocusable = document.querySelectorAll('[data-focusable="true"]');
    console.log('Found', allFocusable.length, 'elements with data-focusable attribute');
    
    allFocusable.forEach((element, index) => {
      const viewId = element.getAttribute('data-view-id') || 'root';
      this.focusableElements.push(element);
      console.log(`Re-registered element ${index}:`, element, 'view:', viewId);
    });
    
    // Sort elements
    this.sortElements();
    
    console.log('Re-registration complete. Total elements:', this.focusableElements.length);
  }

  // Auto-scroll to keep focused element visible
  scrollToElement(element) {
    if (!element || !document.contains(element)) return;
    
    const rect = element.getBoundingClientRect();
    const container = this.findScrollableContainer(element);
    
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    
    // Check if element is outside visible area
    let shouldScroll = false;
    let newScrollTop = scrollTop;
    let newScrollLeft = scrollLeft;
    
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
  findScrollableContainer(element) {
    let parent = element.parentElement;
    let bestContainer = null;
    
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const overflow = style.overflow + style.overflowY + style.overflowX;
      
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

  // Debug info
  debug() {
    console.log('FocusManager Debug Info:');
    console.log('- Current view:', this.currentView);
    console.log('- View stack:', this.viewStack);
    console.log('- Total elements:', this.focusableElements.length);
    console.log('- Current focus index:', this.currentFocusIndex);
    console.log('- Focus history:', Object.fromEntries(this.focusHistory));
    
    const currentViewElements = this.getCurrentViewElements();
    console.log('- Current view elements:', currentViewElements.length);
    
    if (this.currentFocusIndex >= 0) {
      const currentElement = this.getCurrentElement();
      console.log('- Current element:', currentElement);
    }
  }
}

// Export singleton instance
const focusManager = new FocusManager();
export default focusManager; 
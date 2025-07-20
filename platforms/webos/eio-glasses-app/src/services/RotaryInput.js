// RotaryInput - Handles rotary wheel input events
import focusManager from './FocusManager.js';

class RotaryInput {
  constructor() {
    this.isEnabled = true;
    this.keyMap = {
      'ArrowUp': 'KEY_UP',
      'ArrowDown': 'KEY_DOWN', 
      'Enter': 'KEY_ENTER',
      'Escape': 'KEY_BACK'
    };
  }

  // Enable rotary input handling
  enable() {
    this.isEnabled = true;
  }

  // Disable rotary input handling
  disable() {
    this.isEnabled = false;
  }

  // Initialize event listeners
  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    console.log('Rotary input initialized');
    
    // Test if event listener is working
    setTimeout(() => {
      console.log('Rotary input test: Event listener should be active');
      console.log('Rotary input enabled:', this.isEnabled);
    }, 1000);
  }

  // Handle key down events
  handleKeyDown(event) {
    if (!this.isEnabled) return;

    const keyCode = this.keyMap[event.code];
    if (!keyCode) return;

    // Prevent default behavior for rotary keys
    event.preventDefault();
    event.stopPropagation();

    console.log('Rotary input:', keyCode);
    console.log('Current focus state:', {
      currentElement: focusManager.getCurrentElement(),
      currentIndex: focusManager.currentFocusIndex,
      totalElements: focusManager.focusableElements.length,
      enabled: this.isEnabled
    });

    switch (keyCode) {
      case 'KEY_UP':
        this.handleScrollForward();
        break;
      case 'KEY_DOWN':
        this.handleScrollBack();
        break;
      case 'KEY_ENTER':
        this.handleSingleClick();
        break;
      case 'KEY_BACK':
        this.handleDoubleClick();
        break;
    }
  }

  // Handle scroll forward (focus next)
  handleScrollForward() {
    console.log('Scroll forward - focus next');
    // Use global navigation to avoid view issues
    focusManager.moveNextGlobal();
    
    // Emergency recovery if focus is stuck
    setTimeout(() => {
      const currentElement = focusManager.getCurrentElement();
      if (!currentElement) {
        console.log('Focus appears stuck, triggering emergency recovery');
        focusManager.emergencyRecovery();
      }
    }, 100);
  }

  // Handle scroll back (focus previous)
  handleScrollBack() {
    console.log('Scroll back - focus previous');
    // Use global navigation to avoid view issues
    focusManager.movePrevGlobal();
    
    // Emergency recovery if focus is stuck
    setTimeout(() => {
      const currentElement = focusManager.getCurrentElement();
      if (!currentElement) {
        console.log('Focus appears stuck, triggering emergency recovery');
        focusManager.emergencyRecovery();
      }
    }, 100);
  }

  // Handle single click (activate)
  handleSingleClick() {
    console.log('Single click - activate');
    focusManager.activate();
  }

  // Handle double click (back)
  handleDoubleClick() {
    console.log('Double click - back');
    const currentView = focusManager.getCurrentView();
    
    if (currentView === 'panel') {
      // Close panel and return to status bar
      this.closePanel();
    } else {
      // Already at root level, no action needed
      console.log('Already at root level');
    }
  }

  // Close panel and restore focus to status bar
  closePanel() {
    const previousView = focusManager.popView();
    if (previousView) {
      // Trigger panel close event
      const closeEvent = new CustomEvent('rotaryPanelClose', {
        detail: { previousView }
      });
      document.dispatchEvent(closeEvent);
    }
  }

  // Simulate rotary input for testing
  simulateInput(keyCode) {
    const event = new KeyboardEvent('keydown', {
      code: this.getKeyCodeFromRotary(keyCode),
      bubbles: true,
      cancelable: true
    });
    this.handleKeyDown(event);
  }

  // Get keyboard code from rotary key code
  getKeyCodeFromRotary(rotaryKey) {
    const reverseMap = Object.fromEntries(
      Object.entries(this.keyMap).map(([key, value]) => [value, key])
    );
    return reverseMap[rotaryKey];
  }
}

// Export singleton instance
const rotaryInput = new RotaryInput();
export default rotaryInput; 
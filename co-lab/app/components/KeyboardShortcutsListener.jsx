import { useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '../context/KeyboardShortcutContext';
import { useRouter } from 'next/navigation';

const KeyboardShortcutsListener = ({ onActionTriggered }) => {
  const { shortcuts, isListenerActive } = useKeyboardShortcuts();
  const router = useRouter();
  
  const handleKeyDown = useCallback((event) => {
    if (!isListenerActive) return;
    
    // Skip if user is typing in an input, textarea, or contentEditable element
    if (
      event.target.tagName === 'INPUT' || 
      event.target.tagName === 'TEXTAREA' || 
      event.target.isContentEditable
    ) {
      return;
    }
    
    // Create key combination string (e.g., "alt+shift+c")
    let keyCombo = [];
    if (event.ctrlKey) keyCombo.push('ctrl');
    if (event.altKey) keyCombo.push('alt');
    if (event.shiftKey) keyCombo.push('shift');
    if (event.metaKey) keyCombo.push('meta'); // Command key on Mac
    
    // Add the pressed key in lowercase
    keyCombo.push(event.key.toLowerCase());
    const keyString = keyCombo.join('+');
    
    // Check if this key combination is in our shortcuts
    if (shortcuts[keyString]) {
      event.preventDefault();
      
      const { action } = shortcuts[keyString];
      
      // Pass the action to the parent component to handle
      if (onActionTriggered) {
        onActionTriggered(action);
      }
    }
  }, [shortcuts, isListenerActive, onActionTriggered]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return null; // This is a non-visual component
};

export default KeyboardShortcutsListener;
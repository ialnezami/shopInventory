import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  focusIndicatorStyle: 'default' | 'high' | 'custom';
  colorScheme: 'light' | 'dark' | 'high-contrast';
}

export interface AccessibilityStatus {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isLargeText: boolean;
  isScreenReaderActive: boolean;
  isKeyboardNavigation: boolean;
  currentFocusElement: HTMLElement | null;
  focusHistory: HTMLElement[];
  colorContrastRatio: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private configSubject = new BehaviorSubject<AccessibilityConfig>(this.getDefaultConfig());
  private statusSubject = new BehaviorSubject<AccessibilityStatus>(this.getInitialStatus());
  
  public config$: Observable<AccessibilityConfig> = this.configSubject.asObservable();
  public status$: Observable<AccessibilityStatus> = this.statusSubject.asObservable();

  private focusHistory: HTMLElement[] = [];
  private focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  constructor() {
    this.initializeAccessibility();
  }

  private getDefaultConfig(): AccessibilityConfig {
    return {
      enableHighContrast: false,
      enableReducedMotion: false,
      enableLargeText: false,
      enableScreenReader: true,
      enableKeyboardNavigation: true,
      focusIndicatorStyle: 'default',
      colorScheme: 'light'
    };
  }

  private getInitialStatus(): AccessibilityStatus {
    return {
      isHighContrast: this.detectHighContrast(),
      isReducedMotion: this.detectReducedMotion(),
      isLargeText: this.detectLargeText(),
      isScreenReaderActive: this.detectScreenReader(),
      isKeyboardNavigation: false,
      currentFocusElement: null,
      focusHistory: [],
      colorContrastRatio: 4.5 // Default WCAG AA standard
    };
  }

  private initializeAccessibility(): void {
    // Listen for system preference changes
    this.setupMediaQueryListeners();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Setup focus management
    this.setupFocusManagement();
    
    // Setup screen reader detection
    this.setupScreenReaderDetection();
    
    // Initial accessibility check
    this.performAccessibilityAudit();
  }

  // Media Query Listeners
  private setupMediaQueryListeners(): void {
    // High contrast mode
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addEventListener('change', (e) => {
      this.updateStatus({ isHighContrast: e.matches });
      this.applyHighContrastMode(e.matches);
    });

    // Reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', (e) => {
      this.updateStatus({ isReducedMotion: e.matches });
      this.applyReducedMotionMode(e.matches);
    });

    // Color scheme
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', (e) => {
      const scheme = e.matches ? 'dark' : 'light';
      this.updateStatus({ colorScheme: scheme });
      this.applyColorScheme(scheme);
    });
  }

  // Keyboard Navigation Setup
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event);
    });

    // Track focus changes
    document.addEventListener('focusin', (event) => {
      this.handleFocusChange(event.target as HTMLElement);
    });

    document.addEventListener('focusout', (event) => {
      this.handleFocusOut(event.target as HTMLElement);
    });
  }

  // Focus Management
  private setupFocusManagement(): void {
    // Trap focus in modals
    this.setupFocusTrapping();
    
    // Skip to main content
    this.setupSkipLinks();
    
    // Focus indicators
    this.setupFocusIndicators();
  }

  private setupFocusTrapping(): void {
    // Focus trap for modals and dialogs
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }
    });
  }

  private setupSkipLinks(): void {
    // Create skip links for main content
    const skipLinks = [
      { text: 'Skip to main content', target: 'main-content' },
      { text: 'Skip to navigation', target: 'main-navigation' },
      { text: 'Skip to footer', target: 'main-footer' }
    ];

    skipLinks.forEach(link => {
      this.createSkipLink(link.text, link.target);
    });
  }

  private createSkipLink(text: string, targetId: string): void {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', text);
    
    // Style the skip link
    Object.assign(skipLink.style, {
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      textDecoration: 'none',
      zIndex: '10000',
      transition: 'top 0.3s'
    });

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  private setupFocusIndicators(): void {
    // Add focus indicator styles
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
      
      .focus-visible:not(:focus-visible) {
        outline: none !important;
      }
      
      .high-contrast .focus-visible {
        outline: 3px solid #ffff00 !important;
        outline-offset: 3px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Screen Reader Detection
  private setupScreenReaderDetection(): void {
    // Check for screen reader specific attributes
    this.detectScreenReaderFeatures();
    
    // Listen for screen reader announcements
    this.setupScreenReaderAnnouncements();
  }

  private detectScreenReaderFeatures(): void {
    // Check for screen reader specific CSS properties
    const testElement = document.createElement('div');
    testElement.style.speak = 'none';
    
    if (testElement.style.speak !== 'none') {
      this.updateStatus({ isScreenReaderActive: true });
    }
  }

  private setupScreenReaderAnnouncements(): void {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    
    document.body.appendChild(liveRegion);
  }

  // Keyboard Navigation Handlers
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        this.updateStatus({ isKeyboardNavigation: true });
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivationKey(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowKeys(event);
        break;
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    const focusableElements = this.getFocusableElements();
    
    if (focusableElements.length === 0) return;
    
    const currentIndex = focusableElements.indexOf(activeElement);
    let nextIndex: number;
    
    if (event.shiftKey) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
    } else {
      nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
    }
    
    focusableElements[nextIndex]?.focus();
    event.preventDefault();
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    const openModals = Array.from(modals).filter(modal => 
      modal.getAttribute('aria-hidden') !== 'true'
    );
    
    if (openModals.length > 0) {
      const lastModal = openModals[openModals.length - 1];
      this.closeModal(lastModal as HTMLElement);
    }
  }

  private handleActivationKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      event.preventDefault();
      target.click();
    }
  }

  private handleArrowKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle radio groups, tabs, and other composite widgets
    if (target.getAttribute('role') === 'radio' || target.getAttribute('role') === 'tab') {
      this.handleCompositeWidgetNavigation(target, event.key);
    }
  }

  private handleCompositeWidgetNavigation(element: HTMLElement, key: string): void {
    const role = element.getAttribute('role');
    const container = element.closest(`[role="${role === 'radio' ? 'radiogroup' : 'tablist'}"`);
    
    if (!container) return;
    
    const items = Array.from(container.querySelectorAll(`[role="${role}"]`));
    const currentIndex = items.indexOf(element);
    let nextIndex: number;
    
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      default:
        return;
    }
    
    (items[nextIndex] as HTMLElement)?.focus();
  }

  // Focus Management
  private handleFocusChange(element: HTMLElement): void {
    this.updateStatus({ 
      currentFocusElement: element,
      isKeyboardNavigation: true
    });
    
    // Add focus indicator
    element.classList.add('focus-visible');
    
    // Update focus history
    this.focusHistory.push(element);
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift();
    }
    
    // Announce focus changes for screen readers
    this.announceFocusChange(element);
  }

  private handleFocusOut(element: HTMLElement): void {
    element.classList.remove('focus-visible');
  }

  private announceFocusChange(element: HTMLElement): void {
    const label = element.getAttribute('aria-label') || 
                 element.getAttribute('title') || 
                 element.textContent?.trim();
    
    if (label) {
      this.announceToScreenReader(`Focused on ${label}`);
    }
  }

  // Utility Methods
  private getFocusableElements(): HTMLElement[] {
    const elements = document.querySelectorAll(this.focusableSelectors.join(', '));
    return Array.from(elements) as HTMLElement[];
  }

  private closeModal(modal: HTMLElement): void {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    
    // Return focus to trigger element
    const trigger = modal.getAttribute('data-trigger');
    if (trigger) {
      const triggerElement = document.getElementById(trigger);
      triggerElement?.focus();
    }
  }

  private announceToScreenReader(message: string): void {
    const liveRegion = document.querySelector('[aria-live="polite"]');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  // Detection Methods
  private detectHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  private detectReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private detectLargeText(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private detectScreenReader(): boolean {
    // Basic detection - can be enhanced with more sophisticated methods
    return 'speechSynthesis' in window || 'webkitSpeechSynthesis' in window;
  }

  // Public Methods
  public updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    const currentConfig = this.configSubject.value;
    const updatedConfig = { ...currentConfig, ...newConfig };
    this.configSubject.next(updatedConfig);
    
    // Apply new configuration
    this.applyConfiguration(updatedConfig);
  }

  public getConfig(): AccessibilityConfig {
    return this.configSubject.value;
  }

  public getStatus(): AccessibilityStatus {
    return this.statusSubject.value;
  }

  public announceMessage(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.querySelector(`[aria-live="${priority}"]`);
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 3000);
    }
  }

  public setFocus(element: HTMLElement): void {
    element.focus();
    this.handleFocusChange(element);
  }

  public getFocusHistory(): HTMLElement[] {
    return [...this.focusHistory];
  }

  public performAccessibilityAudit(): void {
    // Check for common accessibility issues
    this.checkMissingAltText();
    this.checkFormLabels();
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkARIALabels();
  }

  // Accessibility Audit Methods
  private checkMissingAltText(): void {
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      console.warn(`Found ${images.length} images without alt text`);
    }
  }

  private checkFormLabels(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        console.warn(`Form control without label:`, input);
      }
    });
  }

  private checkColorContrast(): void {
    // Basic color contrast check
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Calculate contrast ratio (simplified)
      const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
      if (contrastRatio < 4.5) {
        console.warn(`Low contrast ratio: ${contrastRatio.toFixed(2)}`, element);
      }
    });
  }

  private checkKeyboardNavigation(): void {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found');
    }
  }

  private checkARIALabels(): void {
    const interactiveElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby]');
    interactiveElements.forEach(element => {
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      
      if (role && !ariaLabel && !ariaLabelledBy) {
        console.warn(`Interactive element with role "${role}" missing accessible name:`, element);
      }
    });
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder
  }

  // Configuration Application
  private applyConfiguration(config: AccessibilityConfig): void {
    if (config.enableHighContrast) {
      this.applyHighContrastMode(true);
    }
    
    if (config.enableReducedMotion) {
      this.applyReducedMotionMode(true);
    }
    
    if (config.enableLargeText) {
      this.applyLargeTextMode(true);
    }
    
    this.applyFocusIndicatorStyle(config.focusIndicatorStyle);
    this.applyColorScheme(config.colorScheme);
  }

  private applyHighContrastMode(enabled: boolean): void {
    document.body.classList.toggle('high-contrast', enabled);
  }

  private applyReducedMotionMode(enabled: boolean): void {
    document.body.classList.toggle('reduced-motion', enabled);
  }

  private applyLargeTextMode(enabled: boolean): void {
    document.body.classList.toggle('large-text', enabled);
  }

  private applyFocusIndicatorStyle(style: string): void {
    document.body.className = document.body.className.replace(/focus-style-\w+/g, '');
    document.body.classList.add(`focus-style-${style}`);
  }

  private applyColorScheme(scheme: string): void {
    document.body.className = document.body.className.replace(/color-scheme-\w+/g, '');
    document.body.classList.add(`color-scheme-${scheme}`);
  }

  // Status Updates
  private updateStatus(updates: Partial<AccessibilityStatus>): void {
    const currentStatus = this.statusSubject.value;
    const newStatus = { ...currentStatus, ...updates };
    this.statusSubject.next(newStatus);
  }

  // Cleanup
  public destroy(): void {
    // Remove event listeners and clean up
    document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    document.removeEventListener('focusin', this.handleFocusChange.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
  }
}

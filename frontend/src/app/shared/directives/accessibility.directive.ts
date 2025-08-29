import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { AccessibilityService } from '../components/accessibility/accessibility.service';

export interface AccessibilityConfig {
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaHidden?: boolean;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaChecked?: boolean;
  ariaSelected?: boolean;
  ariaRequired?: boolean;
  ariaInvalid?: boolean;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: boolean;
  ariaRelevant?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals';
  tabIndex?: number;
  autoFocus?: boolean;
  skipToContent?: boolean;
  announceChanges?: boolean;
}

@Directive({
  selector: '[appAccessibility]',
  standalone: true
})
export class AccessibilityDirective implements OnInit, OnDestroy {
  @Input() accessibilityConfig: AccessibilityConfig = {};
  @Input() autoLabel = true;
  @Input() autoRole = true;
  @Input() screenReaderText?: string;

  private element: HTMLElement;
  private originalAttributes: Map<string, string> = new Map();
  private observer: MutationObserver | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private accessibilityService: AccessibilityService
  ) {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.setupAccessibility();
    this.setupMutationObserver();
    this.setupKeyboardSupport();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupAccessibility(): void {
    // Store original attributes
    this.storeOriginalAttributes();
    
    // Apply accessibility configuration
    this.applyAccessibilityConfig();
    
    // Auto-generate missing accessibility features
    if (this.autoLabel) {
      this.generateAutoLabel();
    }
    
    if (this.autoRole) {
      this.generateAutoRole();
    }
    
    // Add screen reader support
    this.setupScreenReaderSupport();
    
    // Ensure proper focus management
    this.setupFocusManagement();
  }

  private storeOriginalAttributes(): void {
    const attributes = ['role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'tabindex'];
    attributes.forEach(attr => {
      const value = this.element.getAttribute(attr);
      if (value) {
        this.originalAttributes.set(attr, value);
      }
    });
  }

  private applyAccessibilityConfig(): void {
    const config = this.accessibilityConfig;
    
    // Apply role
    if (config.role) {
      this.renderer.setAttribute(this.element, 'role', config.role);
    }
    
    // Apply ARIA attributes
    if (config.ariaLabel) {
      this.renderer.setAttribute(this.element, 'aria-label', config.ariaLabel);
    }
    
    if (config.ariaLabelledBy) {
      this.renderer.setAttribute(this.element, 'aria-labelledby', config.ariaLabelledBy);
    }
    
    if (config.ariaDescribedBy) {
      this.renderer.setAttribute(this.element, 'aria-describedby', config.ariaDescribedBy);
    }
    
    if (config.ariaHidden !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-hidden', config.ariaHidden.toString());
    }
    
    if (config.ariaExpanded !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-expanded', config.ariaExpanded.toString());
    }
    
    if (config.ariaPressed !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-pressed', config.ariaPressed.toString());
    }
    
    if (config.ariaChecked !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-checked', config.ariaChecked.toString());
    }
    
    if (config.ariaSelected !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-selected', config.ariaSelected.toString());
    }
    
    if (config.ariaRequired !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-required', config.ariaRequired.toString());
    }
    
    if (config.ariaInvalid !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-invalid', config.ariaInvalid.toString());
    }
    
    if (config.ariaLive) {
      this.renderer.setAttribute(this.element, 'aria-live', config.ariaLive);
    }
    
    if (config.ariaAtomic !== undefined) {
      this.renderer.setAttribute(this.element, 'aria-atomic', config.ariaAtomic.toString());
    }
    
    if (config.ariaRelevant) {
      this.renderer.setAttribute(this.element, 'aria-relevant', config.ariaRelevant);
    }
    
    // Apply tab index
    if (config.tabIndex !== undefined) {
      this.renderer.setAttribute(this.element, 'tabindex', config.tabIndex.toString());
    }
    
    // Auto focus if requested
    if (config.autoFocus) {
      setTimeout(() => this.element.focus(), 0);
    }
  }

  private generateAutoLabel(): void {
    // Skip if already has label
    if (this.element.getAttribute('aria-label') || this.element.getAttribute('aria-labelledby')) {
      return;
    }
    
    let label = '';
    
    // Try to get label from various sources
    if (this.element.tagName === 'BUTTON') {
      label = this.element.textContent?.trim() || 'Button';
    } else if (this.element.tagName === 'INPUT') {
      const type = this.element.getAttribute('type');
      const placeholder = this.element.getAttribute('placeholder');
      const name = this.element.getAttribute('name');
      
      if (placeholder) {
        label = placeholder;
      } else if (name) {
        label = this.formatFieldName(name);
      } else if (type) {
        label = this.formatInputType(type);
      }
    } else if (this.element.tagName === 'A') {
      label = this.element.textContent?.trim() || 'Link';
    } else if (this.element.tagName === 'IMG') {
      const alt = this.element.getAttribute('alt');
      if (alt) {
        label = alt;
      } else {
        // Generate descriptive label for decorative images
        const src = this.element.getAttribute('src') || '';
        const filename = src.split('/').pop()?.split('.')[0] || 'Image';
        label = `Image: ${filename}`;
      }
    }
    
    if (label) {
      this.renderer.setAttribute(this.element, 'aria-label', label);
    }
  }

  private generateAutoRole(): void {
    // Skip if already has role
    if (this.element.getAttribute('role')) {
      return;
    }
    
    let role = '';
    
    // Determine role based on element type and attributes
    if (this.element.tagName === 'BUTTON') {
      role = 'button';
    } else if (this.element.tagName === 'INPUT') {
      const type = this.element.getAttribute('type');
      if (type === 'checkbox') {
        role = 'checkbox';
      } else if (type === 'radio') {
        role = 'radio';
      } else if (type === 'search') {
        role = 'searchbox';
      } else if (type === 'text' || type === 'email' || type === 'password') {
        role = 'textbox';
      }
    } else if (this.element.tagName === 'A' && this.element.getAttribute('href')) {
      role = 'link';
    } else if (this.element.tagName === 'IMG') {
      const alt = this.element.getAttribute('alt');
      if (alt && alt.trim() !== '') {
        role = 'img';
      }
    } else if (this.element.tagName === 'NAV') {
      role = 'navigation';
    } else if (this.element.tagName === 'MAIN') {
      role = 'main';
    } else if (this.element.tagName === 'ASIDE') {
      role = 'complementary';
    } else if (this.element.tagName === 'FOOTER') {
      role = 'contentinfo';
    } else if (this.element.tagName === 'HEADER') {
      role = 'banner';
    }
    
    if (role) {
      this.renderer.setAttribute(this.element, 'role', role);
    }
  }

  private setupScreenReaderSupport(): void {
    // Add screen reader only text if provided
    if (this.screenReaderText) {
      this.addScreenReaderText();
    }
    
    // Setup live regions for dynamic content
    if (this.accessibilityConfig.announceChanges) {
      this.setupLiveRegion();
    }
    
    // Add descriptive text for complex elements
    this.addDescriptiveText();
  }

  private addScreenReaderText(): void {
    const srText = this.renderer.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = this.screenReaderText;
    srText.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    
    this.renderer.appendChild(this.element, srText);
  }

  private setupLiveRegion(): void {
    this.renderer.setAttribute(this.element, 'aria-live', 'polite');
    this.renderer.setAttribute(this.element, 'aria-atomic', 'true');
  }

  private addDescriptiveText(): void {
    const tagName = this.element.tagName.toLowerCase();
    
    // Add context for form elements
    if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
      this.addFormElementContext();
    }
    
    // Add context for interactive elements
    if (tagName === 'button' || tagName === 'a') {
      this.addInteractiveElementContext();
    }
  }

  private addFormElementContext(): void {
    const type = this.element.getAttribute('type');
    const required = this.element.hasAttribute('required');
    const invalid = this.element.hasAttribute('aria-invalid');
    
    let context = '';
    
    if (required) {
      context += 'Required field. ';
    }
    
    if (invalid) {
      context += 'Invalid input. ';
    }
    
    if (type === 'email') {
      context += 'Enter a valid email address.';
    } else if (type === 'password') {
      context += 'Enter your password.';
    } else if (type === 'number') {
      context += 'Enter a number.';
    }
    
    if (context) {
      const currentDescribedBy = this.element.getAttribute('aria-describedby');
      const contextId = `context-${Date.now()}`;
      
      const contextElement = this.renderer.createElement('span');
      contextElement.id = contextId;
      contextElement.className = 'sr-only';
      contextElement.textContent = context;
      contextElement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      
      this.renderer.appendChild(document.body, contextElement);
      
      if (currentDescribedBy) {
        this.renderer.setAttribute(this.element, 'aria-describedby', `${currentDescribedBy} ${contextId}`);
      } else {
        this.renderer.setAttribute(this.element, 'aria-describedby', contextId);
      }
    }
  }

  private addInteractiveElementContext(): void {
    const tagName = this.element.tagName.toLowerCase();
    let context = '';
    
    if (tagName === 'button') {
      const type = this.element.getAttribute('type');
      if (type === 'submit') {
        context = 'Submit form';
      } else if (type === 'reset') {
        context = 'Reset form';
      } else {
        context = 'Click to activate';
      }
    } else if (tagName === 'a') {
      const href = this.element.getAttribute('href');
      if (href && href.startsWith('http')) {
        context = 'External link';
      } else if (href && href.startsWith('#')) {
        context = 'Jump to section';
      } else {
        context = 'Navigate to page';
      }
    }
    
    if (context) {
      this.renderer.setAttribute(this.element, 'aria-label', 
        `${this.element.textContent?.trim() || ''} - ${context}`
      );
    }
  }

  private setupFocusManagement(): void {
    // Ensure element is focusable if it should be
    if (this.shouldBeFocusable()) {
      this.makeFocusable();
    }
    
    // Add focus indicator styles
    this.addFocusIndicator();
    
    // Handle focus events
    this.setupFocusEvents();
  }

  private shouldBeFocusable(): boolean {
    const tagName = this.element.tagName.toLowerCase();
    const role = this.element.getAttribute('role');
    
    return tagName === 'button' || 
           tagName === 'a' || 
           tagName === 'input' || 
           tagName === 'select' || 
           tagName === 'textarea' ||
           role === 'button' ||
           role === 'link' ||
           role === 'tab' ||
           role === 'menuitem';
  }

  private makeFocusable(): void {
    if (!this.element.hasAttribute('tabindex')) {
      this.renderer.setAttribute(this.element, 'tabindex', '0');
    }
  }

  private addFocusIndicator(): void {
    // Add focus indicator class
    this.renderer.addClass(this.element, 'accessibility-focusable');
    
    // Add focus styles if not already present
    if (!document.querySelector('#accessibility-focus-styles')) {
      const style = this.renderer.createElement('style');
      style.id = 'accessibility-focus-styles';
      style.textContent = `
        .accessibility-focusable:focus {
          outline: 2px solid #007bff !important;
          outline-offset: 2px !important;
        }
        
        .accessibility-focusable:focus:not(:focus-visible) {
          outline: none !important;
        }
        
        .high-contrast .accessibility-focusable:focus {
          outline: 3px solid #ffff00 !important;
          outline-offset: 3px !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private setupFocusEvents(): void {
    this.renderer.listen(this.element, 'focus', () => {
      this.onFocus();
    });
    
    this.renderer.listen(this.element, 'blur', () => {
      this.onBlur();
    });
  }

  private setupKeyboardSupport(): void {
    // Add keyboard event handlers
    this.renderer.listen(this.element, 'keydown', (event: KeyboardEvent) => {
      this.handleKeyboardEvent(event);
    });
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    const tagName = this.element.tagName.toLowerCase();
    const role = this.element.getAttribute('role');
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (tagName === 'button' || role === 'button') {
          event.preventDefault();
          this.element.click();
        }
        break;
      case 'Escape':
        // Close dropdowns, modals, etc.
        this.handleEscapeKey();
        break;
    }
  }

  private handleEscapeKey(): void {
    const role = this.element.getAttribute('role');
    
    if (role === 'combobox' || role === 'listbox') {
      // Close dropdown
      this.renderer.setAttribute(this.element, 'aria-expanded', 'false');
    }
  }

  private setupMutationObserver(): void {
    // Watch for changes to the element and its children
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.handleContentChanges();
        } else if (mutation.type === 'attributes') {
          this.handleAttributeChanges(mutation);
        }
      });
    });
    
    this.observer.observe(this.element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'aria-describedby', 'role']
    });
  }

  private handleContentChanges(): void {
    // Regenerate labels if content changed
    if (this.autoLabel) {
      this.generateAutoLabel();
    }
  }

  private handleAttributeChanges(mutation: MutationRecord): void {
    // Handle accessibility attribute changes
    const attributeName = mutation.attributeName;
    if (attributeName === 'aria-expanded') {
      this.announceExpansionChange();
    } else if (attributeName === 'aria-checked') {
      this.announceCheckboxChange();
    } else if (attributeName === 'aria-selected') {
      this.announceSelectionChange();
    }
  }

  private announceExpansionChange(): void {
    const expanded = this.element.getAttribute('aria-expanded') === 'true';
    const message = expanded ? 'Expanded' : 'Collapsed';
    this.accessibilityService.announceMessage(message);
  }

  private announceCheckboxChange(): void {
    const checked = this.element.getAttribute('aria-checked') === 'true';
    const message = checked ? 'Checked' : 'Unchecked';
    this.accessibilityService.announceMessage(message);
  }

  private announceSelectionChange(): void {
    const selected = this.element.getAttribute('aria-selected') === 'true';
    const message = selected ? 'Selected' : 'Deselected';
    this.accessibilityService.announceMessage(message);
  }

  private onFocus(): void {
    // Announce element when focused
    const label = this.element.getAttribute('aria-label') || 
                 this.element.textContent?.trim() || 
                 this.element.tagName.toLowerCase();
    
    this.accessibilityService.announceMessage(`Focused on ${label}`);
  }

  private onBlur(): void {
    // Handle blur events if needed
  }

  // Utility methods
  private formatFieldName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private formatInputType(type: string): string {
    const typeMap: Record<string, string> = {
      'text': 'Text input',
      'email': 'Email input',
      'password': 'Password input',
      'number': 'Number input',
      'tel': 'Phone input',
      'url': 'URL input',
      'search': 'Search input',
      'date': 'Date input',
      'time': 'Time input',
      'datetime-local': 'Date and time input'
    };
    
    return typeMap[type] || `${type} input`;
  }

  private cleanup(): void {
    // Remove mutation observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Restore original attributes
    this.restoreOriginalAttributes();
    
    // Remove added elements
    this.removeAddedElements();
  }

  private restoreOriginalAttributes(): void {
    this.originalAttributes.forEach((value, attr) => {
      if (value) {
        this.renderer.setAttribute(this.element, attr, value);
      } else {
        this.renderer.removeAttribute(this.element, attr);
      }
    });
  }

  private removeAddedElements(): void {
    // Remove screen reader text elements
    const srElements = this.element.querySelectorAll('.sr-only');
    srElements.forEach(el => el.remove());
  }
}

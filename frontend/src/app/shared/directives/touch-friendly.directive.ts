import { Directive, ElementRef, Input, OnInit, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { TouchService, TouchGesture } from '../components/touch/touch.service';
import { Subscription } from 'rxjs';

export interface TouchFriendlyConfig {
  minTouchTarget: number;      // Minimum touch target size in pixels
  enableGestures: boolean;     // Enable touch gestures
  enableHover: boolean;        // Enable hover effects on touch devices
  rippleEffect: boolean;       // Enable material design ripple effect
  longPressDelay: number;      // Long press delay in milliseconds
  doubleTapDelay: number;      // Double tap delay in milliseconds
}

@Directive({
  selector: '[appTouchFriendly]',
  standalone: true
})
export class TouchFriendlyDirective implements OnInit, OnDestroy {
  @Input() touchConfig: Partial<TouchFriendlyConfig> = {};
  
  private defaultConfig: TouchFriendlyConfig = {
    minTouchTarget: 44,        // iOS Human Interface Guidelines minimum
    enableGestures: true,
    enableHover: false,
    rippleEffect: true,
    longPressDelay: 500,
    doubleTapDelay: 300
  };
  
  private config: TouchFriendlyConfig;
  private touchSubscription: Subscription | null = null;
  private rippleElement: HTMLElement | null = null;
  private isPressed = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private touchService: TouchService
  ) {
    this.config = { ...this.defaultConfig };
  }

  ngOnInit(): void {
    this.config = { ...this.defaultConfig, ...this.touchConfig };
    this.applyTouchFriendlyStyles();
    this.setupTouchGestures();
    this.setupHoverEffects();
  }

  ngOnDestroy(): void {
    if (this.touchSubscription) {
      this.touchSubscription.unsubscribe();
    }
    this.removeRippleEffect();
  }

  private applyTouchFriendlyStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Ensure minimum touch target size
    const currentWidth = element.offsetWidth;
    const currentHeight = element.offsetHeight;
    
    if (currentWidth < this.config.minTouchTarget) {
      this.renderer.setStyle(element, 'min-width', `${this.config.minTouchTarget}px`);
    }
    
    if (currentHeight < this.config.minTouchTarget) {
      this.renderer.setStyle(element, 'min-height', `${this.config.minTouchTarget}px`);
    }

    // Add touch-friendly cursor
    this.renderer.setStyle(element, 'cursor', 'pointer');
    
    // Add touch-friendly padding if element is small
    if (currentWidth < this.config.minTouchTarget || currentHeight < this.config.minTouchTarget) {
      const padding = Math.max(0, (this.config.minTouchTarget - Math.min(currentWidth, currentHeight)) / 2);
      this.renderer.setStyle(element, 'padding', `${padding}px`);
    }

    // Add touch-friendly styles
    this.renderer.addClass(element, 'touch-friendly');
    this.renderer.setStyle(element, 'user-select', 'none');
    this.renderer.setStyle(element, 'touch-action', 'manipulation');
    this.renderer.setStyle(element, 'webkit-tap-highlight-color', 'transparent');
  }

  private setupTouchGestures(): void {
    if (!this.config.enableGestures) return;

    this.touchSubscription = this.touchService.gesture$.subscribe(gesture => {
      if (gesture) {
        this.handleTouchGesture(gesture);
      }
    });
  }

  private setupHoverEffects(): void {
    if (!this.config.enableHover) return;

    const element = this.elementRef.nativeElement;
    
    // Add hover effects that work on touch devices
    this.renderer.listen(element, 'mouseenter', () => {
      if (!this.isPressed) {
        this.renderer.addClass(element, 'hover');
      }
    });

    this.renderer.listen(element, 'mouseleave', () => {
      this.renderer.removeClass(element, 'hover');
    });
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.isPressed = true;
    this.renderer.addClass(this.elementRef.nativeElement, 'pressed');
    
    if (this.config.rippleEffect) {
      this.createRippleEffect(event);
    }
    
    // Handle touch start with service
    this.touchService.handleTouchStart(event);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.isPressed = false;
    this.renderer.removeClass(this.elementRef.nativeElement, 'pressed');
    
    if (this.config.rippleEffect) {
      this.removeRippleEffect();
    }
    
    // Handle touch end with service
    this.touchService.handleTouchEnd(event);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    // Handle touch move with service
    this.touchService.handleTouchMove(event);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isPressed = true;
    this.renderer.addClass(this.elementRef.nativeElement, 'pressed');
    
    if (this.config.rippleEffect) {
      this.createRippleEffect(event);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isPressed = false;
    this.renderer.removeClass(this.elementRef.nativeElement, 'pressed');
    
    if (this.config.rippleEffect) {
      this.removeRippleEffect();
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    this.isPressed = false;
    this.renderer.removeClass(this.elementRef.nativeElement, 'pressed');
    
    if (this.config.rippleEffect) {
      this.removeRippleEffect();
    }
  }

  private handleTouchGesture(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    switch (gesture.type) {
      case 'tap':
        this.handleTap(gesture);
        break;
      case 'longPress':
        this.handleLongPress(gesture);
        break;
      case 'swipe':
        this.handleSwipe(gesture);
        break;
      case 'pinch':
        this.handlePinch(gesture);
        break;
      case 'rotate':
        this.handleRotate(gesture);
        break;
    }
  }

  private handleTap(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    // Add tap animation
    this.renderer.addClass(element, 'tap');
    setTimeout(() => {
      this.renderer.removeClass(element, 'tap');
    }, 150);

    // Emit custom event
    const tapEvent = new CustomEvent('touchfriendly-tap', {
      detail: { gesture, element },
      bubbles: true
    });
    element.dispatchEvent(tapEvent);
  }

  private handleLongPress(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    // Add long press visual feedback
    this.renderer.addClass(element, 'long-press');
    
    // Emit custom event
    const longPressEvent = new CustomEvent('touchfriendly-longpress', {
      detail: { gesture, element },
      bubbles: true
    });
    element.dispatchEvent(longPressEvent);
  }

  private handleSwipe(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    // Add swipe direction class
    this.renderer.addClass(element, `swipe-${gesture.direction}`);
    
    // Emit custom event
    const swipeEvent = new CustomEvent('touchfriendly-swipe', {
      detail: { gesture, element },
      bubbles: true
    });
    element.dispatchEvent(swipeEvent);
    
    // Remove swipe class after animation
    setTimeout(() => {
      this.renderer.removeClass(element, `swipe-${gesture.direction}`);
    }, 300);
  }

  private handlePinch(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    // Emit custom event
    const pinchEvent = new CustomEvent('touchfriendly-pinch', {
      detail: { gesture, element },
      bubbles: true
    });
    element.dispatchEvent(pinchEvent);
  }

  private handleRotate(gesture: TouchGesture): void {
    const element = this.elementRef.nativeElement;
    
    // Emit custom event
    const rotateEvent = new CustomEvent('touchfriendly-rotate', {
      detail: { gesture, element },
      bubbles: true
    });
    element.dispatchEvent(rotateEvent);
  }

  private createRippleEffect(event: TouchEvent | MouseEvent): void {
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const size = Math.max(rect.width, rect.height);
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;
    
    this.rippleElement = this.renderer.createElement('span');
    this.renderer.addClass(this.rippleElement, 'ripple');
    this.renderer.setStyle(this.rippleElement, 'position', 'absolute');
    this.renderer.setStyle(this.rippleElement, 'width', `${size}px`);
    this.renderer.setStyle(this.rippleElement, 'height', `${size}px`);
    this.renderer.setStyle(this.rippleElement, 'left', `${x}px`);
    this.renderer.setStyle(this.rippleElement, 'top', `${y}px`);
    this.renderer.setStyle(this.rippleElement, 'background', 'rgba(255, 255, 255, 0.3)');
    this.renderer.setStyle(this.rippleElement, 'border-radius', '50%');
    this.renderer.setStyle(this.rippleElement, 'transform', 'scale(0)');
    this.renderer.setStyle(this.rippleElement, 'animation', 'ripple 0.6s linear');
    this.renderer.setStyle(this.rippleElement, 'pointer-events', 'none');
    
    this.renderer.appendChild(element, this.rippleElement);
    
    // Trigger animation
    setTimeout(() => {
      if (this.rippleElement) {
        this.renderer.setStyle(this.rippleElement, 'transform', 'scale(4)');
        this.renderer.setStyle(this.rippleElement, 'opacity', '0');
      }
    }, 10);
  }

  private removeRippleEffect(): void {
    if (this.rippleElement) {
      setTimeout(() => {
        if (this.rippleElement && this.rippleElement.parentNode) {
          this.renderer.removeChild(this.rippleElement.parentNode, this.rippleElement);
        }
        this.rippleElement = null;
      }, 600);
    }
  }
}

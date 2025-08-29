import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface BreakpointConfig {
  xs: number;   // 0-575px
  sm: number;   // 576-767px
  md: number;   // 768-991px
  lg: number;   // 992-1199px
  xl: number;   // 1200px+
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private readonly breakpoints: BreakpointConfig = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  };

  private deviceInfoSubject = new BehaviorSubject<DeviceInfo>(this.getInitialDeviceInfo());
  public deviceInfo$: Observable<DeviceInfo> = this.deviceInfoSubject.asObservable();

  constructor() {
    this.initializeResponsiveService();
  }

  private getInitialDeviceInfo(): DeviceInfo {
    return {
      isMobile: this.isMobileDevice(),
      isTablet: this.isTabletDevice(),
      isDesktop: this.isDesktopDevice(),
      isTouch: this.isTouchDevice(),
      orientation: this.getOrientation(),
      screenSize: this.getScreenSize(),
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  private initializeResponsiveService(): void {
    // Listen for window resize events
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Listen for orientation change events
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Listen for touch events to detect touch capability
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { once: true });
    
    // Initial check
    this.updateDeviceInfo();
  }

  private handleResize(): void {
    this.updateDeviceInfo();
  }

  private handleOrientationChange(): void {
    // Delay to allow orientation change to complete
    setTimeout(() => {
      this.updateDeviceInfo();
    }, 100);
  }

  private handleTouchStart(): void {
    this.updateDeviceInfo();
  }

  private updateDeviceInfo(): void {
    const deviceInfo = this.getCurrentDeviceInfo();
    this.deviceInfoSubject.next(deviceInfo);
  }

  private getCurrentDeviceInfo(): DeviceInfo {
    return {
      isMobile: this.isMobileDevice(),
      isTablet: this.isTabletDevice(),
      isDesktop: this.isDesktopDevice(),
      isTouch: this.isTouchDevice(),
      orientation: this.getOrientation(),
      screenSize: this.getScreenSize(),
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  // Device detection methods
  private isMobileDevice(): boolean {
    const width = window.innerWidth;
    return width < this.breakpoints.md;
  }

  private isTabletDevice(): boolean {
    const width = window.innerWidth;
    return width >= this.breakpoints.md && width < this.breakpoints.lg;
  }

  private isDesktopDevice(): boolean {
    const width = window.innerWidth;
    return width >= this.breakpoints.lg;
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  private getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.sm) return 'xs';
    if (width < this.breakpoints.md) return 'sm';
    if (width < this.breakpoints.lg) return 'md';
    if (width < this.breakpoints.xl) return 'lg';
    return 'xl';
  }

  // Public methods
  public getDeviceInfo(): DeviceInfo {
    return this.deviceInfoSubject.value;
  }

  public isMobile(): boolean {
    return this.deviceInfoSubject.value.isMobile;
  }

  public isTablet(): boolean {
    return this.deviceInfoSubject.value.isTablet;
  }

  public isDesktop(): boolean {
    return this.deviceInfoSubject.value.isDesktop;
  }

  public isTouch(): boolean {
    return this.deviceInfoSubject.value.isTouch;
  }

  public getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    return this.deviceInfoSubject.value.screenSize;
  }

  public getOrientation(): 'portrait' | 'landscape' {
    return this.deviceInfoSubject.value.orientation;
  }

  public getBreakpoint(): number {
    const screenSize = this.getScreenSize();
    return this.breakpoints[screenSize];
  }

  public isAboveBreakpoint(breakpoint: keyof BreakpointConfig): boolean {
    const currentWidth = window.innerWidth;
    return currentWidth >= this.breakpoints[breakpoint];
  }

  public isBelowBreakpoint(breakpoint: keyof BreakpointConfig): boolean {
    const currentWidth = window.innerWidth;
    return currentWidth < this.breakpoints[breakpoint];
  }

  public getBreakpoints(): BreakpointConfig {
    return { ...this.breakpoints };
  }

  // Utility methods for responsive behavior
  public getResponsiveValue<T>(
    mobile: T,
    tablet: T,
    desktop: T
  ): T {
    if (this.isMobile()) return mobile;
    if (this.isTablet()) return tablet;
    return desktop;
  }

  public getResponsiveValueByBreakpoint<T>(
    values: Partial<Record<keyof BreakpointConfig, T>>,
    defaultValue: T
  ): T {
    const screenSize = this.getScreenSize();
    return values[screenSize] || defaultValue;
  }

  // Cleanup method
  public destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
  }
}

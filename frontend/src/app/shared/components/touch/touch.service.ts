import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'rotate' | 'tap' | 'longPress';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  scale?: number;
  rotation?: number;
}

export interface TouchConfig {
  minSwipeDistance: number;
  maxSwipeTime: number;
  longPressDelay: number;
  doubleTapDelay: number;
  enablePinch: boolean;
  enableRotation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TouchService {
  private readonly defaultConfig: TouchConfig = {
    minSwipeDistance: 50,
    maxSwipeTime: 300,
    longPressDelay: 500,
    doubleTapDelay: 300,
    enablePinch: true,
    enableRotation: true
  };

  private config: TouchConfig = { ...this.defaultConfig };
  private gestureSubject = new BehaviorSubject<TouchGesture | null>(null);
  public gesture$: Observable<TouchGesture | null> = this.gestureSubject.asObservable();

  // Touch state tracking
  private touchStartTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private isLongPress: boolean = false;
  private longPressTimer: any = null;
  private lastTapTime: number = 0;
  private touchCount: number = 0;

  // Multi-touch tracking
  private initialDistance: number = 0;
  private initialAngle: number = 0;

  constructor() {}

  // Configuration methods
  public setConfig(newConfig: Partial<TouchConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): TouchConfig {
    return { ...this.config };
  }

  public resetConfig(): void {
    this.config = { ...this.defaultConfig };
  }

  // Touch event handlers
  public handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchCount = event.touches.length;

    // Start long press timer
    this.startLongPressTimer();

    // Handle multi-touch gestures
    if (event.touches.length === 2 && this.config.enablePinch) {
      this.handlePinchStart(event);
    }
  }

  public handleTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;

    // Cancel long press if moved
    if (this.isLongPress) {
      this.cancelLongPress();
    }

    // Handle multi-touch gestures
    if (event.touches.length === 2) {
      if (this.config.enablePinch) {
        this.handlePinchMove(event);
      }
      if (this.config.enableRotation) {
        this.handleRotationMove(event);
      }
    }
  }

  public handleTouchEnd(event: TouchEvent): void {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStartTime;

    // Cancel long press timer
    this.cancelLongPress();

    // Handle single touch gestures
    if (event.touches.length === 0) {
      this.handleSingleTouchEnd(touchDuration);
    }

    // Reset touch state
    this.resetTouchState();
  }

  // Single touch gesture handling
  private handleSingleTouchEnd(duration: number): void {
    const distance = this.calculateDistance();
    const direction = this.calculateDirection();

    // Detect swipe
    if (distance >= this.config.minSwipeDistance && duration <= this.config.maxSwipeTime) {
      this.emitGesture({
        type: 'swipe',
        direction,
        distance,
        duration,
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX: this.touchEndX,
        endY: this.touchEndY
      });
    }

    // Detect tap
    if (distance < this.config.minSwipeDistance && duration < this.config.maxSwipeTime) {
      this.handleTap();
    }
  }

  private handleTap(): void {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < this.config.doubleTapDelay) {
      // Double tap detected
      this.emitGesture({
        type: 'tap',
        duration: timeSinceLastTap
      });
      this.lastTapTime = 0; // Reset to prevent triple tap
    } else {
      // Single tap
      this.lastTapTime = now;
      this.emitGesture({
        type: 'tap',
        duration: 0
      });
    }
  }

  // Multi-touch gesture handling
  private handlePinchStart(event: TouchEvent): void {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    this.initialDistance = this.calculateDistanceBetweenTouches(touch1, touch2);
  }

  private handlePinchMove(event: TouchEvent): void {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = this.calculateDistanceBetweenTouches(touch1, touch2);
    const scale = currentDistance / this.initialDistance;

    this.emitGesture({
      type: 'pinch',
      scale,
      startX: this.touchStartX,
      startY: this.touchStartY
    });
  }

  private handleRotationMove(event: TouchEvent): void {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentAngle = this.calculateAngleBetweenTouches(touch1, touch2);
    const rotation = currentAngle - this.initialAngle;

    this.emitGesture({
      type: 'rotate',
      rotation,
      startX: this.touchStartX,
      startY: this.touchStartY
    });
  }

  // Long press handling
  private startLongPressTimer(): void {
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.emitGesture({
        type: 'longPress',
        startX: this.touchStartX,
        startY: this.touchStartY
      });
    }, this.config.longPressDelay);
  }

  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isLongPress = false;
  }

  // Utility methods
  private calculateDistance(): number {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  private calculateDirection(): 'up' | 'down' | 'left' | 'right' {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private calculateDistanceBetweenTouches(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  private calculateAngleBetweenTouches(touch1: Touch, touch2: Touch): number {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  }

  private resetTouchState(): void {
    this.touchStartTime = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.isLongPress = false;
    this.touchCount = 0;
    this.initialDistance = 0;
    this.initialAngle = 0;
  }

  private emitGesture(gesture: TouchGesture): void {
    this.gestureSubject.next(gesture);
  }

  // Public utility methods
  public isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  public getTouchCount(): number {
    return this.touchCount;
  }

  public isMultiTouch(): boolean {
    return this.touchCount > 1;
  }

  // Cleanup method
  public destroy(): void {
    this.cancelLongPress();
    this.resetTouchState();
  }
}

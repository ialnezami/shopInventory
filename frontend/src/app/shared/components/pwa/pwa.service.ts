import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PWAInstallPrompt {
  prompt: any;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private statusSubject = new BehaviorSubject<PWAStatus>(this.getInitialStatus());
  public status$: Observable<PWAStatus> = this.statusSubject.asObservable();

  private deferredPrompt: PWAInstallPrompt | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializePWA();
  }

  private getInitialStatus(): PWAStatus {
    return {
      isInstalled: this.isAppInstalled(),
      isOnline: navigator.onLine,
      hasUpdate: false,
      canInstall: false,
      isStandalone: this.isStandaloneMode(),
      networkType: this.getNetworkType()
    };
  }

  private async initializePWA(): Promise<void> {
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = {
        prompt: e,
        userChoice: e.userChoice
      };
      this.updateInstallStatus(true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.updateInstallStatus(false);
      this.deferredPrompt = null;
    });

    // Register service worker
    await this.registerServiceWorker();

    // Check for updates
    this.checkForUpdates();

    // Monitor network changes
    this.monitorNetworkChanges();
  }

  // Service Worker Registration
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', this.serviceWorkerRegistration);

        // Listen for service worker updates
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorkerRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateStatus({ hasUpdate: true });
              }
            });
          }
        });

        // Listen for controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.updateStatus({ hasUpdate: false });
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // App Installation
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during install prompt:', error);
      return false;
    }
  }

  // Service Worker Updates
  public async updateServiceWorker(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.update();
        console.log('Service Worker update check completed');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  }

  public async skipWaiting(): Promise<void> {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
      this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Offline Functionality
  public async cacheData(key: string, data: any): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('app-data');
        await cache.put(key, new Response(JSON.stringify(data)));
      } catch (error) {
        console.error('Failed to cache data:', error);
      }
    }
  }

  public async getCachedData(key: string): Promise<any | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('app-data');
        const response = await cache.match(key);
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to get cached data:', error);
      }
    }
    return null;
  }

  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  // Network Monitoring
  private monitorNetworkChanges(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      connection.addEventListener('change', () => {
        this.updateStatus({
          networkType: this.getNetworkType()
        });
      });
    }
  }

  private getNetworkType(): 'wifi' | 'cellular' | 'none' {
    if (!navigator.onLine) return 'none';
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'wifi') return 'wifi';
      if (connection.effectiveType === '4g' || connection.effectiveType === '3g' || connection.effectiveType === '2g') {
        return 'cellular';
      }
    }
    
    return 'wifi'; // Default assumption
  }

  // Status Updates
  private updateOnlineStatus(isOnline: boolean): void {
    this.updateStatus({ isOnline });
  }

  private updateInstallStatus(canInstall: boolean): void {
    this.updateStatus({ canInstall });
  }

  private updateStatus(updates: Partial<PWAStatus>): void {
    const currentStatus = this.statusSubject.value;
    const newStatus = { ...currentStatus, ...updates };
    this.statusSubject.next(newStatus);
  }

  // Utility Methods
  private isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  private isStandaloneMode(): boolean {
    return this.isAppInstalled() || window.location.search.includes('standalone=true');
  }

  private checkForUpdates(): void {
    if (this.serviceWorkerRegistration) {
      setInterval(() => {
        this.serviceWorkerRegistration!.update();
      }, 1000 * 60 * 60); // Check every hour
    }
  }

  // Public Methods
  public getStatus(): PWAStatus {
    return this.statusSubject.value;
  }

  public canInstall(): boolean {
    return this.statusSubject.value.canInstall;
  }

  public isOnline(): boolean {
    return this.statusSubject.value.isOnline;
  }

  public hasUpdate(): boolean {
    return this.statusSubject.value.hasUpdate;
  }

  public isStandalone(): boolean {
    return this.statusSubject.value.isStandalone;
  }

  public getNetworkType(): 'wifi' | 'cellular' | 'none' {
    return this.statusSubject.value.networkType;
  }

  // PWA Features
  public async addToHomeScreen(): Promise<void> {
    if (this.canInstall()) {
      await this.promptInstall();
    }
  }

  public async refreshApp(): Promise<void> {
    if (this.hasUpdate()) {
      await this.skipWaiting();
    }
  }

  public async enableOfflineMode(): Promise<void> {
    // Implement offline mode logic
    console.log('Offline mode enabled');
  }

  // Cleanup
  public destroy(): void {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.unregister();
    }
  }
}

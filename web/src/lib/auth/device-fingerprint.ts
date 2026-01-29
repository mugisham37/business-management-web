/**
 * Device Fingerprinting Utility
 * Cross-platform device tracking and fingerprinting for security
 * Requirements: 6.1, 6.2, 9.1, 9.2
 */

/**
 * Device fingerprint components
 */
interface FingerprintComponents {
  userAgent: string;
  language: string;
  screen: string;
  colorDepth: number;
  timezone: number;
  platform: string;
  cookieEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  canvas?: string;
  webgl?: string;
  fonts?: string[];
  plugins?: string[];
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: string;
}

/**
 * Device information structure
 */
export interface DeviceFingerprint {
  fingerprint: string;
  components: FingerprintComponents;
  confidence: number;
  timestamp: Date;
}

/**
 * Device Fingerprinting Service
 */
export class DeviceFingerprintService {
  private static instance: DeviceFingerprintService;
  private cachedFingerprint: DeviceFingerprint | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DeviceFingerprintService {
    if (!DeviceFingerprintService.instance) {
      DeviceFingerprintService.instance = new DeviceFingerprintService();
    }
    return DeviceFingerprintService.instance;
  }

  /**
   * Generate device fingerprint
   */
  async generateFingerprint(): Promise<DeviceFingerprint> {
    // Check cache first
    if (this.cachedFingerprint && this.isCacheValid()) {
      return this.cachedFingerprint;
    }

    const components = await this.collectFingerprintComponents();
    const fingerprint = this.hashComponents(components);
    const confidence = this.calculateConfidence(components);

    const result: DeviceFingerprint = {
      fingerprint,
      components,
      confidence,
      timestamp: new Date(),
    };

    // Cache the result
    this.cachedFingerprint = result;
    this.storeFingerprintCache(result);

    return result;
  }

  /**
   * Get cached fingerprint if available
   */
  getCachedFingerprint(): DeviceFingerprint | null {
    if (this.cachedFingerprint && this.isCacheValid()) {
      return this.cachedFingerprint;
    }

    // Try to load from storage
    const cached = this.loadFingerprintCache();
    if (cached && this.isCacheValid(cached)) {
      this.cachedFingerprint = cached;
      return cached;
    }

    return null;
  }

  /**
   * Clear cached fingerprint
   */
  clearCache(): void {
    this.cachedFingerprint = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('device_fingerprint_cache');
    }
  }

  /**
   * Collect all fingerprint components
   */
  private async collectFingerprintComponents(): Promise<FingerprintComponents> {
    if (typeof window === 'undefined') {
      return this.getServerSideComponents();
    }

    const components: FingerprintComponents = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      colorDepth: screen.colorDepth,
      timezone: new Date().getTimezoneOffset(),
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
    };

    // Add hardware information if available
    if ('hardwareConcurrency' in navigator) {
      components.hardwareConcurrency = navigator.hardwareConcurrency;
    }

    if ('deviceMemory' in navigator) {
      components.deviceMemory = (navigator as any).deviceMemory;
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      components.connection = `${connection.effectiveType}-${connection.downlink}`;
    }

    // Add canvas fingerprint
    try {
      components.canvas = await this.getCanvasFingerprint();
    } catch (error) {
      components.canvas = 'blocked';
    }

    // Add WebGL fingerprint
    try {
      components.webgl = this.getWebGLFingerprint();
    } catch (error) {
      components.webgl = 'blocked';
    }

    // Add font detection
    try {
      components.fonts = await this.detectFonts();
    } catch (error) {
      components.fonts = [];
    }

    // Add plugin information
    try {
      components.plugins = this.getPluginInfo();
    } catch (error) {
      components.plugins = [];
    }

    return components;
  }

  /**
   * Get server-side components (limited)
   */
  private getServerSideComponents(): FingerprintComponents {
    return {
      userAgent: 'server',
      language: 'en',
      screen: '0x0x0',
      colorDepth: 0,
      timezone: 0,
      platform: 'server',
      cookieEnabled: false,
      localStorage: false,
      sessionStorage: false,
    };
  }

  /**
   * Generate canvas fingerprint
   */
  private async getCanvasFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with different fonts and styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    
    ctx.fillStyle = '#069';
    ctx.fillText('Device fingerprint 🔒', 2, 15);
    
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18px Georgia';
    ctx.fillText('Security check', 4, 25);

    // Add some geometric shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  }

  /**
   * Generate WebGL fingerprint
   */
  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      throw new Error('WebGL not available');
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    return `${vendor}|${renderer}|${maxTextureSize}|${maxViewportDims}|${maxVertexAttribs}`;
  }

  /**
   * Detect available fonts
   */
  private async detectFonts(): Promise<string[]> {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode',
      'Tahoma', 'Lucida Console', 'Monaco', 'Bradley Hand ITC',
      'Brush Script MT', 'Luminari', 'Chalkduster'
    ];

    const availableFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    // Create test element
    const testElement = document.createElement('span');
    testElement.style.fontSize = testSize;
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.innerHTML = testString;
    document.body.appendChild(testElement);

    // Get baseline measurements
    const baselineWidths: { [key: string]: number } = {};
    for (const baseFont of baseFonts) {
      testElement.style.fontFamily = baseFont;
      baselineWidths[baseFont] = testElement.offsetWidth;
    }

    // Test each font
    for (const font of testFonts) {
      let detected = false;
      for (const baseFont of baseFonts) {
        testElement.style.fontFamily = `${font}, ${baseFont}`;
        if (testElement.offsetWidth !== baselineWidths[baseFont]) {
          detected = true;
          break;
        }
      }
      if (detected) {
        availableFonts.push(font);
      }
    }

    document.body.removeChild(testElement);
    return availableFonts;
  }

  /**
   * Get plugin information
   */
  private getPluginInfo(): string[] {
    const plugins: string[] = [];
    
    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        plugins.push(`${plugin.name}|${plugin.version || 'unknown'}`);
      }
    }

    return plugins;
  }

  /**
   * Hash fingerprint components into a unique string
   */
  private hashComponents(components: FingerprintComponents): string {
    const componentString = JSON.stringify(components, Object.keys(components).sort());
    return this.simpleHash(componentString);
  }

  /**
   * Simple hash function (for demo - use crypto.subtle in production)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate confidence score based on available components
   */
  private calculateConfidence(components: FingerprintComponents): number {
    let score = 0;
    const maxScore = 100;

    // Basic components (40 points)
    if (components.userAgent) score += 10;
    if (components.screen) score += 10;
    if (components.timezone !== 0) score += 10;
    if (components.language) score += 10;

    // Advanced components (60 points)
    if (components.canvas && components.canvas !== 'blocked') score += 20;
    if (components.webgl && components.webgl !== 'blocked') score += 15;
    if (components.fonts && components.fonts.length > 0) score += 15;
    if (components.hardwareConcurrency) score += 5;
    if (components.deviceMemory) score += 5;

    return Math.min(score, maxScore);
  }

  /**
   * Check if cached fingerprint is still valid
   */
  private isCacheValid(fingerprint?: DeviceFingerprint): boolean {
    const fp = fingerprint || this.cachedFingerprint;
    if (!fp) return false;

    const age = Date.now() - fp.timestamp.getTime();
    return age < this.CACHE_DURATION;
  }

  /**
   * Store fingerprint in cache
   */
  private storeFingerprintCache(fingerprint: DeviceFingerprint): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = {
        fingerprint: fingerprint.fingerprint,
        confidence: fingerprint.confidence,
        timestamp: fingerprint.timestamp.toISOString(),
      };
      localStorage.setItem('device_fingerprint_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache device fingerprint:', error);
    }
  }

  /**
   * Load fingerprint from cache
   */
  private loadFingerprintCache(): DeviceFingerprint | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem('device_fingerprint_cache');
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return {
        fingerprint: cacheData.fingerprint,
        components: {} as FingerprintComponents, // Components not cached
        confidence: cacheData.confidence,
        timestamp: new Date(cacheData.timestamp),
      };
    } catch (error) {
      console.warn('Failed to load cached device fingerprint:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deviceFingerprintService = DeviceFingerprintService.getInstance();

/**
 * Utility functions for device fingerprinting
 */
export const DeviceFingerprintUtils = {
  /**
   * Generate a quick fingerprint for immediate use
   */
  async quickFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'server';

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
    ];

    const fingerprint = components.join('|');
    return btoa(fingerprint).slice(0, 16);
  },

  /**
   * Check if two fingerprints are similar (for device recognition)
   */
  areSimilar(fp1: string, fp2: string, threshold: number = 0.8): boolean {
    if (fp1 === fp2) return true;
    
    // Simple similarity check based on common characters
    const common = fp1.split('').filter(char => fp2.includes(char)).length;
    const similarity = common / Math.max(fp1.length, fp2.length);
    
    return similarity >= threshold;
  },

  /**
   * Validate fingerprint format
   */
  isValidFingerprint(fingerprint: string): boolean {
    return typeof fingerprint === 'string' && 
           fingerprint.length >= 8 && 
           fingerprint.length <= 64 &&
           /^[a-zA-Z0-9]+$/.test(fingerprint);
  },

  /**
   * Generate device ID from fingerprint
   */
  generateDeviceId(fingerprint: string): string {
    return `device_${fingerprint.slice(0, 12)}`;
  },
};
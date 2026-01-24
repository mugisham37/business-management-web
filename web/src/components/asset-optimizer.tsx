/**
 * Asset Optimizer Component
 * Provides utilities for optimizing and preloading assets
 */

import React from 'react';

export interface ImageOptimizationConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export interface AssetMetrics {
  bytesOptimized: number;
  loadTime: number;
  compressionRatio: number;
  format: string;
}

/**
 * OptimizedImage Component
 * Renders images with optimization
 */
export const OptimizedImage: React.FC<
  {
    src: string;
    alt: string;
    config?: ImageOptimizationConfig;
  } & React.ImgHTMLAttributes<HTMLImageElement>
> = ({ src, alt, config, ...props }) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      {...props}
      style={{
        width: config?.width || props.width,
        height: config?.height || props.height,
        ...props.style,
      }}
    />
  );
};

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Asset Preloader
 * Preloads assets for better performance
 */
export class AssetPreloader {
  private preloadedAssets = new Set<string>();

  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedAssets.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.preloadedAssets.add(src);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };
      img.src = src;
    });
  }

  preloadMultiple(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map((src) => this.preloadImage(src)));
  }

  isPreloaded(src: string): boolean {
    return this.preloadedAssets.has(src);
  }

  clear(): void {
    this.preloadedAssets.clear();
  }
}

/**
 * Asset Metrics Collector
 * Collects metrics for asset optimization
 */
export class AssetMetricsCollector {
  private metrics = new Map<string, AssetMetrics>();

  recordAsset(
    assetPath: string,
    metrics: AssetMetrics
  ): void {
    this.metrics.set(assetPath, metrics);
  }

  getMetrics(assetPath: string): AssetMetrics | undefined {
    return this.metrics.get(assetPath);
  }

  getAllMetrics(): Record<string, AssetMetrics> {
    const result: Record<string, AssetMetrics> = {};
    this.metrics.forEach((metrics, key) => {
      result[key] = metrics;
    });
    return result;
  }

  getSummary() {
    const allMetrics = this.getAllMetrics();
    const metricsValues = Object.values(allMetrics);

    if (metricsValues.length === 0) {
      return {
        totalAssets: 0,
        totalBytesOptimized: 0,
        averageCompressionRatio: 0,
        averageLoadTime: 0,
      };
    }

    return {
      totalAssets: metricsValues.length,
      totalBytesOptimized: metricsValues.reduce(
        (sum, m) => sum + m.bytesOptimized,
        0
      ),
      averageCompressionRatio:
        metricsValues.reduce((sum, m) => sum + m.compressionRatio, 0) /
        metricsValues.length,
      averageLoadTime:
        metricsValues.reduce((sum, m) => sum + m.loadTime, 0) /
        metricsValues.length,
    };
  }

  clear(): void {
    this.metrics.clear();
  }
}

/**
 * Hook for asset optimization
 */
export function useAssetOptimization() {
  const [metrics, setMetrics] = React.useState<AssetMetrics[]>([]);

  const recordAsset = React.useCallback((assetMetrics: AssetMetrics) => {
    setMetrics((prev) => [...prev, assetMetrics]);
  }, []);

  return {
    metrics,
    recordAsset,
  };
}

// Global instances
export const assetPreloader = new AssetPreloader();
export const assetMetricsCollector = new AssetMetricsCollector();

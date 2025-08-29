import { Injectable } from '@angular/core';

export interface ColorContrastResult {
  ratio: number;
  passes: {
    AA: boolean;
    AAA: boolean;
  };
  recommendation: string;
  colors: {
    foreground: string;
    background: string;
  };
}

export interface WCAGLevels {
  AA: {
    normal: number;
    large: number;
  };
  AAA: {
    normal: number;
    large: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ColorContrastService {
  private readonly WCAG_LEVELS: WCAGLevels = {
    AA: {
      normal: 4.5,
      large: 3.0
    },
    AAA: {
      normal: 7.0,
      large: 4.5
    }
  };

  constructor() {}

  /**
   * Calculate color contrast ratio between two colors
   * @param color1 First color (hex, rgb, or named color)
   * @param color2 Second color (hex, rgb, or named color)
   * @returns ColorContrastResult with ratio and compliance info
   */
  public calculateContrastRatio(color1: string, color2: string): ColorContrastResult {
    const luminance1 = this.calculateLuminance(this.parseColor(color1));
    const luminance2 = this.calculateLuminance(this.parseColor(color2));
    
    // Ensure lighter color is first for ratio calculation
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: {
        AA: this.checkWCAGCompliance(ratio, 'AA'),
        AAA: this.checkWCAGCompliance(ratio, 'AAA')
      },
      recommendation: this.generateRecommendation(ratio),
      colors: {
        foreground: luminance1 < luminance2 ? color1 : color2,
        background: luminance1 < luminance2 ? color2 : color1
      }
    };
  }

  /**
   * Check if a color combination meets WCAG requirements
   * @param ratio Contrast ratio
   * @param level WCAG level (AA or AAA)
   * @param size Text size (normal or large)
   * @returns boolean indicating compliance
   */
  public checkWCAGCompliance(ratio: number, level: 'AA' | 'AAA', size: 'normal' | 'large' = 'normal'): boolean {
    const requiredRatio = this.WCAG_LEVELS[level][size];
    return ratio >= requiredRatio;
  }

  /**
   * Generate accessibility recommendation based on contrast ratio
   * @param ratio Contrast ratio
   * @returns Recommendation string
   */
  public generateRecommendation(ratio: number): string {
    if (ratio >= 7.0) {
      return 'Excellent contrast - meets AAA standards for all text sizes';
    } else if (ratio >= 4.5) {
      return 'Good contrast - meets AA standards for normal text, AAA for large text';
    } else if (ratio >= 3.0) {
      return 'Acceptable contrast - meets AA standards for large text only';
    } else {
      return 'Poor contrast - does not meet WCAG standards. Consider using different colors.';
    }
  }

  /**
   * Suggest alternative colors to improve contrast
   * @param foreground Current foreground color
   * @param background Current background color
   * @param targetRatio Target contrast ratio (default: 4.5 for AA)
   * @returns Array of suggested color combinations
   */
  public suggestAlternativeColors(
    foreground: string,
    background: string,
    targetRatio: number = 4.5
  ): Array<{ foreground: string; background: string; ratio: number }> {
    const suggestions: Array<{ foreground: string; background: string; ratio: number }> = [];
    
    // Common accessible color combinations
    const accessibleColors = [
      { fg: '#000000', bg: '#FFFFFF' }, // Black on white
      { fg: '#FFFFFF', bg: '#000000' }, // White on black
      { fg: '#000000', bg: '#F0F0F0' }, // Black on light gray
      { fg: '#FFFFFF', bg: '#333333' }, // White on dark gray
      { fg: '#000000', bg: '#FFFF00' }, // Black on yellow
      { fg: '#FFFFFF', bg: '#0066CC' }, // White on blue
      { fg: '#000000', bg: '#00FF00' }, // Black on green
      { fg: '#FFFFFF', bg: '#CC0000' }, // White on red
    ];

    accessibleColors.forEach(combo => {
      const result = this.calculateContrastRatio(combo.fg, combo.bg);
      if (result.ratio >= targetRatio) {
        suggestions.push({
          foreground: combo.fg,
          background: combo.bg,
          ratio: result.ratio
        });
      }
    });

    return suggestions.sort((a, b) => b.ratio - a.ratio);
  }

  /**
   * Validate color accessibility for a complete color scheme
   * @param colorScheme Object containing color definitions
   * @returns Object with validation results for each color combination
   */
  public validateColorScheme(colorScheme: Record<string, string>): Record<string, ColorContrastResult> {
    const results: Record<string, ColorContrastResult> = {};
    const colors = Object.values(colorScheme);
    
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const key = `${colors[i]}_on_${colors[j]}`;
        results[key] = this.calculateContrastRatio(colors[i], colors[j]);
      }
    }
    
    return results;
  }

  /**
   * Check if text is considered "large" for WCAG purposes
   * @param fontSize Font size in pixels
   * @param fontWeight Font weight (normal or bold)
   * @returns boolean indicating if text is large
   */
  public isLargeText(fontSize: number, fontWeight: string = 'normal'): boolean {
    if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === 'bolder') {
      return fontSize >= 14;
    }
    return fontSize >= 18;
  }

  /**
   * Parse color string to RGB values
   * @param color Color string (hex, rgb, rgba, or named color)
   * @returns RGB object with values 0-255
   */
  private parseColor(color: string): { r: number; g: number; b: number } {
    // Handle named colors
    if (this.isNamedColor(color)) {
      return this.namedColorToRGB(color);
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.hexToRGB(color);
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      return this.rgbToRGB(color);
    }
    
    // Default to black if parsing fails
    console.warn(`Unable to parse color: ${color}, defaulting to black`);
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert hex color to RGB
   * @param hex Hex color string
   * @returns RGB object
   */
  private hexToRGB(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    return { r, g, b };
  }

  /**
   * Convert RGB color string to RGB object
   * @param rgb RGB color string
   * @returns RGB object
   */
  private rgbToRGB(rgb: string): { r: number; g: number; b: number } {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Check if color is a named color
   * @param color Color string
   * @returns boolean indicating if color is named
   */
  private isNamedColor(color: string): boolean {
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
      'gray', 'grey', 'orange', 'purple', 'brown', 'pink', 'lime', 'navy',
      'teal', 'silver', 'gold', 'indigo', 'violet', 'coral', 'salmon',
      'tan', 'beige', 'ivory', 'lavender', 'plum', 'olive', 'maroon'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Convert named color to RGB
   * @param color Named color string
   * @returns RGB object
   */
  private namedColorToRGB(color: string): { r: number; g: number; b: number } {
    const colorMap: Record<string, { r: number; g: number; b: number }> = {
      'black': { r: 0, g: 0, b: 0 },
      'white': { r: 255, g: 255, b: 255 },
      'red': { r: 255, g: 0, b: 0 },
      'green': { r: 0, g: 128, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'yellow': { r: 255, g: 255, b: 0 },
      'cyan': { r: 0, g: 255, b: 255 },
      'magenta': { r: 255, g: 0, b: 255 },
      'gray': { r: 128, g: 128, b: 128 },
      'grey': { r: 128, g: 128, b: 128 },
      'orange': { r: 255, g: 165, b: 0 },
      'purple': { r: 128, g: 0, b: 128 },
      'brown': { r: 165, g: 42, b: 42 },
      'pink': { r: 255, g: 192, b: 203 },
      'lime': { r: 0, g: 255, b: 0 },
      'navy': { r: 0, g: 0, b: 128 },
      'teal': { r: 0, g: 128, b: 128 },
      'silver': { r: 192, g: 192, b: 192 },
      'gold': { r: 255, g: 215, b: 0 },
      'indigo': { r: 75, g: 0, b: 130 },
      'violet': { r: 238, g: 130, b: 238 },
      'coral': { r: 255, g: 127, b: 80 },
      'salmon': { r: 250, g: 128, b: 114 },
      'tan': { r: 210, g: 180, b: 140 },
      'beige': { r: 245, g: 245, b: 220 },
      'ivory': { r: 255, g: 255, b: 240 },
      'lavender': { r: 230, g: 230, b: 250 },
      'plum': { r: 221, g: 160, b: 221 },
      'olive': { r: 128, g: 128, b: 0 },
      'maroon': { r: 128, g: 0, b: 0 }
    };
    
    return colorMap[color.toLowerCase()] || { r: 0, g: 0, b: 0 };
  }

  /**
   * Calculate relative luminance of a color
   * @param rgb RGB color object
   * @returns Luminance value between 0 and 1
   */
  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    // Convert sRGB to linear RGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Generate accessible color palette
   * @param baseColor Base color to generate palette from
   * @param count Number of colors to generate
   * @returns Array of accessible colors
   */
  public generateAccessiblePalette(baseColor: string, count: number = 5): string[] {
    const palette: string[] = [];
    const baseRGB = this.parseColor(baseColor);
    
    // Generate variations with good contrast
    for (let i = 0; i < count; i++) {
      const variation = this.generateColorVariation(baseRGB, i, count);
      palette.push(this.rgbToHex(variation));
    }
    
    return palette;
  }

  /**
   * Generate color variation for palette
   * @param baseRGB Base RGB color
   * @param index Variation index
   * @param total Total variations
   * @returns RGB color variation
   */
  private generateColorVariation(
    baseRGB: { r: number; g: number; b: number },
    index: number,
    total: number
  ): { r: number; g: number; b: number } {
    const factor = (index + 1) / total;
    const lightness = 0.1 + (factor * 0.8); // Vary lightness from 10% to 90%
    
    return {
      r: Math.round(baseRGB.r * lightness),
      g: Math.round(baseRGB.g * lightness),
      b: Math.round(baseRGB.b * lightness)
    };
  }

  /**
   * Convert RGB to hex color
   * @param rgb RGB color object
   * @returns Hex color string
   */
  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Get WCAG compliance levels for a color combination
   * @param foreground Foreground color
   * @param background Background color
   * @returns Object with compliance information for all levels and sizes
   */
  public getWCAGCompliance(
    foreground: string,
    background: string
  ): Record<string, boolean> {
    const result = this.calculateContrastRatio(foreground, background);
    
    return {
      'AA-normal': this.checkWCAGCompliance(result.ratio, 'AA', 'normal'),
      'AA-large': this.checkWCAGCompliance(result.ratio, 'AA', 'large'),
      'AAA-normal': this.checkWCAGCompliance(result.ratio, 'AAA', 'normal'),
      'AAA-large': this.checkWCAGCompliance(result.ratio, 'AAA', 'large')
    };
  }
}

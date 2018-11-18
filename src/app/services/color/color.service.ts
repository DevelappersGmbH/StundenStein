import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  /**
   * Convert string to color
   * @param inputString string to convert
   */
  public getColor(inputString: string): string {
    return this.getHSL(this.getHash(inputString));
  }

  /**
   * simple hash function
   * @param input string to hash
   */
  getHash(input: string): number {
    let hash = 0;
    if (input.length === 0) { return hash; }
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * get HSL color from hash code
   * @param hash integer hash code
   */
  private getHSL(hash: number): string {
    // const hue = Math.abs(hash % 360);
    const hue = this.getHue(Math.abs(hash % 7), hash % 15);
    const saturation = 80 + Math.abs(((hash + 1) % 20));
    const lightness = 40 + Math.abs(((hash + 2) % 20));
    return 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';
  }

  /**
   * Gets hue value by selecting a specific point in the hue and adding some randomization
   * @param selector unsigned integer between 0 and 6
   * @param randomizer signed integer (f.e. between -10 and 10)
   */
  private getHue(selector: number, randomizer: number): number {
    // interesting color points:
    let hue = 300; // pinkish color
    if (selector === 0) { hue = 0; } // red
    if (selector === 1) { hue = 30; } // orange
    if (selector === 2) { hue = 60; } // yellow
    if (selector === 3) { hue = 120; } // green
    if (selector === 4) { hue = 180; } // turqoise
    if (selector === 5) { hue = 240; } // blue
    hue += randomizer;
    if (hue < 0)   { hue = 360 - hue; }
    if (hue > 360) { hue = hue - 360; }
    return hue;
  }

}

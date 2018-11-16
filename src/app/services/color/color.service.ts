import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  public getColor(inputString: string): string {
    console.log(this.getHSL(this.getHash(inputString)));
    return this.getHSL(this.getHash(inputString));
  }

  getHash(input: string): number {
    let hash = 0;
    if (input.length === 0) { return hash; }
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  private getHSL(hash: number): string {
    const hue = Math.abs(hash % 360);
    const saturation = 80 + ((hash + 1) % 20);
    const lightness = 40 + ((hash + 2) % 20);
    return 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';
  }

}

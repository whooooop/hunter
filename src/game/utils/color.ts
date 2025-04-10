export interface RGB {
    r: number;
    g: number;
    b: number;
}

export function hexToRgb(hex: number): RGB {
  return {
    r: (hex >> 16) & 0xFF,
    g: (hex >> 8) & 0xFF,
    b: hex & 0xFF
  };
}
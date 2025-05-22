export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToNumber(hex: string): number {
// Убираем # если есть
hex = hex.replace('#', '');

// Парсим RGB компоненты
const r = parseInt(hex.substring(0, 2), 16);
const g = parseInt(hex.substring(2, 4), 16);
const b = parseInt(hex.substring(4, 6), 16);

// Конвертируем в формат Phaser (0xRRGGBB)
return (r << 16) + (g << 8) + b;
} 

export function hexToRGB(hex: string): RGB {
return {
  r: hexToNumber(hex.substring(0, 2)),
  g: hexToNumber(hex.substring(2, 4)),
  b: hexToNumber(hex.substring(4, 6))
};
}

export function numberToRGB(color: number): RGB {
return {
  r: (color >> 16) & 0xFF,
  g: (color >> 8) & 0xFF,
  b: color & 0xFF
};
}
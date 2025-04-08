export function hexToRgb(hex: string): number {
    // Убираем # если есть
    hex = hex.replace('#', '');
    
    // Парсим RGB компоненты
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Конвертируем в формат Phaser (0xRRGGBB)
    return (r << 16) + (g << 8) + b;
} 
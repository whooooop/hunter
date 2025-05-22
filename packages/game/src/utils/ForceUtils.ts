/**
 * Утилиты для работы с физическими силами
 */

/**
 * Функция с очень резким началом и плавным концом (кварт)
 * @param x Значение от 0 до 1
 * @returns Преобразованное значение с плавным затуханием
 */
export function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

/**
 * Функция с очень резким началом и плавнейшим окончанием
 * @param x Значение от 0 до 1
 * @returns Преобразованное значение с очень плавным затуханием
 */
export function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

/**
 * Функция easeInOutExpo для резкого начала и плавного конца
 * @param x Значение от 0 до 1
 * @returns Преобразованное значение
 */
export function easeInOutExpo(x: number): number {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5 
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

/**
 * Преобразует силу и направление в целевое смещение с учетом трения
 * @param force Сила в условных единицах
 * @param angle Угол в радианах
 * @param friction Коэффициент трения (0-1)
 * @returns Целевое смещение по X и Y
 */
export function forceToTargetOffset(force: number, angle: number, friction: number = 0): { x: number, y: number } {
  // Базовый коэффициент для преобразования силы в расстояние
  const baseScale = 0.5;
  
  // Учитываем трение при расчете расстояния
  // Чем выше трение, тем меньше расстояние
  const frictionFactor = Math.max(0.3, 1 - (friction * 0.7));
  
  // Используем квадратичную зависимость для большей реалистичности
  // Сильные удары дают непропорционально большее смещение
  const distance = Math.pow(force * baseScale * frictionFactor, 1.2);
  
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  };
} 
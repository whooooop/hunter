/**
 * Утилиты для геометрических расчетов, используемые для обнаружения пересечений и столкновений
 */

/**
 * Находит точку пересечения луча с отрезком
 * @param rayOriginX X-координата начала луча
 * @param rayOriginY Y-координата начала луча
 * @param rayDirX X-компонента направления луча (нормализованная)
 * @param rayDirY Y-компонента направления луча (нормализованная)
 * @param lineStartX X-координата начала отрезка
 * @param lineStartY Y-координата начала отрезка
 * @param lineEndX X-координата конца отрезка
 * @param lineEndY Y-координата конца отрезка
 * @returns Объект с координатами пересечения и расстоянием или null, если пересечения нет
 */
export function rayLineIntersection(
  rayOriginX: number, rayOriginY: number,
  rayDirX: number, rayDirY: number,
  lineStartX: number, lineStartY: number,
  lineEndX: number, lineEndY: number
): { hitX: number, hitY: number, distance: number } | null {
  // Вычисляем направление отрезка
  const lineDirectionX = lineEndX - lineStartX;
  const lineDirectionY = lineEndY - lineStartY;
  
  // Вычисляем определитель
  const denominator = lineDirectionY * rayDirX - lineDirectionX * rayDirY;
  
  // Если определитель близок к нулю, то линии параллельны
  if (Math.abs(denominator) < 0.0001) {
    return null;
  }
  
  // Вычисляем параметры для точки пересечения
  const originDiffX = lineStartX - rayOriginX;
  const originDiffY = lineStartY - rayOriginY;
  
  const t1 = (originDiffY * rayDirX - originDiffX * rayDirY) / denominator;
  const t2 = (originDiffY * lineDirectionX - originDiffX * lineDirectionY) / denominator;
  
  // Проверяем, находится ли точка пересечения на отрезке и в направлении луча
  if (t1 >= 0 && t1 <= 1 && t2 >= 0) {
    // Вычисляем координаты точки пересечения
    const hitX = lineStartX + t1 * lineDirectionX;
    const hitY = lineStartY + t1 * lineDirectionY;
    
    // Вычисляем расстояние от начала луча до точки пересечения
    const distance = Math.sqrt(
      (hitX - rayOriginX) * (hitX - rayOriginX) + 
      (hitY - rayOriginY) * (hitY - rayOriginY)
    );
    
    return { hitX, hitY, distance };
  }
  
  return null;
}

/**
 * Проверяет, находится ли точка внутри прямоугольника
 * @param pointX X-координата точки
 * @param pointY Y-координата точки
 * @param rectX X-координата левого верхнего угла прямоугольника
 * @param rectY Y-координата левого верхнего угла прямоугольника
 * @param rectWidth Ширина прямоугольника
 * @param rectHeight Высота прямоугольника
 * @returns true, если точка внутри прямоугольника, иначе false
 */
export function isPointInRect(
  pointX: number, pointY: number,
  rectX: number, rectY: number,
  rectWidth: number, rectHeight: number
): boolean {
  return (
    pointX >= rectX && 
    pointX <= rectX + rectWidth && 
    pointY >= rectY && 
    pointY <= rectY + rectHeight
  );
}

/**
 * Альтернативный метод определения пересечения луча с прямоугольником
 * Использует проверку всех четырех сторон и проверку начальной точки
 */
export function rayRectIntersectionRobust(
  rayOriginX: number, rayOriginY: number,
  rayDirX: number, rayDirY: number,
  rectX: number, rectY: number,
  rectWidth: number, rectHeight: number
): { hitX: number, hitY: number, distance: number } | null {
  // Сначала проверяем, находится ли начальная точка внутри прямоугольника
  if (isPointInRect(rayOriginX, rayOriginY, rectX, rectY, rectWidth, rectHeight)) {
    return { hitX: rayOriginX, hitY: rayOriginY, distance: 0 };
  }

  // Параметры прямоугольника
  const minX = rectX;
  const minY = rectY;
  const maxX = rectX + rectWidth;
  const maxY = rectY + rectHeight;

  // Предельные значения t (параметра луча) для пересечений с плоскостями
  let tMin = -Infinity;
  let tMax = Infinity;

  // Проверка на X-пересечения
  if (Math.abs(rayDirX) < 0.0001) {
    // Луч параллелен X-плоскостям
    if (rayOriginX < minX || rayOriginX > maxX) {
      return null; // Луч не пересекает прямоугольник
    }
  } else {
    const invDirX = 1 / rayDirX;
    let t1 = (minX - rayOriginX) * invDirX;
    let t2 = (maxX - rayOriginX) * invDirX;

    if (t1 > t2) {
      [t1, t2] = [t2, t1]; // Меняем местами для правильного порядка
    }

    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);

    if (tMin > tMax) {
      return null; // Нет пересечения
    }
  }

  // Проверка на Y-пересечения
  if (Math.abs(rayDirY) < 0.0001) {
    // Луч параллелен Y-плоскостям
    if (rayOriginY < minY || rayOriginY > maxY) {
      return null; // Луч не пересекает прямоугольник
    }
  } else {
    const invDirY = 1 / rayDirY;
    let t1 = (minY - rayOriginY) * invDirY;
    let t2 = (maxY - rayOriginY) * invDirY;

    if (t1 > t2) {
      [t1, t2] = [t2, t1]; // Меняем местами для правильного порядка
    }

    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);

    if (tMin > tMax) {
      return null; // Нет пересечения
    }
  }

  // Если tMin отрицательный, то луч направлен от прямоугольника
  if (tMin < 0) {
    if (tMax < 0) {
      return null; // Прямоугольник позади луча
    }
    tMin = 0; // Используем начальную точку луча
  }

  // Вычисляем точку пересечения
  const hitX = rayOriginX + rayDirX * tMin;
  const hitY = rayOriginY + rayDirY * tMin;
  const distance = tMin; // Расстояние = значение параметра t (так как луч нормализован)

  return { hitX, hitY, distance };
} 
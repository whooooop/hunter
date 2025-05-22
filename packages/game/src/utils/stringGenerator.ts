/**
 * Утилиты для генерации случайных строк
 */

/**
 * Набор символов для генерации случайных строк
 */
const CHARS = {
  /** Цифры от 0 до 9 */
  DIGITS: '0123456789',
  /** Строчные буквы */
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  /** Заглавные буквы */
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  /** Специальные символы */
  SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  /** Все символы */
  ALL: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Генерирует случайную 6-значную строку из указанного набора символов
 * @param charset Набор символов для генерации (по умолчанию цифры и буквы)
 * @returns Случайная 6-значная строка
 * 
 * @example
 * // Генерирует 6-значную строку из цифр и букв
 * const randomStr = generateString();
 * 
 * @example
 * // Генерирует 6-значную строку только из цифр
 * const randomDigits = generateString(CHARS.DIGITS);
 */
export function generateString(charset: string = CHARS.DIGITS + CHARS.LOWERCASE + CHARS.UPPERCASE): string {
  let result = '';
  const length = 6;
  const charactersLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Генерирует случайную строку указанной длины из определенного набора символов
 * @param length Длина генерируемой строки
 * @param charset Набор символов для генерации
 * @returns Случайная строка заданной длины
 * 
 * @example
 * // Генерирует 10-значную строку из цифр
 * const randomDigits = generateStringWithLength(10, CHARS.DIGITS);
 */
export function generateStringWithLength(length: number, charset: string = CHARS.ALL): string {
  let result = '';
  const charactersLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

export function generateId(): string {
  return generateStringWithLength(4, CHARS.LOWERCASE + CHARS.UPPERCASE);
}

/**
 * Экспортируем наборы символов для удобного использования в других модулях
 */
export { CHARS }; 
export type SupportedLocale = 'en' | 'ru';

type LocalizedValues<T> = {
  [key in SupportedLocale]: T;
};

let defaultLocale: SupportedLocale = 'en';

export function setDefaultLocale(locale: SupportedLocale): void {
  defaultLocale = locale;
}

export function getDefaultLocale(): SupportedLocale {
  return defaultLocale;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  if (!locale) return false;
  return ['en', 'ru'].includes(locale as string);
}

/**
 * Нормализует локаль, возвращая поддерживаемую локаль или локаль по умолчанию
 * @param locale Локаль для нормализации
 * @returns Нормализованная локаль
 */
export function normalizeLocale(locale: string): SupportedLocale {
  // Если локаль не указана, возвращаем локаль по умолчанию
  if (!locale) return defaultLocale;
  
  // Если локаль содержит дефис (например, 'en-US'), берем только первую часть
  const baseLang = locale.split('-')[0].toLowerCase();
  
  // Проверяем, поддерживается ли базовая локаль
  if (isSupportedLocale(baseLang)) {
    return baseLang;
  }
  
  // Если локаль не поддерживается, возвращаем локаль по умолчанию
  return defaultLocale;
}

/**
 * Создает локализованное значение (строку, функцию и т.д.)
 * @param localizedValues Объект со значениями для каждой локали
 * @returns Объект с методом locale(locale) и геттером translate (для локали по умолчанию)
 */
export function I18n<T>(
  localizedValues: LocalizedValues<T>
): {
  locale(locale: string): T;
  get translate(): T;
} {
  const localeFunction = (locale: string = defaultLocale): T => {
    const normalizedLocale = normalizeLocale(locale);
    return localizedValues[normalizedLocale];
  };
  
  const result = localeFunction as any;
  result.locale = localeFunction;

  Object.defineProperty(result, 'translate', {
    get: () => localeFunction(defaultLocale)
  });
  
  return result;
}

export type I18nReturnType<T> = {
  locale(locale: string): T;
  get translate(): T;
}
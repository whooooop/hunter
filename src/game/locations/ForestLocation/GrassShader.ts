/**
 * Шейдер для травы
 * Создает анимированную, колышущуюся траву мультяшного стиля
 */

// Импортируем шейдеры из файлов
import GRASS_VERTEX_SHADER from './shaders/grass.vert';
import GRASS_FRAGMENT_SHADER from './shaders/grass.frag';

export const GRASS_SHADER_KEY = 'grass_shader';

// Экспортируем шейдеры для использования в других местах
export { GRASS_VERTEX_SHADER, GRASS_FRAGMENT_SHADER }; 
import * as Phaser from 'phaser';
import { hexToRgb } from '../../utils/colors';

/**
 * Скрипт для программного создания текстуры гильзы
 * Этот подход позволяет не зависеть от внешних файлов изображений
 */
export const createShellCasingTexture = (scene: Phaser.Scene): void => {
  // Проверяем, существует ли уже такая текстура
  if (scene.textures.exists('shell_casing')) {
    scene.textures.remove('shell_casing'); // Удаляем существующую текстуру для пересоздания
  }

  // Размер текстуры (увеличиваем для лучшей видимости)
  const width = 24;
  const height = 8;

  // Создаем новую графику для рисования гильзы
  const graphics = scene.add.graphics();

  // Цвета для гильзы - делаем более яркими
  const shellColor = hexToRgb('#FFD700');       // Основной цвет гильзы (ярко-желтый)
  const shellStrokeColor = hexToRgb('#FF8800'); // Контур гильзы (оранжевый для контраста)

  // Рисуем гильзу в виде яркой желтой палочки с оранжевым контуром
  graphics.fillStyle(shellColor, 1);
  graphics.lineStyle(1, shellStrokeColor, 1);
  
  // Рисуем прямоугольник для основной части гильзы
  graphics.fillRect(2, 1, 20, 6);
  graphics.strokeRect(2, 1, 20, 6);
  
  // Добавляем дополнительные элементы для лучшей видимости
  graphics.fillStyle(0xFF8800, 1); // Оранжевый для торца гильзы
  graphics.fillRect(2, 1, 3, 6);   // Торец гильзы
  
  // Создаем текстуру из графики
  graphics.generateTexture('shell_casing', width, height);
  
  // Удаляем графику после создания текстуры
  graphics.destroy();
}; 
// Импорт изображений
import playerPlaceholder from '../../../../public/assets/images/player_placeholder.png';
import bulletPlaceholder from '../../../../public/assets/images/bullet_placeholder.png';
import weaponPlaceholder from '../../../../public/assets/images/weapon_placeholder.png';
import background from '../../../../public/assets/images/background.png';

// Экспорт объекта с изображениями
export const images = {
  playerPlaceholder,
  bulletPlaceholder,
  weaponPlaceholder,
  background
};

// Функция для предзагрузки всех изображений
export function preloadImages(scene: Phaser.Scene): void {
  scene.load.image('player_placeholder', playerPlaceholder);
  scene.load.image('bullet_placeholder', bulletPlaceholder);
  scene.load.image('weapon_placeholder', weaponPlaceholder);
  scene.load.image('background', background);
} 
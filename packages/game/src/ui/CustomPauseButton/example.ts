// Пример использования CustomPauseButton
// Можно добавить в любую сцену

import { CustomPauseButton } from './index';

// В методе create() сцены:
export function addPauseButtonToScene(scene: Phaser.Scene) {
  // Создаем кнопку паузы в правом верхнем углу экрана
  const pauseButton = new CustomPauseButton(scene, scene.cameras.main.width - 50, 50);
  pauseButton.setDepth(1000); // Высокий z-index, чтобы была поверх других элементов

  return pauseButton;
}

// Альтернативно - добавить в любой контейнер:
export function addPauseButtonToContainer(scene: Phaser.Scene, container: Phaser.GameObjects.Container) {
  const pauseButton = new CustomPauseButton(scene, 0, 0); // Позиция относительно контейнера
  container.add(pauseButton);

  return pauseButton;
} 
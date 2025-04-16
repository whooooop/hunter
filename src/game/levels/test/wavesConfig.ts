import { RabbitEnemy } from "../../entities/rabbit/RabbitEntity";
import { settings } from "../../settings";
import { Wave } from '../../core/controllers/WaveController'

export function createWavesConfig(): Wave[] {
  const rightStartPointX = settings.display.width + 50;

  return [
    // Wave 1
    {
      delay: 2000,
      spawns: [
        {
          delay: 1000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 400],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 8000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 600],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 2000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 200],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 1300,
          entity: RabbitEnemy,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 1500,
          entity: RabbitEnemy,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 2300,
          entity: RabbitEnemy,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 500,
          entity: RabbitEnemy,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },

    // Wave 2
    {
      delay: 5000,
      spawns: [
        {
          delay: 1000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 400],
          options: { health: 3000, moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 5000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 600],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 0,
          entity: RabbitEnemy,
          position: [rightStartPointX, 200],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 300,
          entity: RabbitEnemy,
          position: [rightStartPointX, 300],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
        {
          delay: 500,
          entity: RabbitEnemy,
          position: [rightStartPointX, 500],
          options: { moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },

    // Wave 3
    {
      delay: 20000,
      spawns: [
        {
          delay: 1000,
          entity: RabbitEnemy,
          position: [rightStartPointX, 400],
          options: { health: 3000, moveX: -1, moveY: 0, direction: -1 },
        },
      ],
    },
  ]
}
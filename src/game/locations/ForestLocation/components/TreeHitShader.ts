/**
 * Шейдер для эффекта попадания в дерево
 */

// Ключ для регистрации шейдера
export const TREE_HIT_SHADER_KEY = 'treeHitShader';

// Вершинный шейдер (просто передает координаты без изменений)
export const TREE_HIT_VERTEX_SHADER = `
precision mediump float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Фрагментный шейдер для эффекта попадания
export const TREE_HIT_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;

uniform sampler2D uMainSampler; // Текущая текстура объекта
uniform float uTime;            // Время для анимации эффекта
uniform float uIntensity;       // Интенсивность эффекта (0.0 - 1.0)
uniform vec3 uHitColor;         // Цвет эффекта попадания (r, g, b)

void main() {
    // Получаем текущий цвет из текстуры
    vec4 texColor = texture2D(uMainSampler, vUv);
    
    // Создаем пульсирующий эффект, затухающий со временем
    float pulse = (sin(uTime * 10.0) * 0.5 + 0.5) * uIntensity;
    
    // Смешиваем цвет текстуры с цветом попадания, используя пульсацию
    vec3 hitColor = mix(texColor.rgb, uHitColor, pulse);
    
    // Сохраняем прозрачность оригинальной текстуры
    gl_FragColor = vec4(hitColor, texColor.a);
}
`;

/**
 * Регистрирует шейдер эффекта попадания в сцене
 * @param scene Сцена Phaser для регистрации шейдера
 */
export function registerTreeHitShader(scene: Phaser.Scene): void {
    scene.cache.shader.add(TREE_HIT_SHADER_KEY, {
        fragment: TREE_HIT_FRAGMENT_SHADER,
        vertex: TREE_HIT_VERTEX_SHADER
    });
} 
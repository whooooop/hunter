precision mediump float;

// Время для анимации
uniform float time;
// Размер экрана
uniform vec2 resolution;
// Цвет травы
uniform vec3 grassColor;
// Координаты текстуры из вертексного шейдера
varying vec2 outTexCoord;

// Функция шума для создания случайности в движении
float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = outTexCoord;
  
  float grassHeight = 0.4 + noise(vec2(uv.x * 10.0, 0.0)) * 0.1;
  
  float windStrength = 0.05;
  float wind = sin(uv.x * 10.0 + time) * windStrength;
  
  float windFactor = smoothstep(0.0, grassHeight, uv.y);
  wind *= windFactor;
  
  float grassEffect = smoothstep(grassHeight + wind, grassHeight + 0.01 + wind, uv.y);
  
  float shadow = smoothstep(0.0, 0.5, uv.y);
  
  vec3 color = grassColor * shadow;
  
  if (grassEffect < 0.1) 
  {
    discard;
  }
  
  gl_FragColor = vec4(color, 1.0);
} 
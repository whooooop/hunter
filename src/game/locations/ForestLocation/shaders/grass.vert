precision mediump float;

attribute vec2 inPosition;
attribute vec2 inTexCoord;

uniform vec2 resolution;

varying vec2 outTexCoord;
varying vec2 outPosition;

void main() 
{
  // Преобразуем координаты в диапазон [-1, 1]
  vec2 pos = (inPosition / resolution) * 2.0 - 1.0;
  gl_Position = vec4(pos, 0.0, 1.0);
}
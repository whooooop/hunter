precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

attribute vec2 inPosition;
attribute vec2 inTexCoord;

varying vec2 outTexCoord;

void main() 
{
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(inPosition, 0.0, 1.0);
  outTexCoord = inTexCoord;
}
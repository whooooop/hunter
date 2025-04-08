precision mediump float;

// Время для анимации
uniform float time;
// Размер экрана
uniform vec2 resolution;
// Цвет травы
uniform vec3 grassColor;
// Координаты текстуры из вертексного шейдера
varying vec2 outTexCoord;

// Функция для создания случайного числа
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float blade(vec2 p, float angle, float wind) {
    float c = cos(angle);
    float s = sin(angle);
    p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    
    float width = 0.05;
    float height = 0.8;
    
    float windEffect = wind * (1.0 - p.y) * 0.5;
    p.x += windEffect;
    
    float blade = smoothstep(width, 0.0, abs(p.x)) * 
                 smoothstep(-height, 0.0, -p.y) * 
                 smoothstep(0.0, height, p.y);
    
    return blade;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    float density = 20.0;
    vec2 pos = uv * density;
    
    vec2 offset = vec2(
        random(pos) * 2.0 - 1.0,
        random(pos + 1.0) * 2.0 - 1.0
    ) * 0.5;
    
    pos += offset;
    
    float angle = random(pos) * 3.14;
    
    float finalBlade = 0.0;
    float bladeWind = sin(time * 1.0 + uv.x * 5.0) * 0.05;
    
    finalBlade = blade(fract(pos) - 0.5, angle, bladeWind);
    
    float gradient = 1.0 - length(fract(pos) - 0.5);
    
    float final = smoothstep(0.0, 0.1, finalBlade) * gradient;
    
    // Более приглушенные цвета травы
    vec3 baseColor = vec3(0.0, 0.4, 0.0); // Более темный базовый цвет
    vec3 highlightColor = vec3(0.1, 0.5, 0.1); // Более приглушенный светлый цвет
    
    // Освещение сверху
    float light = 0.3 + 0.2 * sin(angle); // Уменьшаем контраст освещения
    vec3 color = mix(baseColor, highlightColor, light);
    
    // Минимальные вариации цвета
    color *= 1.0 + noise(pos * 2.0) * 0.05;
    
    gl_FragColor = vec4(color, final);
} 
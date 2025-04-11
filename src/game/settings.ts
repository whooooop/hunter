export const settings = {
    display: {
        width: 1280,
        height: 720,
    },
    audio: {
        weaponsVolume: 0.2,
        effectsVolume: 0.5,
        musicVolume: 0.5,
    },
    gameplay: {
        depthOffset: 100,
        // Настройки для гильз оружия
        shellCasings: {
            enabled: true,       // Включено ли отображение гильз
            maxShells: 10000,    // Максимальное количество гильз на сцене
            lifetime: 0,         // Время жизни гильз в ms (0 = бесконечно, гильзы не исчезают)
            ejectionSpeed: 180,  // Скорость выброса гильз
            ejectionAngle: 1,    // Угол выброса гильз (в градусах) - увеличен для выброса вверх и назад
            gravity: 700,        // Гравитация для гильз
            bounce: 1,           // Коэффициент отскока
            scale: 0.35,         // Масштаб гильз
            dragX: 100,          // Трение по X для остановки гильз
        },
        blood: {
            enabled: true,
            keepDecals: true,
        }
    }
}
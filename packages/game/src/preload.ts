const textures: Map<string, { url: string }> = new Map();
const audio: Map<string, { url: string }> = new Map();

export function loadAssets(scene: Phaser.Scene, minLoadingTime: number, callback: (value: number) => void): void {
  const allTexturesLoaded = Array.from(textures.keys()).every((key) => scene.textures.exists(key));
  const allAudioLoaded = Array.from(audio.keys()).every((key) => scene.cache.audio.exists(key));
  const startTime = Date.now();
  let targetProgress = 0;

  const event = scene.time.addEvent({
    delay: 16,
    callback: () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(targetProgress, elapsedTime / minLoadingTime);
      if (progress === 1) {
        event.destroy();
      }
      callback(progress);
    },
    loop: true
  });

  if(allTexturesLoaded && allAudioLoaded) {
    targetProgress = 1;
  }

  scene.load.on('progress', (value: number) => {
    targetProgress = value;
  });
}

export function preloadImage(scene: Phaser.Scene, { key, url }: { key: string, url: string }): void {
  if (!scene.textures.exists(key)) {
    scene.load.image(key, url);
    textures.set(key, { url });
  }
}

export function preloadAudio(scene: Phaser.Scene, key: string, url: string): void {
  if (!scene.cache.audio.exists(key)) {
    scene.load.audio(key, url);
    audio.set(key, { url });
  }
}

export function preloadSpriteSheet(scene: Phaser.Scene, { key, url, frameWidth, frameHeight }: { key: string, url: string, frameWidth: number, frameHeight: number }): void {
  if (!scene.textures.exists(key)) {
    scene.load.spritesheet(key, url, { frameWidth, frameHeight });
    textures.set(key, { url });
  }
}
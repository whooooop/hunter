export namespace Audio {
  export enum Type {
    Music = 'music',
    Effect = 'effect',
    Interface = 'interface',
    Ambience = 'ambience',
  }

  export interface Asset {
    key: string;
    url: string;
    type: Type;
    volume?: number;
  }

  export interface Settings {
    muted: boolean;
    globalVolume: number;
    musicVolume: number;
    effectVolume: number;
    interfaceVolume: number;
    ambienceVolume: number;
  }
}
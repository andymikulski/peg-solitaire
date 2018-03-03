import { GameSounds } from '../AssetManager';

export default class SoundManager {
  loadedSounds: { [name: string]: HTMLAudioElement } = {};

  load(files: { [name: string]: any }) {
    for (const soundName in files) {
      const info = files[soundName];

      const sound = document.createElement('audio');
      sound.setAttribute('preload', 'auto');

      let path;
      if (typeof info === 'string') {
        path = info;
      } else {
        const { url, ...rest } = info;
        path = url;
        for (const prop in rest) {
          // This allows us to set loop etc
          sound.setAttribute(prop, rest[prop]);
        }
      }

      sound.innerHTML = `<source src="${path}" type="audio/wav" />`;

      this.loadedSounds[soundName] = sound;
    }
  }

  setSoundVolume(soundName: GameSounds, volume: number) {
    if (this.loadedSounds[soundName]) {
      this.loadedSounds[soundName].volume = volume;
    }
  }

  play(soundName: GameSounds, loop: boolean = false) {
    const soundInfo: HTMLAudioElement = this.loadedSounds[soundName];
    if (soundInfo) {
      soundInfo.play();
      if (loop) {
        soundInfo.onended = soundInfo.play.bind(soundInfo);
      }
    }
  }
}


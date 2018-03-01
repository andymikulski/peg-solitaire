export default class SoundManager {
  loadedSounds: { [name: string]: HTMLAudioElement } = {};

  load(files: { [name: string]: string }) {
    for (const soundName in files) {
      const path = files[soundName];

      const sound = document.createElement('audio');
      sound.setAttribute('preLoad', 'auto');
      sound.innerHTML = `<source src="${path}" type="audio/wav" />`;

      this.loadedSounds[soundName] = sound;
    }
  }

  play(soundName: string) {
    if (this.loadedSounds[soundName]) {
      this.loadedSounds[soundName].play();
    }
  }
}


import SoundManager from './sounds/SoundManager';
import { ServiceProvider, Service } from './common/Provider';

export enum GameSounds {
  MUSIC,
  HISS,
  BOOM,
  DENY,
  PEG_MOVE,
  PEG_REMOVE,
  PEG_SELECT
}

const cachebust = Date.now();
export const SoundInfo: { [soundName: string]: any } = {
  [GameSounds.MUSIC]: {
    url: `sounds/xerxes.mp3?${cachebust}`,
    loop: true,
  },
  [GameSounds.HISS]: `sounds/sss2.wav?${cachebust}`,
  [GameSounds.BOOM]: `sounds/boom3.wav?${cachebust}`,
  [GameSounds.DENY]: `sounds/cant-move.wav?${cachebust}`,
  [GameSounds.PEG_MOVE]: `sounds/peg-land-2.wav?${cachebust}`,
  [GameSounds.PEG_REMOVE]: `sounds/peg-removed.wav?${cachebust}`,
  [GameSounds.PEG_SELECT]: `sounds/peg-select.wav?${cachebust}`,
};

export default class AssetManager {
  soundMan: SoundManager;

  constructor() {
    this.soundMan = new SoundManager();
    ServiceProvider.register(Service.SOUND, this.soundMan);
  }

  private loadSounds() {
    for (const name in SoundInfo) {
      this.soundMan.load(SoundInfo);
    }
  }

  public loadAssets() {
    this.loadSounds();
  }
}


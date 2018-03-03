import SoundManager from './sounds/SoundManager';
import { ServiceProvider, Service } from './common/Provider';

export enum GameSounds {
  MUSIC,
  HISS,
  BOOM,
  DENY,
  PEG_HIT,
  PEG_REMOVE,
  PEG_SELECT,
  ROUND_END,
  CLICK,
}

const cachebust = Date.now();
export const SoundInfo: { [soundName: string]: string } = {
  [GameSounds.MUSIC]: `sounds/xerxes.mp3?${cachebust}`,
  [GameSounds.HISS]: `sounds/sss2.wav?${cachebust}`,
  [GameSounds.BOOM]: `sounds/boom3.wav?${cachebust}`,
  [GameSounds.DENY]: `sounds/cant-move.wav?${cachebust}`,
  [GameSounds.PEG_HIT]: `sounds/peg-land-2.wav?${cachebust}`,
  [GameSounds.PEG_REMOVE]: `sounds/peg-removed.wav?${cachebust}`,
  [GameSounds.PEG_SELECT]: `sounds/peg-select.wav?${cachebust}`,
  [GameSounds.ROUND_END]: `sounds/round-end-2.wav?${cachebust}`,
  [GameSounds.CLICK]: `sounds/button-click.wav?${cachebust}`,
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


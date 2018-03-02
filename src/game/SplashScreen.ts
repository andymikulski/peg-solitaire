import { Printable } from '../rendering/RenderingPipeline';
import VCR from '../rendering/VCR';
import { ServiceProvider, Service } from '../common/Provider';
import { GameSounds } from '../AssetManager';
import { GameClock } from './GameClock';


export default class SplashScreen implements Printable {
  vcr: VCR;

  welcomeText: number[];

  constructor(private width: number, private height: number) {
    this.vcr = new VCR(width, height);
    this.welcomeText = [width / 2, height / 2];

    const sound = ServiceProvider.lookup(Service.SOUND);
    sound.play(GameSounds.MUSIC);
    sound.setSoundVolume('music', 0.75);

    const clock: GameClock = ServiceProvider.lookup(Service.CLOCK);
    clock.addBinding(this);
    clock.start();

  }

  update(delta: number, elapsed: number) {
    this.vcr.clear();
    const ctx = this.vcr.getContext();

    ctx.font = `${Math.abs(4 + Math.cos(elapsed / 2) * 15) + 45}px Riffic`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Peg Solitaire', this.welcomeText[0], this.welcomeText[1] - 4);
    ctx.fillText('Peg Solitaire', this.welcomeText[0], this.welcomeText[1] + 4);
    ctx.fillText('Peg Solitaire', this.welcomeText[0] + 1, this.welcomeText[1]);
    // ctx.fillText('Peg Solitaire', this.welcomeText[0] - 1, this.welcomeText[1]);

    ctx.fillStyle = 'white';
    ctx.fillText('Peg Solitaire', this.welcomeText[0], this.welcomeText[1] - 2);
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.drawImage(
      this.vcr.getCanvas(),
      0,
      0,
      this.width,
      this.height,
      0, 0,
      this.width,
      this.height,
    );
  }
}
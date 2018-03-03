import Transform from './Transform';
import { Printable } from '../rendering/RenderingPipeline';
import { ServiceProvider, Service } from './Provider';
import InteractionLayer from '../input/InteractionLayer';
import SoundManager from '../sounds/SoundManager';
import { GameSounds } from '../AssetManager';

export class Button extends Transform implements Printable {
  private hasMouseDown: boolean = false;

  constructor(public label: string, private onClickHandler: Function) {
    super();
  }

  enable() {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).register(this);
  }

  disable() {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).unregister(this);
  }

  onClick() {
    (<SoundManager>ServiceProvider.lookup(Service.SOUND)).play(GameSounds.CLICK);

    this.onClickHandler();
  }

  print(toContext: CanvasRenderingContext2D) {
    // No idea why this formula works, but hey!
    const padding = (this.width * this.height) / 1000;
    toContext.strokeStyle = 'rgba(71, 70, 71, 0.1)';
    toContext.strokeRect(this.position[0] - (padding / 2), this.position[1] + (padding / 2), this.width + padding, this.height + padding);

    toContext.font = `${this.height}px Dimbo`;
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';
    toContext.textAlign = 'left';
    toContext.fillStyle = 'rgb(71, 70, 71)';
    toContext.fillText(this.label, this.position[0], this.position[1] + this.height);
  }
}
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
    toContext.fillStyle = 'rgba(71, 70, 71, 0.1)';
    toContext.fillRect(this.position[0] - 25, this.position[1] + 25, this.width - 25, this.height + 25)

    toContext.font = `${this.height}px Dimbo`;
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';
    toContext.textAlign = 'left';
    toContext.fillStyle = 'rgb(71, 70, 71)';
    toContext.fillText(this.label, this.position[0], this.position[1] + this.height);
  }
}
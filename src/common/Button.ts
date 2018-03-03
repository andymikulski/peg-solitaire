import Transform from './Transform';
import { Printable } from '../rendering/RenderingPipeline';
import { ServiceProvider, Service } from './Provider';
import InteractionLayer from '../input/InteractionLayer';
import SoundManager from '../sounds/SoundManager';
import { GameSounds } from '../AssetManager';

export class Button extends Transform implements Printable {
  uiLayer: InteractionLayer;
  soundMan: SoundManager;
  paddingFactor: number = 0.3;

  constructor(public label: string, private onClickHandler: Function) {
    super();
    this.uiLayer = ServiceProvider.lookup(Service.UI);
    this.soundMan = ServiceProvider.lookup(Service.SOUND);
  }

  enable() {
    this.uiLayer.register(this);
  }

  disable() {
    this.uiLayer.unregister(this);
  }

  onClick() {
    this.soundMan.play(GameSounds.CLICK);

    this.onClickHandler();
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.strokeStyle = 'rgba(71, 70, 71, 0.1)';
    toContext.strokeRect(this.position[0], this.position[1], this.width, this.height);

    const { paddingFactor } = this;

    toContext.font = `${this.height * (1 - paddingFactor)}px Dimbo`;
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';
    toContext.textAlign = 'left';
    toContext.fillStyle = 'rgb(71, 70, 71)';
    toContext.fillText(
      this.label,
      this.position[0] + this.width - (this.width * (1 - (paddingFactor / 2))),
      this.position[1] + this.height - (this.height * (paddingFactor * 0.75))
    );
  }
}
import { Button } from '../common/Button';
import Emitter from '../common/Emitter';
import { Printable } from '../rendering/RenderingPipeline';

export enum SplashScreenEvents {
  START = 'start-game',
}

export default class SplashScreen extends Emitter implements Printable {
  buttons: Button[] = [];

  constructor(private width: number, private height: number) {
    super();

    this.createButtons();
  }

  createButtons() {
    [{
      label: 'Start Game',
      callback: () => this.emit(SplashScreenEvents.START),
      x: (this.width / 2) - (185 / 2),
      y: this.height * 0.7,
      width: 185,
      height: 48,
    }].forEach(buttonConfig => {
      let butt = new Button(buttonConfig.label, buttonConfig.callback);
      butt.position[0] = buttonConfig.x;
      butt.position[1] = buttonConfig.y;
      butt.width = buttonConfig.width;
      butt.height = buttonConfig.height;
      this.buttons.push(butt);
    });
  }

  attach() {
    this.buttons.forEach(x => x.enable());
  }

  detach() {
    this.buttons.forEach(x => x.disable());
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.font = '48px Riffic';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';

    toContext.strokeStyle = '#474647';
    toContext.fillStyle = '#474647';
    toContext.textAlign = 'center';
    toContext.fillText(`Peg Solitaire`, this.width / 2, 100);
    toContext.font = '24px Dimbo';
    toContext.textAlign = 'center';
    toContext.fillText(`By Andy Mikulski`, this.width / 2, 150);

    this.buttons.forEach(button => button.print(toContext));
  }
}

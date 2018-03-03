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
      y: this.height * 0.585,
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
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';

    toContext.strokeStyle = '#474647';
    toContext.fillStyle = '#97cc04'; // rgb(4, 150, 255)';
    toContext.textAlign = 'center';
    toContext.font = '72px Riffic';
    toContext.fillText(`Peg Solitaire`, this.width / 2, 275);

    toContext.globalCompositeOperation = 'multiply';
    toContext.fillStyle = `rgba(4, 150, 255, 0.0575)`;
    toContext.fillRect(0, 175, 800, 150);

    toContext.fillStyle = '#474647';
    toContext.font = '28px Dimbo';
    toContext.textAlign = 'center';
    // #note math ops which aren't simplified are probably going to be swapped out
    // with a variable in the future. In this case, the `600` is the canvas height.
    toContext.fillText(`Game by Andy Mikulski`, this.width / 2, 600 - 20);

    this.buttons.forEach(button => button.print(toContext));
  }
}

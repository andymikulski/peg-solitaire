import { ServiceProvider, Service } from '../common/Provider';
import { GameClock } from '../game/GameClock';
import Transform from '../common/Transform';
import Emitter from '../common/Emitter';
import { Printable } from '../rendering/RenderingPipeline';
import InteractionLayer from '../input/InteractionLayer';

import { Button } from '../common/Button';

export enum InterstitialEvents {
  NEXT_LEVEL = 'next-level',
  RESTART_CURRENT = 'restart-current',
};

export default class InterstitialScreen extends Emitter implements Printable {
  buttons: Button[] = [];
  userHasWon: boolean = false;

  constructor(private width: number, private height: number) {
    super();
  }

  setRoundInfo(didUserWin: boolean) {
    this.buttons = [];
    this.userHasWon = didUserWin;
    this.createButtons(didUserWin);
  }


  createButtons(didUserWin: boolean) {

    [{
      condition: true,
      label: 'Next Level',
      callback: () => this.emit(InterstitialEvents.NEXT_LEVEL),
      x: this.width - (165 + 100), // (this.width / 2) - (90 / 2),
      y: this.height * 0.6,
      // y: this.height * 0.725,
      width: 165,
      height: 48,
    }, {
      condition: true,
      label: 'Retry',
      callback: () => this.emit(InterstitialEvents.RESTART_CURRENT),
      x: 125, // this.width * 0.2, // (this.width / 2) - (165 / 2),
      y: this.height * 0.6,
      width: 90,
      height: 48,
    }].forEach(buttonConfig => {
      if (!buttonConfig.condition) {
        return;
      }

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
    toContext.fillStyle = 'rgba(255,255,255,0.3)';
    toContext.fillRect(0, 0, this.width, this.height);


    toContext.font = '48px Riffic';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';

    toContext.strokeStyle = '#333';
    toContext.fillStyle = '#333';
    toContext.textAlign = 'center';

    const txt = this.userHasWon ? 'Level Clear!' : 'Try Again!';
    toContext.fillText(txt, (this.width / 2) + (this.userHasWon ? 0 : -5), (this.height * 0.1) + (this.userHasWon ? 100 : 25));

    this.buttons.forEach(button => button.print(toContext));
  }
}

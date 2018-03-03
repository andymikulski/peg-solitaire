import { ServiceProvider, Service } from '../common/Provider';
import { GameClock } from '../game/GameClock';
import Emitter from '../common/Emitter';
import { Printable } from '../rendering/RenderingPipeline';

import { Button } from '../common/Button';
import VCR from '../rendering/VCR';
import { ISessionInfo } from '../main';
import { GameTimer } from './GameTimer';

export enum GameOverEvents {
  GO_HOME = 'go-home',
}

export default class GameOverScreen extends Emitter implements Printable {
  buttons: Button[] = [];

  opacity: number = 0;
  vcr: VCR;

  constructor(private width: number, private height: number) {
    super();
    this.vcr = new VCR(width, height);
  }

  updateInfo(info: ISessionInfo) {
    const {
      totalTime,
      totalScore,
      totalPegsRemaining,
      totalSlots,
    } = info;

    const totalPossible = (totalSlots + totalPegsRemaining - 1);
    const percentCleared = 1 - ((totalPegsRemaining - 1) / totalPossible);
    const didUserWin = percentCleared >= 0.75;

    this.buttons = [];
    this.createButtons(didUserWin);

    const ctx = this.vcr.getContext();
    ctx.fillStyle = 'rgba(236, 236, 236, 0.95)';
    ctx.fillRect(0, 0, this.width, this.height);


    ctx.font = '92px Dimbo';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.strokeStyle = '#474647';
    ctx.fillStyle = '#474647';
    ctx.textAlign = 'center';

    ctx.fillText('Game Over', (this.width / 2), 200);

    let txtPercent = (percentCleared * 100).toFixed(2);
    if (txtPercent.endsWith('.00')) {
      txtPercent = txtPercent.slice(0, -3);
    }

    const formattedTime = GameTimer.formatTime(totalTime);
    ctx.font = '48px Dimbo';
    const txtScoreInfo = `${txtPercent}% cleared • ${formattedTime} • ${totalScore} points`;
    ctx.fillText(txtScoreInfo, (this.width / 2), 325);


    ctx.font = '24px Dimbo';
    ctx.fillText(`Thank you for playing!`, (this.width / 2), 600 - 20);

    this.buttons.forEach(button => button.print(ctx));
  }

  // #todo this exact function is in like three places. The UI-centric views
  // should be abstracted so adding a button or two isn't such a pain.
  createButtons(didUserWin: boolean) {
    [{
      condition: didUserWin,
      label: 'Go Home',
      callback: () => this.emit(GameOverEvents.GO_HOME),
      x: 340,
      y: this.height * 0.67,
      width: 125,
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
    this.opacity = 0;
    (<GameClock>ServiceProvider.lookup(Service.CLOCK)).addBinding(this);
    this.buttons.forEach(x => x.enable());
  }

  detach() {
    this.vcr.clear();
    this.opacity = 0;
    (<GameClock>ServiceProvider.lookup(Service.CLOCK)).removeBinding(this);

    this.buttons.forEach(x => x.disable());
  }

  update(delta: number, elapsed: number) {
    this.opacity += (delta / 1000) * 2;
    this.opacity = Math.min(this.opacity, 1);
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.globalAlpha = this.opacity;
    toContext.drawImage(
      this.vcr.getCanvas(),
      0,
      0,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height,
    );
    toContext.globalAlpha = 1;
  }
}

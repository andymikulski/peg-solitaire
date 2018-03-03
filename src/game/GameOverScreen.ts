// import { ServiceProvider, Service } from '../common/Provider';
// import { GameClock } from '../game/GameClock';
// import Transform from '../common/Transform';
// import Emitter from '../common/Emitter';
// import { Printable } from '../rendering/RenderingPipeline';
// import InteractionLayer from '../input/InteractionLayer';

// import { Button } from '../common/Button';
// import VCR from '../rendering/VCR';
// import { IRoundInfo } from '../main';

// export enum GameOverEvents {
//   GO_HOME = 'go-home',
// };

// export default class GameOverScreen extends Emitter implements Printable {
//   buttons: Button[] = [];

//   opacity: number = 0;
//   vcr: VCR;

//   constructor(private width: number, private height: number) {
//     super();
//     this.vcr = new VCR(width, height);
//   }

//   setRoundInfo(info: IRoundInfo, levelScore: number) {
//     const { numPegsRemaining, numSlots } = info;

//     const totalPossible = (numSlots + numPegsRemaining - 1);
//     const percentCleared = 1 - ((numPegsRemaining - 1) / totalPossible);
//     const didUserWin = info.numPegsRemaining === 1 || percentCleared > 0.75;

//     this.buttons = [];
//     this.createButtons(didUserWin);

//     const ctx = this.vcr.getContext();
//     ctx.fillStyle = 'rgba(236, 236, 236, 1)';
//     ctx.fillRect(0, 0, this.width, this.height);


//     ctx.font = '92px Dimbo';
//     ctx.lineWidth = 2;
//     ctx.lineCap = 'round';

//     ctx.strokeStyle = '#474647';
//     ctx.fillStyle = '#474647';
//     ctx.textAlign = 'center';

//     // Placing text manually!
//     const txtHeader = didUserWin ? 'Level Passed' : 'Level Failed';
//     ctx.fillText(txtHeader, (this.width / 2) + (didUserWin ? 0 : -5), 200);

//     let txtPercent = (percentCleared * 100).toFixed(2);
//     if (txtPercent.endsWith('.00')) {
//       txtPercent = txtPercent.slice(0, -3);
//     }

//     ctx.font = '48px Dimbo';
//     const txtScoreInfo = `${txtPercent}% cleared • ${levelScore} points`;
//     ctx.fillText(txtScoreInfo, (this.width / 2) + (didUserWin ? 0 : -5), 325);

//     ctx.font = '24px Dimbo';
//     if (!didUserWin) {
//       ctx.fillText(`(You need 75% to advance to the next level)`, (this.width / 2) + (didUserWin ? 0 : -5), 375);
//     }


//     this.buttons.forEach(button => button.print(ctx));
//   }

//   createButtons(didUserWin: boolean) {
//     [{
//       condition: didUserWin,
//       label: 'Next Level',
//       callback: () => this.emit(InterstitialEvents.NEXT_LEVEL),
//       x: this.width - (165 + 100),
//       y: this.height * 0.75,
//       width: 165,
//       height: 48,
//     }, {
//       condition: true,
//       label: didUserWin ? 'Play Again' : 'Retry',
//       callback: () => this.emit(InterstitialEvents.RESTART_CURRENT),
//       x: didUserWin ? 125 : 345,
//       y: this.height * 0.75,
//       width: didUserWin ? 50 : 90,
//       height: didUserWin ? 32 : 48,
//     }].forEach(buttonConfig => {
//       if (!buttonConfig.condition) {
//         return;
//       }

//       let butt = new Button(buttonConfig.label, buttonConfig.callback);
//       butt.position[0] = buttonConfig.x;
//       butt.position[1] = buttonConfig.y;
//       butt.width = buttonConfig.width;
//       butt.height = buttonConfig.height;
//       this.buttons.push(butt);
//     });
//   }

//   attach() {
//     this.opacity = 0;
//     (<GameClock>ServiceProvider.lookup(Service.CLOCK)).addBinding(this);

//     this.buttons.forEach(x => x.enable());
//   }

//   detach() {
//     this.vcr.clear();
//     this.opacity = 0;
//     (<GameClock>ServiceProvider.lookup(Service.CLOCK)).removeBinding(this);

//     this.buttons.forEach(x => x.disable());
//   }

//   update(delta: number, elapsed: number) {
//     this.opacity += (delta / 1000) * 2;
//     this.opacity = Math.min(this.opacity, 1);
//   }

//   print(toContext: CanvasRenderingContext2D) {
//     toContext.globalAlpha = this.opacity;
//     toContext.drawImage(
//       this.vcr.getCanvas(),
//       0,
//       0,
//       this.width,
//       this.height,
//       0,
//       0,
//       this.width,
//       this.height,
//     );
//     toContext.globalAlpha = 1;
//   }
// }

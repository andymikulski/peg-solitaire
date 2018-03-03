import { ServiceProvider, Service } from '../common/Provider';
import { GameClock } from '../game/GameClock';
import Transform from '../common/Transform';
import Emitter from '../common/Emitter';
import { Printable } from '../rendering/RenderingPipeline';

export default class FloatingText extends Transform implements Printable {
  timeStart: number;
  percentDone: number = 0;
  originalOffset: number[];
  opacity: number = 0;

  constructor(public label: string, private size: number, private origin: number[], private amount: number, private durationMs: number) {
    super();
    this.position = [].concat(origin);
    this.originalOffset = [].concat(origin);
    <GameClock>ServiceProvider.lookup(Service.CLOCK).addBinding(this);
    <GameClock>ServiceProvider.lookup(Service.PIPELINE).addRenderer(this, 0);
  }

  update(delta: number, elapsed: number) {
    this.timeStart = this.timeStart || elapsed;
    const timeElapsed = (elapsed - this.timeStart) * 1000;

    this.percentDone = 1 - (timeElapsed / this.durationMs);
    this.position[1] = this.originalOffset[1] + (this.amount * this.percentDone);

    if (timeElapsed >= this.durationMs) {
      <GameClock>ServiceProvider.lookup(Service.CLOCK).removeBinding(this);
      <GameClock>ServiceProvider.lookup(Service.PIPELINE).removeRenderer(this);
    }
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.globalCompositeOperation = 'difference';
    toContext.font = `${this.size}px Dimbo`;
    toContext.lineWidth = 1;
    toContext.lineCap = 'round';
    toContext.textAlign = 'center';
    toContext.fillStyle = `rgba(71, 70, 71, ${this.percentDone})`;
    toContext.fillText(this.label, this.position[0], this.position[1]);

    toContext.globalCompositeOperation = 'source-atop';
  }
}
import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { ServiceProvider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';

export default class ScoreDisplay extends Transform implements Printable {
  elapsed: number = 0;

  public points: number = 0;

  formatTime(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;


    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  enable() {
    ServiceProvider.lookup(Service.CLOCK).addBinding(this);
  }
  disable() {
    ServiceProvider.lookup(Service.CLOCK).removeBinding(this);
  }

  update(delta: number, elapsed: number) {
    this.elapsed = Math.floor(elapsed);
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.font = '48px Riffic';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';
    const pointsLabel = this.points.toString();
    const labelWidth = toContext.measureText(pointsLabel);
    const offset = labelWidth.width + 25;

    toContext.fillStyle = '#333';
    const timeString = this.formatTime(this.elapsed);
    // toContext.fillText(`0:0${this.elapsed}`, this.position[0], this.position[1]);
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] - 4);
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] + 4);
    toContext.fillText(pointsLabel, (this.position[0] - offset) + 1, this.position[1]);
    toContext.fillText(pointsLabel, (this.position[0] - offset) - 1, this.position[1]);

    toContext.fillStyle = 'white';
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] - 2);
  }
}

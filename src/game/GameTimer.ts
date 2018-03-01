import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { Provider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';

export class GameTimer extends Transform implements Printable {
  elapsed: number;

  formatTime(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;


    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  update(delta: number, elapsed: number) {
    this.elapsed = Math.floor(elapsed);
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.font = '48px Bubblegum';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';

    toContext.fillStyle = '#333';
    const timeString = this.formatTime(this.elapsed);
    // toContext.fillText(`0:0${this.elapsed}`, this.position[0], this.position[1]);
    toContext.fillText(timeString, this.position[0], this.position[1] - 4);
    toContext.fillText(timeString, this.position[0], this.position[1] + 4);
    toContext.fillText(timeString, this.position[0] + 1, this.position[1]);
    toContext.fillText(timeString, this.position[0] - 1, this.position[1]);

    toContext.fillStyle = 'white';
    toContext.fillText(timeString, this.position[0], this.position[1] - 2);
  }
}

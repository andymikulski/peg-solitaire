import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { ServiceProvider, Service } from '../common/Provider';

export class GameTimer extends Transform implements Printable {
  elapsed: number = 0;
  elapsedStart: number = null;
  isEnabled: boolean = false;

  formatTime(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;


    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  enable() {
    ServiceProvider.lookup(Service.CLOCK).addBinding(this);
    this.isEnabled = true;
    this.resetTime();
  }
  disable() {
    ServiceProvider.lookup(Service.CLOCK).removeBinding(this);
    this.isEnabled = false;
  }

  resetTime() {
    this.elapsed = 0;
    this.elapsedStart = null;
  }

  update(delta: number, elapsed: number) {
    if (!this.elapsedStart) {
      this.elapsedStart = elapsed;
    } else {
      this.elapsed = Math.floor(elapsed - this.elapsedStart);
    }
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.font = '48px Riffic';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';

    toContext.fillStyle = '#474647';
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

import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { ServiceProvider, Service } from '../common/Provider';

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

    toContext.fillStyle = '#474647';
    // Using a heavy stroke results in sharp artifacts, so just reposition the text
    // and print it a few times.
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] - 4);
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] + 4);
    toContext.fillText(pointsLabel, (this.position[0] - offset) + 1, this.position[1]);
    toContext.fillText(pointsLabel, (this.position[0] - offset) - 1, this.position[1]);

    toContext.fillStyle = 'white';
    toContext.fillText(pointsLabel, (this.position[0] - offset), this.position[1] - 2);
  }
}

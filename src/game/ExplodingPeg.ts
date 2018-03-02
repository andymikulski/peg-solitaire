import Transform from '../common/Transform';
import Peg from './Peg';
import { ServiceProvider, Service } from '../common/Provider';

export default class ExplodingPeg extends Peg {
  opacity: number = 1;
  isEnabled: boolean = false;
  startTime: number;

  constructor(width: number, height: number) {
    super(width, height);

    ServiceProvider.lookup(Service.CLOCK).addBinding(this);
  }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    super.print.apply(this, [toContext, offset]);

    toContext.globalCompositeOperation = 'source-atop';

    // toContext.shadowColor = 'hsl(1.1, 100%, 27.8%)';
    // toContext.shadowOffsetX = 2;
    // toContext.shadowOffsetY = 2;
    // toContext.shadowBlur = 1;
    toContext.fillStyle = `hsla(1.1, 100%, 57.8%, ${this.opacity - 0.5})`;

    // toContext.fillStyle = `rgba(255,0,0,  ${this.opacity + 0.5})`;
    toContext.fillRect(offset.position[0] + this.position[0] - Peg.renderPadding,
      offset.position[1] + this.position[1] - Peg.renderPadding, this.width + (Peg.renderPadding * 2), this.height + (Peg.renderPadding * 2));

    toContext.globalCompositeOperation = 'source-over';
  }

  update(delta: number, elapsed: number) {
    if (!this.startTime) {
      this.startTime = elapsed;
    }

    let speed = 3;

    // if (elapsed - this.startTime > 15) {
    //   speed = (elapsed - this.startTime) * 0.2;
    // }
    this.opacity = Math.sin(elapsed * speed) + 1;

  }

  onClick() { }
  onMouseEnter() { }
  onMouseLeave() { }
}

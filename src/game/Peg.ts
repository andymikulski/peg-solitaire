import VCR from '../rendering/VCR';
import { Provider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Peg extends Transform implements Printable, IInteractable {
  public isSelected: boolean = false;
  private opacity: number;
  private dir: number;

  constructor() {
    super();
    this.dir = Math.random() > 0.5 ? 1 : -1;
    this.opacity = Math.random();
  }

  update(delta: number) {
    if (this.opacity <= 0 || this.opacity >= 1) {
      this.dir *= -1;
      this.opacity = Math.min(Math.max(0, this.opacity), 1);
    }
    this.opacity += delta * this.dir;
  }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    toContext.fillStyle = !this.isSelected ? `rgba(255,0,0,${this.opacity})` : 'blue';
    toContext.fillRect(offset.position[0] + this.position[0], offset.position[1] + this.position[1], this.width, this.height);
  }

  onClick() { }
  onMouseDown() { }
  onMouseMove() { }
  onMouseUp() { }
  onRightClick() { }
}

import VCR from '../rendering/VCR';
import { Provider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Slot extends Transform implements Printable, IInteractable {
  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    toContext.fillStyle = 'green';
    toContext.fillRect(offset.position[0] + this.position[0], offset.position[1] + this.position[1], this.width, this.height);
  }

  onClick() {
    console.log('slot was clicked');
  }
}

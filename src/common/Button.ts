import Transform from "./Transform";
import { Printable } from '../rendering/RenderingPipeline';
import { ServiceProvider, Service } from "./Provider";
import InteractionLayer from "../input/InteractionLayer";

export class Button extends Transform implements Printable {
  constructor(private label: string, private onClickHandler: Function) {
    super();
  }

  enable() {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).register(this);
  }

  disable() {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).unregister(this);
  }

  onClick() {
    this.onClickHandler();
  }

  print(toContext: CanvasRenderingContext2D) {
    toContext.fillStyle = 'rgba(0,0,0,0.3)';
    toContext.fillRect(this.position[0], this.position[1], this.width, this.height)

    toContext.font = '48px Dimbo';
    toContext.lineWidth = 2;
    toContext.lineCap = 'round';
    toContext.textAlign = 'left';
    toContext.fillStyle = '#333';
    toContext.fillText(this.label, this.position[0], this.position[1] + 48); // - (this.width / 2), this.position[1] + 48);
  }
}
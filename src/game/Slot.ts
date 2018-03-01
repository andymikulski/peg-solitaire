import VCR from '../rendering/VCR';
import { Provider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Slot extends Transform implements Printable, IInteractable {
  public x: number;
  public y: number;

  static Prerender: CanvasRenderingContext2D;

  constructor(public width: number, public height: number) {
    super();

    if (!Slot.Prerender) {
      const vcr = new VCR(this.width, this.height);
      const ctx = vcr.getContext();

      ctx.fillStyle = '#ffbc42';
      ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);

      // ctx.arc(offset.position[0] + this.position[0] + (this.width / 2), offset.position[1] + this.position[1] + (this.height / 2), this.width / 2, 0, Math.PI * 2);

      ctx.fill();


      ctx.globalCompositeOperation = 'source-atop';

      ctx.shadowOffsetX = 500;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(30,30,30,1)';

      ctx.beginPath();
      ctx.arc(this.width / 2, (this.height / 2), this.width / 2, Math.PI, Math.PI * 2);
      ctx.fill();

      Slot.Prerender = ctx;
    }
  }

  update(delta: number, elapsed: number) { }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    toContext.drawImage(
      Slot.Prerender.canvas,
      0,
      0,
      this.width,
      this.height,
      offset.position[0] + this.position[0],
      offset.position[1] + this.position[1],
      this.width,
      this.height,
    );
  }

  onClick() { }
}

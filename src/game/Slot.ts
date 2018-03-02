import VCR from '../rendering/VCR';
import { ServiceProvider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Slot extends Transform implements Printable, IInteractable {
  public x: number;
  public y: number;

  static Prerender: CanvasRenderingContext2D;
  static FocusPrerender: CanvasRenderingContext2D;

  public isFocused: boolean = false;

  constructor(public width: number, public height: number) {
    super();

    if (!Slot.Prerender) {
      const vcr = new VCR(this.width + (this.width / 2), this.height + (this.height / 2));
      let ctx = vcr.getContext('prerender');

      ctx.beginPath();
      ctx.fillStyle = 'hsl(38.7, 0%, 82.9%)';
      ctx.arc(this.width / 2, (this.height / 2), this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(this.width / 2, (this.height / 2), this.width * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      // ctx.stroke();
      ctx.closePath();

      Slot.Prerender = ctx;

      // Focus Prerender
      ctx = vcr.getContext('focus');

      ctx.beginPath();
      ctx.fillStyle = 'hsl(38.7, 100%, 72.9%)';
      ctx.strokeStyle = 'hsla(38.7, 0%, 42.9%, 0.2)';
      ctx.arc(this.width / 2, (this.height / 2), this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(this.width / 2, (this.height / 2), this.width * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.fill();
      ctx.closePath();

      Slot.FocusPrerender = ctx;
    }
  }

  update(delta: number, elapsed: number) { }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    toContext.drawImage(
      this.isFocused ? Slot.FocusPrerender.canvas : Slot.Prerender.canvas,
      0,
      0,
      this.width,
      this.height,
      offset.position[0] + this.position[0] + (this.width / 8),
      offset.position[1] + this.position[1] + (this.width / 8),
      this.width,
      this.height,
    );


  }

  onClick() { }
}

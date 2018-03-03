import VCR from '../rendering/VCR';
import { ServiceProvider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Peg extends Transform implements Printable, IInteractable {
  static SelectPrerender: CanvasRenderingContext2D;
  static InactivePrerender: CanvasRenderingContext2D;
  static VCR: VCR;

  static clearRenderCache() {
    Peg.VCR && Peg.VCR.clear();
    Peg.VCR && Peg.VCR.free();
    Peg.SelectPrerender = null;
    Peg.InactivePrerender = null;
  }

  // Padding to allow room for drop shadow (should probably _not_ be hardcoded)
  static renderPadding: number = 10;

  public isEnabled: boolean = true;

  // Game board coordinates (_not_ display coords)
  public x: number;
  public y: number;

  // Is this peg in the 'selected' state? (for display purpsoses)
  public isSelected: boolean = false;
  private isHovered: boolean = false;


  public health: number = 1;


  constructor(public width: number, public height: number) {
    super();

    if (!Peg.SelectPrerender) {
      const padding = this.width / 4;

      Peg.VCR = new VCR(this.width + (padding * 2), this.height + (padding * 2));
      this.prerenderSelected();
      this.prerenderInactive();
    }
  }

  protected prerenderSelected() {
    Peg.SelectPrerender = Peg.VCR.getContext('select');
    const ctx = Peg.SelectPrerender;

    ctx.shadowColor = 'hsla(75.9, 96.2%, 20.8%, 0.6)';
    ctx.shadowOffsetX = this.width / 20;
    ctx.shadowOffsetY = this.height / 20;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#97cc04';

    ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  protected prerenderInactive() {
    Peg.InactivePrerender = Peg.VCR.getContext('inactive');
    const ctx = Peg.InactivePrerender;

    ctx.shadowColor = 'rgba(0, 107, 166, 0.8)';
    ctx.shadowOffsetX = this.width / 10;
    ctx.shadowOffsetY = this.height / 10;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0496ff';

    ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  update(delta: number, elapsed: number) { }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    const preRender = this.isSelected ? Peg.SelectPrerender : Peg.InactivePrerender;
    if (this.isHovered) {
      toContext.globalAlpha = 0;
    }

    const padding = this.width / 4;

    toContext.drawImage(
      preRender.canvas,
      0,
      0,
      this.width + padding,
      this.height + padding,
      offset.position[0] + this.position[0],
      offset.position[1] + this.position[1],
      this.width + padding,
      this.height + padding,
    );

    if (this.health <= 1) {
      return;
    }

    toContext.font = `${this.width / 2}px Dimbo`;
    toContext.fillStyle = 'white';
    toContext.strokeStyle = 'rgba(100,100,100,0.5)';

    // toContext.strokeText(
    //   this.health.toString(),
    //   (this.width / 10) + (this.width / 2) + offset.position[0] + this.position[0],
    //   11 + (this.height / 2) + offset.position[1] + this.position[1]
    // );
    toContext.fillText(
      this.health.toString(),
      (this.width * -0.1) + (this.width / 2) + offset.position[0] + this.position[0],
      (this.height * 0.225) + (this.height / 2) + offset.position[1] + this.position[1]
    );

  }

  onClick() { }
  onMouseEnter() {
    this.isHovered = true;
  }
  onMouseLeave() {
    this.isHovered = false;
  }
}

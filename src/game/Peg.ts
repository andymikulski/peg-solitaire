import VCR from '../rendering/VCR';
import { Provider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import { IInteractable } from '../input/InteractionLayer';

export default class Peg extends Transform implements Printable, IInteractable {
  public isSelected: boolean = false;
  static SelectPrerender: CanvasRenderingContext2D;
  static InactivePrerender: CanvasRenderingContext2D;
  static VCR: VCR;

  static renderPadding: number = 5;

  public x: number;
  public y: number;

  constructor(public width: number, public height: number) {
    super();

    if (!Peg.SelectPrerender) {
      Peg.VCR = new VCR(this.width + (Peg.renderPadding * 2), this.height + (Peg.renderPadding * 2));
      this.prerenderSelected();
      this.prerenderInactive();
    }
  }

  private prerenderSelected() {
    Peg.SelectPrerender = Peg.VCR.getContext('select');
    const ctx = Peg.SelectPrerender;

    ctx.shadowColor = 'hsl(1.1, 100%, 27.8%)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 1;
    ctx.fillStyle = '#ff5e5b';

    ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private prerenderInactive() {
    Peg.InactivePrerender = Peg.VCR.getContext('inactive');
    const ctx = Peg.InactivePrerender;

    ctx.shadowColor = 'rgba(0, 107, 166, 1)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 1;
    ctx.fillStyle = '#0496ff';

    ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

  }

  print(toContext: CanvasRenderingContext2D, offset: Transform) {
    const preRender = this.isSelected ? Peg.SelectPrerender : Peg.InactivePrerender;

    toContext.drawImage(
      preRender.canvas,
      0,
      0,
      this.width + (Peg.renderPadding / 2),
      this.height + (Peg.renderPadding / 2),
      offset.position[0] + this.position[0],
      offset.position[1] + this.position[1],
      this.width + (Peg.renderPadding / 2),
      this.height + (Peg.renderPadding / 2),
    );

  }

  onClick() { }
  onMouseDown() { }
  onMouseMove() { }
  onMouseUp() { }
  onRightClick() { }
}

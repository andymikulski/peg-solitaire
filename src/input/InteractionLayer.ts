import ElementEventHandler, { MOUSE_EVENT } from './ElementEventHandler';
import { Provider, Service } from '../common/Provider';
import RenderingPipeline, { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';

export interface IInteractable {
  onClick?: Function;
  onRightClick?: Function;
  onMouseDown?: Function;
  onMouseMove?: Function;
  onMouseUp?: Function;
}

export default class InteractionLayer {
  handler: ElementEventHandler;
  renderingCanvas: HTMLCanvasElement;
  trackedInteractables: Transform[] = [];
  trackedOffsets: Transform[] = [];
  pipeline: RenderingPipeline;

  constructor() {
    Provider.register(Service.UI, this);
    this.pipeline = Provider.lookup(Service.PIPELINE);

    const canvas = this.pipeline.getCanvas();


    this.renderingCanvas = this.pipeline.getCanvas();
    this.handler = new ElementEventHandler(this.renderingCanvas);

    this.handler.on(MOUSE_EVENT.UP, this.onMouseUp.bind(this));
    this.handler.on(MOUSE_EVENT.DOWN, this.onMouseDown.bind(this));
    this.handler.on(MOUSE_EVENT.CLICK, this.onClick.bind(this));
    this.handler.on(MOUSE_EVENT.R_CLICK, this.onRightClick.bind(this));
    this.handler.on(MOUSE_EVENT.MOVE, this.onMouseMove.bind(this));
  }

  getMouseEventCoords(evt: MouseEvent) {
    const widthRatio = this.renderingCanvas.width / this.renderingCanvas.offsetWidth;
    const heightRatio = this.renderingCanvas.height / this.renderingCanvas.offsetHeight;

    const mouseX = widthRatio * (evt.x - this.renderingCanvas.offsetLeft);
    const mouseY = heightRatio * (evt.y - this.renderingCanvas.offsetTop);

    return [mouseX, mouseY];
  }

  getEntitesAtEvent(evt: MouseEvent) {
    return this.getEntityAtPos.apply(this, this.getMouseEventCoords(evt));
  }


  onMouseMove(evt: MouseEvent) {
    const ent = this.getEntitesAtEvent(evt);
    ent && ent.onMouseMove && ent.onMouseMove(evt);
  }

  onRightClick(evt: MouseEvent) {
    const ent = this.getEntitesAtEvent(evt);
    ent && ent.onRightClick && ent.onRightClick(evt);
  }

  onMouseDown(evt: MouseEvent) {
    const ent = this.getEntitesAtEvent(evt);
    ent && ent.onMouseDown && ent.onMouseDown(evt);
  }

  onMouseUp(evt: MouseEvent) {
    const ent = this.getEntitesAtEvent(evt);
    ent && ent.onMouseUp && ent.onMouseUp(evt);
  }

  onClick(evt: MouseEvent) {
    const ent = this.getEntitesAtEvent(evt);
    ent && ent.onClick && ent.onClick(evt);
  }

  getEntityAtPos(mouseX: number, mouseY: number): IInteractable {
    let offset;
    let found = this.trackedInteractables.filter((obj, idx) => {
      offset = this.trackedOffsets[idx];
      const xMin = obj.position[0] + offset.position[0];
      const xMax = obj.position[0] + obj.width + offset.position[0];
      const yMin = obj.position[1] + offset.position[1];
      const yMax = obj.position[1] + obj.height + offset.position[1];

      return (mouseX >= xMin && mouseX <= xMax && mouseY >= yMin && mouseY <= yMax);
    });

    // if (found.length > 1) {
    //   // get topmost thing via getLayerForRenderer
    // } else {
    //   const entity: any = found[0];
    // }

    return <any>found[0];
  }

  register(thing: Transform, offset?: Transform) {
    this.trackedInteractables.push(thing);
    this.trackedOffsets.push(offset);
  }
}
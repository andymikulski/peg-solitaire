import Transform from '../common/Transform';
import VCR from './VCR';


export interface IRenderer {
    getContext(name?: string): CanvasRenderingContext2D;
    getCanvas(name?: string): HTMLCanvasElement;
    free(name?: string): void;
}

export interface Printable {
    print(toContext: CanvasRenderingContext2D, offset?: Transform): void;
}

export default class RenderingPipeline {
    private renderers: Printable[] = [];

    private outputContext: CanvasRenderingContext2D;
    private outputCanvas: HTMLCanvasElement;

    constructor(width: number, height: number) {
        const output = new VCR(width, height);

        this.outputCanvas = output.getCanvas();
        this.outputContext = output.getContext();

        this.tick();
    }

    private tick() {
        this.renderAll();
        requestAnimationFrame(this.tick.bind(this));
    }


    private renderAll(): void {
        const all: any[] = this.renderers;

        this.outputContext.clearRect(0, 0, this.outputContext.canvas.width, this.outputContext.canvas.height);

        let i = all.length - 1;
        while (i >= 0) {
            // Use .save/.restore to prevent pipelined renderers from leaking
            // styles outside their `print`.
            this.outputContext.save();
            all[i].print(this.outputContext);
            this.outputContext.rotate(-all[i].rotation);
            this.outputContext.restore();
            i -= 1;
        }
    }

    public setBackground(color: string) {
        this.outputCanvas.style.background = color;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.outputCanvas;
    }

    public addRenderer(renderer: Printable, layer?: number): void {
        if (typeof layer === 'undefined') {
            this.renderers.push(renderer);
        } else {
            this.renderers.splice(layer, 0, renderer);
        }
    }

    public removeRenderer(renderer: Printable) {
        this.renderers = this.renderers.filter(x => x !== renderer);
    }

    public getLayerForRenderer(renderer: Printable) {
        let i = 0;
        while (i < this.renderers.length) {
            if (this.renderers[i] === renderer) {
                return i;
            }
            i += 1;
        }
        return -1;
    }

    public clear(): void {
        this.renderers = [];
    }
}

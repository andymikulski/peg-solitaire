interface IRenderer {
  getContext(name?: string): CanvasRenderingContext2D;
  getCanvas(name?: string): HTMLCanvasElement;
  free(name?: string): void;
}

export default IRenderer;
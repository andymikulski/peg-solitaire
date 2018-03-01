import RenderingPipeline, { Printable } from './rendering/RenderingPipeline';
import VCR from './rendering/VCR';
import EntityManager from './EntityManager';
import { TriangleGameBoard } from './game/GameBoard';
import { Provider, Service } from './common/Provider';
import InteractionLayer from './input/InteractionLayer';

class PegSolitaire {
  pipeline: RenderingPipeline;
  entityMan: EntityManager;
  unitSize: number;
  startTime: number;
  lastTime: number;

  gameBoard: TriangleGameBoard;

  constructor() {
    this.pipeline = new RenderingPipeline(800, 600);
    Provider.register(Service.PIPELINE, this.pipeline);

    this.pipeline.setBackground('#ececec');

    new InteractionLayer();
    this.gameBoard = new TriangleGameBoard(10);

    this.gameBoard.position = [200, 75];

    this.pipeline.addRenderer(this.gameBoard);

    document.body.innerHTML = '';
    document.body.appendChild(this.pipeline.getCanvas());

    this.startTime = Date.now();
    this.lastTime = Date.now();
    this.gameLoop();
  }

  gameLoop() {
    const delta = (Date.now() - this.lastTime) / 1000;

    // logic
    this.gameBoard.update(delta);

    requestAnimationFrame(this.gameLoop.bind(this));
    this.lastTime = Date.now();
  }

}


new PegSolitaire();
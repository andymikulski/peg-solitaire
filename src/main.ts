import RenderingPipeline, { Printable } from './rendering/RenderingPipeline';
import VCR from './rendering/VCR';
import EntityManager from './EntityManager';
import GameBoard from './game/GameBoard';
import TriangleGameBoard from './game/TriangleBoard';
import { Provider, Service } from './common/Provider';
import InteractionLayer from './input/InteractionLayer';
import { GameTimer } from './game/GameTimer';

class PegSolitaire {
  pipeline: RenderingPipeline;
  entityMan: EntityManager;
  unitSize: number;
  startTime: number;
  lastTime: number;
  gameTimer: GameTimer;

  gameBoard: GameBoard;

  constructor() {
    this.pipeline = new RenderingPipeline(800, 600);
    Provider.register(Service.PIPELINE, this.pipeline);

    this.pipeline.setBackground('#ececec');

    new InteractionLayer();
    const count = 5;
    this.gameBoard = new TriangleGameBoard(count);

    this.pipeline.addRenderer(this.gameBoard);

    document.body.innerHTML = '';
    document.body.appendChild(this.pipeline.getCanvas());

    this.startTime = Date.now();
    this.lastTime = Date.now();

    this.gameTimer = new GameTimer();
    this.gameTimer.position[0] = 25;
    this.gameTimer.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.gameTimer);

    this.gameLoop();
  }

  gameLoop() {
    const delta = (Date.now() - this.lastTime) / 1000;
    const elapsed = (Date.now() - this.startTime) / 1000;

    // logic
    this.gameTimer.update(delta, elapsed);

    requestAnimationFrame(this.gameLoop.bind(this));
    this.lastTime = Date.now();
  }

}


new PegSolitaire();
import RenderingPipeline, { Printable } from './rendering/RenderingPipeline';
import VCR from './rendering/VCR';
import GameBoard from './game/GameBoard';
import TriangleGameBoard from './game/TriangleBoard';
import { Provider, Service } from './common/Provider';
import InteractionLayer from './input/InteractionLayer';
import { GameTimer } from './game/GameTimer';
import SoundManager from './sounds/SoundManager';

// Only external lib used!
import * as Random from 'random-js';
const RandService = new Random(Random.engines.mt19937().seed(123));

class PegSolitaire {
  pipeline: RenderingPipeline;

  unitSize: number;
  startTime: number;
  lastTime: number;
  gameTimer: GameTimer;

  gameBoard: GameBoard;

  constructor() {
    this.pipeline = new RenderingPipeline(800, 600);
    Provider.register(Service.PIPELINE, this.pipeline);

    this.pipeline.setBackground('#ececec');

    const ui = new InteractionLayer();
    Provider.register(Service.UI, ui);

    Provider.register(Service.RNG, RandService);

    const sound = new SoundManager();
    Provider.register(Service.SOUND, sound);

    sound.load({
      'music': 'sounds/xerxes.mp3',
      'deny': 'sounds/cant-move.wav',
      'peg-move': 'sounds/peg-land.wav',
      'peg-remove': 'sounds/peg-removed.wav',
      'peg-select': 'sounds/peg-select.wav',
    });

    // sound.play('music');


    document.body.innerHTML = '';
    document.body.appendChild(this.pipeline.getCanvas());

    this.startGame();
  }

  startGame() {
    const count = 6;
    this.gameBoard = new TriangleGameBoard(count);

    this.pipeline.addRenderer(this.gameBoard);
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
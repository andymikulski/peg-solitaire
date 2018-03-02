import RenderingPipeline, { Printable } from './rendering/RenderingPipeline';
import VCR from './rendering/VCR';
import GameBoard from './game/GameBoard';
import SquareGameBoard from './game/SquareBoard';
import TriangleGameBoard from './game/TriangleBoard';
import { ServiceProvider, Service } from './common/Provider';
import InteractionLayer from './input/InteractionLayer';
import { GameTimer } from './game/GameTimer';
import SoundManager from './sounds/SoundManager';
import provideRNG from './common/RNG';

class PegSolitaire {
  pipeline: RenderingPipeline;

  unitSize: number;
  startTime: number;
  lastTime: number;
  gameTimer: GameTimer;

  gameBoard: GameBoard;

  constructor() {
    this.pipeline = new RenderingPipeline(800, 600);
    ServiceProvider.register(Service.PIPELINE, this.pipeline);

    this.pipeline.setBackground('#ececec');

    const ui = new InteractionLayer();
    ServiceProvider.register(Service.UI, ui);
    ServiceProvider.register(Service.RNG, provideRNG('silly string'));

    const sound = new SoundManager();
    ServiceProvider.register(Service.SOUND, sound);

    const cachebust = Date.now();
    sound.load({
      'music': `sounds/xerxes.mp3?${cachebust}`,
      'boom': `sounds/boom3.wav?${cachebust}`,
      'deny': `sounds/cant-move.wav?${cachebust}`,
      'peg-move': `sounds/peg-land-2.wav?${cachebust}`,
      'peg-remove': `sounds/peg-removed.wav?${cachebust}`,
      'peg-select': `sounds/peg-select.wav?${cachebust}`,
    });

    sound.play('music');
    sound.setSoundVolume('music', 0.75);


    document.body.innerHTML = '';
    document.body.appendChild(this.pipeline.getCanvas());

    this.startGame();
  }

  startGame() {
    const count = 6;

    this.gameBoard = new (Math.random() > 2 ? TriangleGameBoard : SquareGameBoard)(count);

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
    this.gameBoard.update(delta, elapsed);

    requestAnimationFrame(this.gameLoop.bind(this));
    this.lastTime = Date.now();
  }

}


new PegSolitaire();
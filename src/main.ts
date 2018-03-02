import RenderingPipeline, { Printable } from './rendering/RenderingPipeline';
import VCR from './rendering/VCR';
import GameBoard, { GAME_EVENTS } from './game/GameBoard';
import SquareGameBoard from './game/SquareBoard';
import TriangleGameBoard from './game/TriangleBoard';
import { ServiceProvider, Service } from './common/Provider';
import InteractionLayer from './input/InteractionLayer';
import { GameTimer } from './game/GameTimer';
import SoundManager from './sounds/SoundManager';
import provideRNG from './common/RNG';
import AssetManager, { GameSounds } from './AssetManager';
import SplashScreen from './game/SplashScreen';
import { GameClock } from './game/GameClock';
import Peg from './game/Peg';
import Slot from './game/Slot';

import LevelData from './levels';

class PegSolitaire {
  pipeline: RenderingPipeline;

  unitSize: number;
  gameTimer: GameTimer;

  gameBoard: GameBoard;

  constructor() {
    document.body.innerHTML = '';
    this.pipeline = new RenderingPipeline(800, 600);
    this.pipeline.setBackground('#ececec');
    ServiceProvider.register(Service.PIPELINE, this.pipeline);

    this.registerServices();

    const assMan = new AssetManager();
    assMan.loadAssets();

    document.body.appendChild(this.pipeline.getCanvas());

    // this.pipeline.addRenderer(new SplashScreen(800, 600));
    this.startGame();


    // const sound = ServiceProvider.lookup(Service.SOUND);
    // sound.play(GameSounds.MUSIC);
    // sound.setSoundVolume('music', 0.65);
  }

  registerServices() {
    ServiceProvider.register(Service.RNG, provideRNG('silly string'));
    ServiceProvider.register(Service.UI, new InteractionLayer());
    ServiceProvider.register(Service.CLOCK, new GameClock());
  }

  startGame() {
    this.gameTimer = new GameTimer();
    this.gameTimer.position[0] = 25;
    this.gameTimer.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.gameTimer);

    const nextMap = () => {
      if (this.gameBoard) {
        this.gameBoard.cleanupGame();
        this.pipeline.removeRenderer(this.gameBoard);
      }

      // Need to clear the cache so pegs can redraw at the proper size
      Peg.clearRenderCache();
      Slot.clearRenderCache();

      const nextLevel = LevelData.shift();


      ServiceProvider.unregister(Service.RNG);
      ServiceProvider.register(Service.RNG, provideRNG(nextLevel.seed))

      const { board } = nextLevel;
      this.gameBoard = new board(nextLevel);
      this.pipeline.addRenderer(this.gameBoard);
      this.gameBoard.on(GAME_EVENTS.LOSE, () => {
        this.gameBoard.disableAllPegs();
        this.gameTimer.disable();
        setTimeout(nextMap.bind(this), 5000);
      });
      this.gameBoard.on(GAME_EVENTS.WIN, () => {
        this.gameBoard.disableAllPegs();
        this.gameTimer.disable();
        setTimeout(nextMap.bind(this), 5000);
      });
      ServiceProvider.lookup(Service.CLOCK).start();
      this.gameTimer.enable();
    };


    nextMap();
  }
}


new PegSolitaire();
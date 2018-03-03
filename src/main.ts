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
import SplashScreen, { SplashScreenEvents } from './game/SplashScreen';
import { GameClock } from './game/GameClock';
import Peg from './game/Peg';
import Slot from './game/Slot';

import LevelData from './levels';
import InterstitialScreen, { InterstitialEvents } from './game/Interstitial';
import ScoreDisplay from './game/ScoreDisplay';


export interface IGameInfo {
  numSlots: number;
  numPegsRemaining: number;
}

class PegSolitaire {
  pipeline: RenderingPipeline;

  unitSize: number;
  gameTimer: GameTimer;
  scoreDisplay: ScoreDisplay;

  gameBoard: GameBoard;
  splash: SplashScreen;
  interstitial: InterstitialScreen;

  currentLevel: number = 1;
  levelScore: number = 0;
  totalScore: number = 0;

  constructor() {
    document.body.innerHTML = '';
    this.pipeline = new RenderingPipeline(800, 600);
    this.pipeline.setBackground('#ececec');
    ServiceProvider.register(Service.PIPELINE, this.pipeline);

    this.registerCommonServices();

    const assetMan = new AssetManager();
    assetMan.loadAssets();

    document.body.appendChild(this.pipeline.getCanvas());

    this.startBGMusic();
    // this.gotoSplashScreen();
    this.startGame();
  }

  registerCommonServices() {
    ServiceProvider.register(Service.RNG, provideRNG('silly string'));
    ServiceProvider.register(Service.UI, new InteractionLayer());
    ServiceProvider.register(Service.CLOCK, new GameClock());
  }

  gotoSplashScreen() {
    if (!this.splash) {
      this.splash = new SplashScreen(800, 600);
      this.splash.on(SplashScreenEvents.START, this.startGame.bind(this));
    }

    this.pipeline.clear();
    this.pipeline.addRenderer(this.splash, 0);
    this.splash.attach();

    if (this.interstitial) {
      this.interstitial.detach();
      this.pipeline.removeRenderer(this.interstitial);
    }
  }

  gotoInterstitial(info: IGameInfo) {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).unregisterAll();

    if (!this.interstitial) {
      this.interstitial = new InterstitialScreen(800, 600);
      this.interstitial.on(InterstitialEvents.NEXT_LEVEL, () => {
        this.currentLevel += 1;
        this.totalScore += this.levelScore;
        this.loadMap(this.currentLevel);
      });

      this.interstitial.on(InterstitialEvents.RESTART_CURRENT, () => {
        this.loadMap(this.currentLevel);
      });
    }

    this.interstitial.setRoundInfo(info, this.levelScore);
    this.interstitial.attach();

    // this.pipeline.clear();
    this.pipeline.addRenderer(this.interstitial, 0);
  }

  startBGMusic() {
    const sound = ServiceProvider.lookup(Service.SOUND);
    sound.play(GameSounds.MUSIC);
    sound.setSoundVolume(GameSounds.MUSIC, 0.65);
  }

  startGame() {
    if (this.splash) {
      this.splash.detach();
    }
    this.pipeline.removeRenderer(this.splash);

    this.totalScore = 0;
    this.levelScore = 0;

    this.gameTimer = new GameTimer();
    this.gameTimer.position[0] = 25;
    this.gameTimer.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.gameTimer);

    this.scoreDisplay = new ScoreDisplay();
    this.scoreDisplay.position[0] = 800;
    this.scoreDisplay.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.scoreDisplay);

    this.loadMap();
  }

  loadMap(index: number = this.currentLevel) {
    if (this.gameBoard) {
      this.gameBoard.cleanupGame();
      this.pipeline.removeRenderer(this.gameBoard);
    }
    if (this.interstitial) {
      this.pipeline.removeRenderer(this.interstitial);
      this.interstitial.detach();
    }

    // Need to clear the cache so pegs can redraw at the proper size
    Peg.clearRenderCache();
    Slot.clearRenderCache();

    const nextLevel = LevelData[index];
    if (!nextLevel) {
      throw new Error(`No map found for level "${index}"`);
    }

    this.levelScore = 0;
    this.updateScoreDisplay(this.levelScore);

    this.setupSeededRNG(nextLevel.seed);

    const { board } = nextLevel;
    this.gameBoard = new board(nextLevel);
    this.pipeline.addRenderer(this.gameBoard);

    this.gameBoard.on(GAME_EVENTS.GAME_OVER, this.onRoundEnd.bind(this));
    this.gameBoard.on(GAME_EVENTS.PEG_REMOVED, this.onPlayerScore(1));
    this.gameBoard.on(GAME_EVENTS.PEG_EXPLODED, this.onPlayerScore(3));

    ServiceProvider.lookup(Service.CLOCK).start();
    this.gameTimer.enable();
  }

  onPlayerScore(amount: number) {
    return () => {
      this.levelScore += amount;
      this.updateScoreDisplay(this.levelScore);
    };
  }

  updateScoreDisplay(score: number) {
    this.scoreDisplay.points = score;
  }

  async onRoundEnd(gameInfo: IGameInfo) {
    this.gameBoard.disableAllPegs();
    this.gameTimer.disable();

    // Chill for a moment before rolling to the intersertial
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.gotoInterstitial(gameInfo);
  }

  setupSeededRNG(seed: string) {
    ServiceProvider.unregister(Service.RNG);
    ServiceProvider.register(Service.RNG, provideRNG(seed));
  }

}


new PegSolitaire();
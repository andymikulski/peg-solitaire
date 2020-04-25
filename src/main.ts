import AssetManager, { GameSounds } from './AssetManager';
import InteractionLayer from './input/InteractionLayer';
import { ServiceProvider, Service } from './common/Provider';
import RenderingPipeline from './rendering/RenderingPipeline';
import provideRNG from './common/RNG';

import LevelData, { ILevelOptions } from './levels';
import GameBoard, { GAME_EVENTS } from './game/GameBoard';
import Peg from './game/Peg';
import Slot from './game/Slot';

import InterstitialScreen, { InterstitialEvents } from './game/Interstitial';
import SplashScreen, { SplashScreenEvents } from './game/SplashScreen';

import { Button } from './common/Button';
import { GameClock } from './game/GameClock';
import { GameTimer } from './game/GameTimer';
import ScoreDisplay from './game/ScoreDisplay';
import POINT_VALUES from './game/ScoreManager';
import GameOverScreen, { GameOverEvents } from './game/GameOverScreen';


export interface IRoundInfo {
  numSlots: number;
  numPegsRemaining: number;
}

export interface ISessionInfo {
  totalTime: number;
  totalSlots: number;
  totalPegsRemaining: number;
  totalScore: number;
}

class PegSolitaire {
  pipeline: RenderingPipeline;

  // Views
  splash: SplashScreen;
  interstitial: InterstitialScreen;
  gameOverScreen: GameOverScreen;
  // UI Components
  restartButton: Button;
  gameTimer: GameTimer;
  scoreDisplay: ScoreDisplay;

  // Game logic controller
  gameBoard: GameBoard;

  // Session tracking
  currentLevel: number;
  levelScore: number;
  totalScore: number;
  totalSlots: number;
  totalPegsRemaining: number;
  totalTime: number;

  // Tracking if the user is really interested in restarting the current level.
  // #todo the whole restart button should probably be ripped into its own thing
  needRestartConfirmation: boolean = false;

  constructor() {
    // Wipe the page.
    document.body.innerHTML = '';

    // Pipeline tracks rendering components and uses requestAnimationFrame to
    // print to the canvas on the DOM.
    this.pipeline = new RenderingPipeline(800, 600);
    this.pipeline.setBackground('#ececec');

    // ServiceProvider simply allows code in faraway places to easily access
    // commonly-used global services (such as the AudioManager or the UI manager).
    ServiceProvider.register(Service.PIPELINE, this.pipeline);

    // RNG, UI, Game clock
    this.registerCommonServices();

    // AssetManager only handles audio files (for now), including instantiating
    // the AudioManager.
    const assetMan = new AssetManager();
    assetMan.loadAssets();

    // Attach an actual <canvas> to the page for the pipeline to render in.
    document.body.appendChild(this.pipeline.getCanvas());

    // Music is the same thing throughout on a loop, so we can just kick it off here.
    this.startBGMusic();

    // Send the player to the splash screen to start the fun!
    this.gotoSplashScreen();
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

    if (this.gameOverScreen) {
      // The splash screen may be accessed from the game over screen.
      this.pipeline.removeRenderer(this.gameOverScreen);
      this.gameOverScreen.detach();
    }

    // Ensure the UI is listening to the splash buttons.
    this.splash.attach();
  }

  gotoInterstitial(info: IRoundInfo) {
    // Ensure absolutely nothing outside of the interstitial is listening.
    // #note this is the major problem with my handmade UI management!
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).unregisterAll();

    // Create the screen if needed.
    if (!this.interstitial) {
      this.interstitial = new InterstitialScreen(800, 600);

      // If the player decides to advance to the next level..
      this.interstitial.on(InterstitialEvents.NEXT_LEVEL, () => {
        this.currentLevel += 1;

        this.totalScore += this.levelScore;
        this.totalPegsRemaining += info.numPegsRemaining;
        this.totalSlots += info.numSlots;
        this.totalTime += this.gameTimer.elapsed;

        this.loadMap(this.currentLevel);
      });

      // Restarting is just telling the same map to load again.
      this.interstitial.on(InterstitialEvents.RESTART_CURRENT, () => {
        this.resetCurrentLevel();
      });
    }

    // `setRoundInfo` updates the contents of the interstitial dialog.
    // (This includes the % of pegs remaining, % of slots on the field, etc.)
    this.interstitial.setRoundInfo(info, this.currentLevel + 1, this.levelScore, this.gameTimer.elapsed);
    // More UI binding.
    this.interstitial.attach();

    // Tell the pipeline to render the interstitial above everything else.
    this.pipeline.addRenderer(this.interstitial, 0);
  }

  gotoGameOverScreen() {
    (<InteractionLayer>ServiceProvider.lookup(Service.UI)).unregisterAll();
    if (!this.gameOverScreen) {
      this.gameOverScreen = new GameOverScreen(800, 600);
      this.gameOverScreen.on(GameOverEvents.GO_HOME, () => {
        this.gotoSplashScreen();
      });
    }

    this.interstitial.detach();
    this.pipeline.removeRenderer(this.gameBoard);
    this.gameBoard.cleanupGame();
    this.pipeline.removeRenderer(this.interstitial);
    this.pipeline.removeRenderer(this.gameTimer);
    this.pipeline.removeRenderer(this.scoreDisplay);
    this.detachRestartButton();

    this.gameOverScreen.updateInfo({
      totalScore: this.totalScore,
      totalSlots: this.totalSlots,
      totalPegsRemaining: this.totalPegsRemaining,
      totalTime: this.totalTime,
    });

    this.gameOverScreen.attach();
    this.pipeline.addRenderer(this.gameOverScreen);
  }

  startBGMusic() {
    const sound = ServiceProvider.lookup(Service.SOUND);
    // `true` = loop forever
    sound.play(GameSounds.MUSIC, true);
    sound.setSoundVolume(GameSounds.MUSIC, 0.65);
  }

  // Creates the gameplay UI elements (clock, score, 'restart' button)
  createCommonComponents() {
    this.gameTimer = new GameTimer();
    this.gameTimer.position[0] = 25;
    this.gameTimer.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.gameTimer);

    this.scoreDisplay = new ScoreDisplay();
    this.scoreDisplay.position[0] = 800;
    this.scoreDisplay.position[1] = 600 - 25;
    this.pipeline.addRenderer(this.scoreDisplay);

    this.restartButton = new Button('RESTART LEVEL', this.onRestartClick.bind(this));
    this.restartButton.isLowProfile = true;
    this.restartButton.position[0] = 650;
    this.restartButton.position[1] = 25;
    this.restartButton.height = 25;
    this.restartButton.paddingFactor = 0.2;
    this.restartButton.width = 125;
    this.attachRestartButton();
  }

  startGame() {
    // Remove the splash
    if (this.splash) {
      this.splash.detach();
      this.pipeline.removeRenderer(this.splash);
    }

    // Reset the session tracking variables
    this.currentLevel = 0;
    this.levelScore = 0;
    this.totalScore = 0;
    this.totalSlots = 0;
    this.totalPegsRemaining = 0;
    this.totalTime = 0;

    this.createCommonComponents();

    this.loadMap();

  }

  onRestartClick() {
    // #todo dont hardcode these labels
    if (!this.needRestartConfirmation) {
      this.restartButton.label = 'ARE YOU SURE?';
      this.needRestartConfirmation = true;

      // Wait a few seconds to revert back to default state
      setTimeout(() => {
        this.restartButton.label = 'RESTART LEVEL';
        this.needRestartConfirmation = false;
      }, 5000);

    } else {
      this.restartButton.label = 'RESTART LEVEL';
      this.resetCurrentLevel();
    }
  }

  resetCurrentLevel() {
    this.loadMap();
  }

  // The Restart button is removed when the interstitial is shown, these helper
  // functions simply save some lines of code.
  attachRestartButton() {
    this.restartButton.enable();
    this.pipeline.addRenderer(this.restartButton);
  }
  detachRestartButton() {
    this.restartButton.disable();
    this.pipeline.removeRenderer(this.restartButton);
  }

  prepareForNextLevel() {
    // If a game board already exists, we basically need to prep it for GC.
    if (this.gameBoard) {
      this.gameBoard.cleanupGame();
      this.pipeline.removeRenderer(this.gameBoard);
      this.detachRestartButton();
    }

    // If we're coming from an interstitial we also need to remove that, too.
    if (this.interstitial) {
      this.pipeline.removeRenderer(this.interstitial);
      this.interstitial.detach();
    }

    // Game timer is the current level's time. It's disable duntil the user moves
    // their first peg.
    this.gameTimer.resetTime();
    this.gameTimer.disable();

    //
    this.needRestartConfirmation = false;
    this.attachRestartButton();

    // Need to clear the cache so pegs can redraw at the proper size.
    Peg.clearRenderCache();
    Slot.clearRenderCache();

    // Current level score
    this.levelScore = 0;
    this.updateScoreDisplay(this.levelScore);
  }


  // Given an index, loads a map configuration from `LevelData`, instantiates it,
  // binds GAME_EVENT hooks, and essentially kicks off gameplay.
  loadMap(index: number = this.currentLevel) {
    if (index >= LevelData.length) {
      this.gotoGameOverScreen();
      return;
    }

    // Remove interstitial, add the UI components, etc. Basically prep for
    //  the game to roll once we create the game board.
    this.prepareForNextLevel();

    // Figure out if we actually have level data.
    const nextLevel = LevelData[index];
    if (!nextLevel) {
      throw new Error(`No map found for level "${index}"`);
    }

    this.setupSeededRNG(nextLevel.seed);
    this.createAndBindBoard(nextLevel);

    ServiceProvider.lookup(Service.CLOCK).start();
  }

  createAndBindBoard(options: ILevelOptions) {
    const LevelBoard = options.board;
    this.gameBoard = new LevelBoard(options);
    this.pipeline.addRenderer(this.gameBoard);

    this.gameBoard.on(GAME_EVENTS.GAME_OVER, this.onRoundEnd.bind(this));
    this.gameBoard.on(GAME_EVENTS.PEG_JUMPED, (consecutiveCount: number) => {
      const points = POINT_VALUES.DEFAULT_JUMP + (consecutiveCount * POINT_VALUES.CHECKERS_BONUS);
      this.onPlayerScore(points);
    });
    this.gameBoard.on(GAME_EVENTS.PEG_EXPLODED, () => {
      this.onPlayerScore(POINT_VALUES.EXPLODING_JUMP);
    });

    // Begin the timer after the first peg has moved
    this.gameBoard.once(GAME_EVENTS.PEG_JUMPED, () => {
      if (!this.gameTimer.isEnabled) {
        this.gameTimer.enable();
      }
    });
    this.gameBoard.once(GAME_EVENTS.PEG_EXPLODED, () => {
      if (!this.gameTimer.isEnabled) {
        this.gameTimer.enable();
      }
    });

  }

  onPlayerScore(amount: number) {
    this.levelScore += amount;
    this.updateScoreDisplay(this.levelScore);
  }

  updateScoreDisplay(score: number) {
    this.scoreDisplay.points = score;
  }

  async onRoundEnd(gameInfo: IRoundInfo) {
    this.gameBoard.disableAllPegs();
    this.gameTimer.disable();

    // Chill for a moment before rolling to the intersertial
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.gotoInterstitial(gameInfo);
  }

  setupSeededRNG(seed: string) {
    ServiceProvider.unregister(Service.RNG);
    ServiceProvider.register(Service.RNG, provideRNG(seed));
  }
}

// Run the game as soon as the page loads!
new PegSolitaire();
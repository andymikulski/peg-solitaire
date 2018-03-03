import { GameSounds } from '../AssetManager';
import Emitter from '../common/Emitter';
import ExplodingPeg from './ExplodingPeg';
import InteractionLayer from '../input/InteractionLayer';
import Peg from './Peg';
import Slot from './Slot';
import SoundManager from '../sounds/SoundManager';
import { ServiceProvider, Service } from '../common/Provider';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import QuakeEffect, { QuakeOverTime, QuakeEvents } from '../fx/quake';
import { ILevelOptions } from '../levels';
import { IRoundInfo } from '../main';
import FloatingText from '../fx/FloatingText';
import POINT_VALUES from './ScoreManager';

export enum GAME_EVENTS {
  PEG_JUMPED = 'peg-jumped',
  PEG_EXPLODED = 'peg-exploded',
  GAME_OVER = 'game-over',
}

export default abstract class GameBoard extends Emitter implements Printable {
  map: any;
  slots: Slot[] = [];
  pegs: Peg[] = [];
  size: number;
  distance: number = 2;
  transform: Transform;

  selectedPeg: [Peg, number, number];
  consecutiveJumps: number = -1;

  constructor(protected settings: ILevelOptions) {
    super();

    // This transform's `position` is used solely for the Quake effect.
    this.transform = new Transform();

    // Use board-specific magic numbers to place the board on the screen correctly.
    this.calculateBoardPosition(this.settings.count);
    this.size = this.calculatePegSize(this.settings.count);

    // Generate the Pegs and Slots for the user to interact with.
    this.buildBoard();
  }

  // These functions are to be overwritten by descendent classes in order to
  // provide different shape boards. See `TriangleGameBoard` vs `SquareGameBoard`
  abstract buildBoard(): void;
  abstract calculateBoardPosition(count: number): void;
  abstract calculatePegSize(count: number): number;
  abstract calculatePegPlacement(x: number, y: number): number[];
  abstract validateDistance(distX: number, distY: number): boolean;
  abstract getPossibleMoves(peg: Peg): Slot[];
  abstract getNeighboringPegs(peg: Peg): Peg[];


  createSlot(x: number, y: number) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const slot = new Slot(this.size, this.size);
    slot.position = this.calculatePegPlacement(x, y);

    slot.x = x;
    slot.y = y;
    slot.width = this.size;
    slot.height = this.size;
    slot.onClick = () => this.onSlotClick(x, y, slot);
    this.map[slot.y][slot.x] = slot;

    this.slots.push(slot);

    // Tell interaction layer to check this for click events.
    ui.register(slot, this.transform);

    return slot;
  }

  createPeg(x: number, y: number, isExplodingPeg: boolean = false) {
    const { settings } = this;
    const rng = ServiceProvider.lookup(Service.RNG);
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const peg = new (isExplodingPeg ? ExplodingPeg : Peg)(this.size, this.size);
    peg.position = this.calculatePegPlacement(x, y);

    if (isExplodingPeg) {
      peg.health = 0;
    } else {
      // This is overwritten later when pegs bounce around,
      // so it works, though it's a little gross.
      peg.health = rng.bool(settings.percentStrong) ? (rng.bool(settings.percentRealStrong) ? 3 : 2) : 1;
    }

    peg.x = x;
    peg.y = y;
    peg.width = this.size;
    peg.height = this.size;
    peg.onClick = () => this.onPegClick(x, y, peg);

    // Tell interaction layer to check this for click events.
    ui.register(peg, this.transform);

    this.map[peg.y][peg.x] = peg;
    this.pegs.push(peg);

    return peg;
  }

  // Given a peg, creates a new slot in the same position.
  createSlotFromPeg(peg: Peg) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const slot = this.createSlot(peg.x, peg.y);

    ui.unregister(peg);
    ui.register(slot, this.transform);
    return slot;
  }

  // Given a slot, creates a new peg in the same position.
  createPegFromSlot(slot: Slot) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const peg = this.createPeg(slot.x, slot.y);

    ui.unregister(slot);
    ui.register(peg, this.transform);
    return peg;
  }


  updateSelectedPeg(newPeg?: Peg) {
    this.clearSelectedPeg();
    this.slots.forEach(x => x.isFocused = false);

    if (!newPeg) {
      this.consecutiveJumps = -1;
      return;
    }

    this.selectedPeg = [newPeg, newPeg.x, newPeg.y];
    newPeg.isSelected = true;
    const options = this.getPossibleMoves(newPeg);
    options.forEach((slot: Slot) => {
      slot.isFocused = true;
    });
  }


  removePeg(peg: Peg) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);

    this.pegs = this.pegs.filter(x => x !== peg);
    ui.unregister(peg);
  }

  removeSlot(slot: Slot) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);

    this.slots = this.slots.filter(x => x !== slot);
    ui.unregister(slot);
  }

  explodePeg(peg: Peg) {
    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);

    this.createSlotFromPeg(peg);
    sound.play(GameSounds.HISS);
    const pegQuake = new QuakeEffect(peg, 5, 200, QuakeOverTime.ASC);

    // Callbacks are still cool, right?
    pegQuake.on(QuakeEvents.DONE, () => {
      new QuakeEffect(this.transform, 4, 300);
      this.removePeg(peg);

      // Get peg neighbors (using board-specific method)
      const neighbors = this.getNeighboringPegs(peg);

      // remove and/or expldoe them if necessary
      neighbors.forEach(neigh => {
        neigh.health -= 1;
        if (neigh.health <= 0) {
          this.createSlotFromPeg(neigh);
          this.removePeg(neigh);
        }
      });

      if (this.selectedPeg) {
        this.selectedPeg[0].health -= 1;
        if (this.selectedPeg[0].health <= 0) {
          this.updateSelectedPeg();
        }
      }

      sound.play(GameSounds.BOOM);


      const coords = this.calculatePegPlacement(peg.x, peg.y);
      new FloatingText(
        `+${POINT_VALUES.EXPLODING_JUMP}`,
        // ---
        24,
        [
          coords[0] + this.transform.position[0] + (peg.width / 1.75),
          coords[1] + this.transform.position[1] + (peg.height / 4),
        ],
        25, 1000
      );

      this.emit(GAME_EVENTS.PEG_EXPLODED, this.consecutiveJumps);
      // Technically in this version of the game you can't "lose", but it helps keep
      // the mental model in order.
      this.checkWinLoseConditions();
    });
  }

  // ---
  onSlotClick(x: number, y: number, slot: Slot) {
    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);

    if (this.selectedPeg) {
      // Kick the distance validation out to subclasses since they each
      // have their own special conditions.
      const pegX = this.selectedPeg[1];
      const pegY = this.selectedPeg[2];
      const distX = pegX - x;
      const distY = pegY - y;
      if (!this.validateDistance(distX, distY)) {
        sound.play(GameSounds.DENY);
        return;
      }

      // Grab the peg that was just jumped and is destined for deletion.
      const delX = x + Math.round((pegX - x) / 2);
      const delY = y + Math.round((pegY - y) / 2);
      const delPeg = this.map[delY][delX];

      // No peg found, this isn't a valid move
      if (!delPeg || !(delPeg instanceof Peg)) {
        sound.play(GameSounds.DENY);
        return;
      }

      // The current selected peg needs to be converted a slot and removed.
      this.createSlotFromPeg(this.selectedPeg[0]);
      this.removePeg(this.selectedPeg[0]);

      // Consecutive jumps are reset when `selectedPeg` changes, so we can
      // update it blindly here.
      this.consecutiveJumps += 1;

      // Exploding pegs need to be handled slightly differently.
      const isJumpedPegExploding = delPeg instanceof ExplodingPeg;
      if (isJumpedPegExploding) {
        this.explodePeg(delPeg);
      } else {
        delPeg.health -= 1;
        this.emit(GAME_EVENTS.PEG_JUMPED, this.consecutiveJumps);

        // If the player has jumped more than once using the same selected peg,
        // they get a bonus, so we need to add a neat little '+2' text effect.
        if (this.consecutiveJumps > 0) {
          const coords = this.calculatePegPlacement(delPeg.x, delPeg.y);
          new FloatingText(`+${this.consecutiveJumps + 1}`, 24, [
            coords[0] + this.transform.position[0] + (delPeg.width / 1.75),
            coords[1] + this.transform.position[1] + (delPeg.height / 4),
          ], 25, 1000);
        }

        if (delPeg.health <= 0) {
          this.createSlotFromPeg(delPeg);
          this.removePeg(delPeg);
        }
      }


      // Examine if the peg we just moved is even still with us
      if (this.selectedPeg[0].health > 0) {
        // If so, convert the slot the player just clicked on into the new Peg.
        const newPeg = this.createPegFromSlot(slot);
        newPeg.health = this.selectedPeg[0].health;
        this.removeSlot(slot);

        // Update selection focus.
        this.updateSelectedPeg(newPeg);

        if (!isJumpedPegExploding) {
          sound.play(delPeg.health <= 0 ? GameSounds.PEG_REMOVE : GameSounds.PEG_HIT);
        }
      } else {
        // Dead peg = clear selection.
        this.updateSelectedPeg();
      }

      // Technically in this version of the game you can't "lose", but it helps keep
      // the mental model in order.
      this.checkWinLoseConditions();
    }
  }

  onPegClick(x: number, y: number, peg: Peg) {
    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);
    if (!peg.isEnabled) {
      new QuakeEffect(peg, 1, 300);
      sound.play(GameSounds.DENY);
      return;
    }

    sound.play(GameSounds.PEG_SELECT);

    if (this.selectedPeg) {
      this.selectedPeg[0].isSelected = false;

      if (this.selectedPeg[0] === peg) {
        this.selectedPeg = null;
        this.updateSelectedPeg();
        return;
      }
    }

    this.consecutiveJumps = -1;
    this.updateSelectedPeg(peg);
  }

  // Technically in this version of the game you can't "lose", but it helps keep
  // the mental model in order.
  checkWinLoseConditions() {
    // If there's only one peg, the game is over.
    let isGameOver = this.pegs.length === 1;

    if (!isGameOver) {
      // If the player does not have moves left to make, the game is over.
      const playerHasMoves = !!this.pegs.find((p: Peg) => { return this.getPossibleMoves(p).length !== 0; });
      isGameOver = !playerHasMoves;
    }

    if (isGameOver) {
      this.handleGameOver({
        numPegsRemaining: this.getNumPegsRemaining(false),
        numSlots: this.slots.length,
      });
    }
  }

  // Calculates how many pegs are currently on the board. Optionally returns
  // the total health (2's + 3's).
  getNumPegsRemaining(includingHealth: boolean = false) {
    if (!includingHealth) {
      return this.pegs.length;
    }
    return this.pegs.reduce((prev: number, next: Peg) => {
      return prev + next.health;
    }, 0);
  }

  // Remove the highlight on the selected peg.
  clearSelectedPeg() {
    if (!this.selectedPeg) { return; }
    this.selectedPeg[0].isSelected = false;
    this.selectedPeg = null;
  }


  handleGameOver(info: IRoundInfo) {
    // #todo hook into game clock, don't use setTimeout
    setTimeout(() => {
      const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);
      sound.play(GameSounds.ROUND_END);

      this.pegs.forEach((peg: Peg, idx: number) => {
        new QuakeEffect(peg, 1.5, 300);
      });
    }, 350);

    this.clearSelectedPeg();
    this.emit(GAME_EVENTS.GAME_OVER, info);
  }

  // Remove bindings, clear pegs, reset tracking vars.
  cleanupGame() {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    // #todo: Ideally this would only unregister the pegs/slots on this board..
    ui.unregisterAll();

    this.consecutiveJumps = -1;
    this.slots = [];
    this.pegs = [];
  }

  // Triggered externally between rounds.
  disableAllPegs() {
    this.pegs.forEach(x => x.isEnabled = false);
  }

  // --

  update(delta: number, elapsed: number) {
    this.slots.forEach(slot => {
      slot.update(delta, elapsed);
    });
    this.pegs.forEach(peg => {
      peg.update(delta, elapsed);
    });
  }

  print(toContext: CanvasRenderingContext2D) {
    this.slots.forEach(slot => {
      slot.print(toContext, this.transform);
    });

    this.pegs.forEach(peg => {
      peg.print(toContext, this.transform);
    });
  }
}

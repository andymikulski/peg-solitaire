import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { ServiceProvider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';
import SoundManager from '../sounds/SoundManager';
import ExplodingPeg from './ExplodingPeg';
import { GameSounds } from '../AssetManager';
import QuakeFX, { QuakeOverTime, QuakeEvents } from '../fx/quake';
import Emitter from '../common/Emitter';
import { ILevelOptions } from '../levels';

export enum GAME_EVENTS {
  WIN = 'win',
  LOSE = 'lose',
}

export default abstract class GameBoard extends Emitter implements Printable {
  map: any;
  slots: Slot[] = [];
  pegs: Peg[] = [];
  size: number;
  distance: number = 2;
  transform: Transform;

  selectedPeg: [Peg, number, number];

  constructor(protected settings: ILevelOptions) {
    super();

    this.transform = new Transform();

    this.calculateBoardPosition(this.settings.count);
    this.size = this.calculatePegSize(this.settings.count);

    this.buildBoard();
  }

  abstract buildBoard(): void;
  abstract calculateBoardPosition(count: number): void;
  abstract calculatePegSize(count: number): number;
  abstract calculatePegPlacement(x: number, y: number): number[];
  abstract validateDistance(distX: number, distY: number): boolean;
  abstract getPossibleMoves(peg: Peg): Slot[];
  abstract getNeighboringPegs(peg: Peg): Peg[];

  updateSelectedPeg(newPeg?: Peg) {
    this.slots.forEach(x => x.isFocused = false);

    if (!newPeg) {
      return;
    }
    this.selectedPeg = [newPeg, newPeg.x, newPeg.y];
    newPeg.isSelected = true;
    const options = this.getPossibleMoves(newPeg);
    options.forEach((slot: Slot) => {
      slot.isFocused = true;
    });
  }

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

  createPegFromSlot(slot: Slot) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const peg = this.createPeg(slot.x, slot.y);

    ui.unregister(slot);
    ui.register(peg, this.transform);
    return peg;
  }

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

  // ---
  onSlotClick(x: number, y: number, slot: Slot) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);

    if (this.selectedPeg) {
      const pegX = this.selectedPeg[1];
      const pegY = this.selectedPeg[2];

      const distX = pegX - x;
      const distY = pegY - y;

      // Kick the distance validation out to subclasses since they each
      // have their own special conditions.
      if (!this.validateDistance(distX, distY)) {
        sound.play(GameSounds.DENY);
        return;
      }


      // -- MIDDLE PEG MUST BE REMOVED --
      const delX = x + Math.round((pegX - x) / 2);
      const delY = y + Math.round((pegY - y) / 2);
      const delPeg = this.map[delY][delX];

      if (!delPeg || !(delPeg instanceof Peg)) {
        sound.play(GameSounds.DENY);
        return;
      }

      // ACTIVE PEG MUST BE REMOVED-
      this.createSlotFromPeg(this.selectedPeg[0]);
      this.removePeg(this.selectedPeg[0]);

      const isJumpedPegExploding = delPeg instanceof ExplodingPeg;


      if (isJumpedPegExploding) {
        this.createSlotFromPeg(delPeg);
        sound.play(GameSounds.HISS);
        const pegQuake = new QuakeFX(delPeg, 5, 200, QuakeOverTime.ASC);

        // Callbacks are still cool, right?
        pegQuake.on(QuakeEvents.DONE, () => {
          new QuakeFX(this.transform, 4, 300);
          this.removePeg(delPeg);

          // Get delpeg neighbors (using board-specific method)
          const neighbors = this.getNeighboringPegs(delPeg);

          // remove and/or expldoe them if necessary
          neighbors.forEach(neigh => {
            neigh.health -= 1;
            if (neigh.health <= 0) {
              this.createSlotFromPeg(neigh);
              this.removePeg(neigh);
            }
          });
          this.selectedPeg[0].health -= 1;

          sound.play(GameSounds.BOOM);

          this.checkGameOver();
        });
      } else {
        delPeg.health -= 1;

        if (delPeg.health <= 0) {
          this.createSlotFromPeg(delPeg);
          this.removePeg(delPeg);
        }
      }

      if (this.selectedPeg[0].health > 0) {
        // -- NEW PEG IN THIS SLOT --
        const newPeg = this.createPegFromSlot(slot);
        newPeg.health = this.selectedPeg[0].health;
        this.removeSlot(slot);

        this.updateSelectedPeg(newPeg);

        if (!isJumpedPegExploding) {
          sound.play(delPeg.health <= 0 ? GameSounds.PEG_REMOVE : GameSounds.PEG_MOVE);
        }
      } else {
        this.updateSelectedPeg();
      }


      this.checkGameOver();
    }
  }

  onPegClick(x: number, y: number, peg: Peg) {
    console.log(x, y);
    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);
    if (!peg.isEnabled) {
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

    this.updateSelectedPeg(peg);
  }

  checkGameOver() {
    if (this.pegs.length === 1) {
      this.emit(GAME_EVENTS.WIN);
      return;
    }

    const hasMoves = !!this.pegs.find((p: Peg) => { return this.getPossibleMoves(p).length !== 0; });

    if (!hasMoves) {
      this.emit(GAME_EVENTS.LOSE);
    }
  }

  cleanupGame() {
    this.disableAllPegs();
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);

    // Ideally this would only unregister the pegs/slots on this board..
    ui.unregisterAll();

    this.slots = [];
    this.pegs = [];
  }

  disableAllPegs() {
    this.pegs.forEach(x => x.isEnabled = false);
  }
  enableAllPegs() {
    this.pegs.forEach(x => x.isEnabled = x instanceof Peg);
  }
}

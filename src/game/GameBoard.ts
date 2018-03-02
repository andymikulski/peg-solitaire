import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { ServiceProvider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';
import SoundManager from '../sounds/SoundManager';
import ExplodingPeg from './ExplodingPeg';

export default abstract class GameBoard extends Transform implements Printable {
  map: any;
  slots: Slot[] = [];
  pegs: Peg[] = [];
  size: number;
  distance: number = 2;

  selectedPeg: [Peg, number, number];

  constructor(protected count: number = 5) {
    super();

    this.calculateBoardPosition(this.count);
    this.size = this.calculatePegSize(this.count);

    this.buildBoard();
  }

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
    ui.register(slot, this);

    return slot;
  }

  createPeg(x: number, y: number, isExplodingPeg: boolean = false) {
    const rng = ServiceProvider.lookup(Service.RNG);
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const peg = new (isExplodingPeg ? ExplodingPeg : Peg)(this.size, this.size);
    peg.position = this.calculatePegPlacement(x, y);

    if (isExplodingPeg) {
      peg.health = 0;
    } else {
      peg.health = rng.bool(0.2) ? (rng.bool(0.25) ? 3 : 2) : 1;
    }

    peg.x = x;
    peg.y = y;
    peg.width = this.size;
    peg.height = this.size;
    peg.onClick = () => this.onPegClick(x, y, peg);

    // Tell interaction layer to check this for click events.
    ui.register(peg, this);

    this.map[peg.y][peg.x] = peg;
    this.pegs.push(peg);

    return peg;
  }

  // Given a peg, creates a new slot in the same position.
  createSlotFromPeg(peg: Peg) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const slot = this.createSlot(peg.x, peg.y);

    ui.unregister(peg);
    ui.register(slot, this);
    return slot;
  }

  createPegFromSlot(slot: Slot) {
    const ui: InteractionLayer = ServiceProvider.lookup(Service.UI);
    const peg = this.createPeg(slot.x, slot.y);

    ui.unregister(slot);
    ui.register(peg, this);
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
      slot.print(toContext, this);
    });

    this.pegs.forEach(peg => {
      peg.print(toContext, this);
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
        sound.play('deny');
        return;
      }


      // -- MIDDLE PEG MUST BE REMOVED --
      const delX = x + Math.round((pegX - x) / 2);
      const delY = y + Math.round((pegY - y) / 2);
      const delPeg = this.map[delY][delX];

      if (!delPeg || !(delPeg instanceof Peg)) {
        sound.play('deny');
        return;
      }

      // ACTIVE PEG MUST BE REMOVED-
      this.createSlotFromPeg(this.selectedPeg[0]);
      this.removePeg(this.selectedPeg[0]);


      if (delPeg instanceof ExplodingPeg) {
        this.createSlotFromPeg(delPeg);
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
        sound.play('boom');
      } else {
        delPeg.health -= 1;

        if (delPeg.health <= 0) {
          this.createSlotFromPeg(delPeg);
          this.removePeg(delPeg);
        }


        // -- NEW PEG IN THIS SLOT --
        const newPeg = this.createPegFromSlot(slot);
        newPeg.health = this.selectedPeg[0].health;
        this.removeSlot(slot);

        this.selectedPeg = [newPeg, newPeg.x, newPeg.y];
        newPeg.isSelected = true;

        sound.play(delPeg.health <= 0 ? 'peg-remove' : 'peg-move');
        sound.play('peg-move');
      }


      this.checkGameOver();
    }
  }

  onPegClick(x: number, y: number, peg: Peg) {
    if (!peg.isEnabled) {
      return;
    }

    const sound: SoundManager = ServiceProvider.lookup(Service.SOUND);
    sound.play('peg-select');

    if (this.selectedPeg) {
      this.selectedPeg[0].isSelected = false;

      if (this.selectedPeg[0] === peg) {
        this.selectedPeg = null;
        return;
      }
    }

    this.selectedPeg = [peg, x, y];
    peg.isSelected = true;
  }

  checkGameOver() {
    if (this.pegs.length === 1) {
      alert('you win');
      return;
    }

    const hasMoves = !!this.pegs.find((p: Peg) => { return this.getPossibleMoves(p).length !== 0; });

    if (!hasMoves) {
      alert('you lose!');
    }
  }

}

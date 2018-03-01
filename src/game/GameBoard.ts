import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { Provider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';

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
    this.calculatePegSize(this.count);

    this.buildBoard();
  }

  abstract buildBoard(): void;
  abstract calculateBoardPosition(count: number): void;
  abstract calculatePegSize(count: number): void;
  abstract calculatePegPlacement(x: number, y: number): number[];
  abstract validateDistance(distX: number, distY: number): boolean;

  createSlot(x: number, y: number) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const slot = new Slot(this.size, this.size);
    slot.position = this.calculatePegPlacement(x, y);

    slot.x = x;
    slot.y = y;
    slot.width = this.size;
    slot.height = this.size;
    slot.onClick = () => this.onSlotClick(x, y, slot);

    this.slots.push(slot);

    // Tell interaction layer to check this for click events.
    ui.register(slot, this);

    return slot;
  }

  createSlotFromPeg(peg: Peg) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const slot = new Slot(peg.width, peg.height);
    slot.position = [].concat(peg.position);
    slot.width = peg.width;
    slot.height = peg.height;
    slot.x = peg.x;
    slot.y = peg.y;
    slot.onClick = () => this.onSlotClick(slot.x, slot.y, slot);

    this.map[slot.y][slot.x] = slot;

    ui.unregister(peg);
    ui.register(slot, this);
    return slot;
  }

  createPegFromSlot(slot: Slot) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const peg = new Peg(slot.width, slot.height);
    peg.position = [].concat(slot.position);
    peg.width = peg.width;
    peg.height = peg.height;
    peg.x = slot.x;
    peg.y = slot.y;
    peg.onClick = () => this.onPegClick(peg.x, peg.y, peg);

    this.map[peg.y][peg.x] = peg;

    ui.unregister(slot);
    ui.register(peg, this);
    return peg;
  }

  createPeg(x: number, y: number) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const peg = new Peg(this.size, this.size);
    peg.position = this.calculatePegPlacement(x, y);

    peg.x = x;
    peg.y = y;
    peg.width = this.size;
    peg.height = this.size;
    peg.onClick = () => this.onPegClick(x, y, peg);

    this.pegs.push(peg);

    // Tell interaction layer to check this for click events.
    ui.register(peg, this);

    return peg;
  }

  print(toContext: CanvasRenderingContext2D) {
    this.slots.forEach(slot => {
      slot.print(toContext, this);
    });

    this.pegs.forEach(peg => {
      peg.print(toContext, this);
    });
  }

  // ---
  onSlotClick(x: number, y: number, slot: Slot) {
    if (this.selectedPeg) {
      const pegX = this.selectedPeg[1];
      const pegY = this.selectedPeg[2];
      // console.log('active is', pegX, pegY);

      const distX = pegX - x;
      const distY = pegY - y;


      if (!this.validateDistance(distX, distY)) {
        return;
      }


      // -- MIDDLE PEG MUST BE REMOVED --
      const delX = x + Math.round((pegX - x) / 2);
      const delY = y + Math.round((pegY - y) / 2);
      const delPeg = this.map[delY][delX];

      if (!delPeg || !(delPeg instanceof Peg)) {
        return;
      }

      // replacement slot
      const deletedSlot = this.createSlotFromPeg(delPeg);
      this.pegs = this.pegs.filter(x => x !== delPeg);
      this.slots.push(deletedSlot);


      // -- SELECTED PEG MUST BE REMOVED --
      const selectedX = x + Math.round((pegX - x) / 2);
      const selectedY = y + Math.round((pegY - y) / 2);
      const selectedPeg = this.map[selectedY][selectedX];
      // replacement slot
      const newSelectedSlot = this.createSlotFromPeg(this.selectedPeg[0]);
      this.pegs = this.pegs.filter(x => x !== this.selectedPeg[0]);
      this.slots.push(newSelectedSlot);


      // -- NEW PEG IN THIS SLOT --
      const newPeg = this.createPegFromSlot(slot);
      this.slots = this.slots.filter(x => x !== slot);
      this.pegs.push(newPeg);


      this.pegs = this.pegs.filter(x => x !== this.selectedPeg[0]);
      this.selectedPeg = null;
    }
  }

  onPegClick(x: number, y: number, peg: Peg) {
    // console.log(x, y);
    if (this.selectedPeg) {
      if (this.selectedPeg[0] === peg) {
        this.selectedPeg[0].isSelected = !this.selectedPeg[0].isSelected;
        return;
      } else {
        this.selectedPeg[0].isSelected = false;
      }
    }

    this.selectedPeg = [peg, x, y];
    peg.isSelected = true;
  }
  // ---
}




export class TriangleGameBoard extends GameBoard {
  calculateBoardPosition(count: number) {
    // magical numbers obtained via eyeballing it and mycurvefit.com
    const boardX = 194.4171 + (5.681169 * count) - (1.125676 * Math.pow(count, 2)) + (0.03652708 * Math.pow(count, 3));
    const boardY = 210.4402 * Math.pow(count, -0.3913894);

    this.position = [boardX, boardY];
  }

  calculatePegSize(count: number) {
    this.size = 200 * Math.pow(count, -0.8302527);
  }

  buildBoard() {
    this.map = [];
    const size = this.size;

    for (let y = 0; y < this.count; y += 1) {
      this.map[y] = [];
      for (let x = y; x < this.count; x += 1) {
        this.map[y][x] = x === 3 && y === 2 ? this.createSlot(x, y) : this.createPeg(x, y);
      }
    }
  }

  calculatePegPlacement(x: number, y: number): number[] {
    return [
      ((this.size / 2) + ((x - y / 2) * (this.size * 1.5))),
      (y * (this.size * 1.5))
    ];
  }

  validateDistance(distX: number, distY: number): boolean {
    return Math.abs(distX | distY) === this.distance;
  }
}


export class SquareGameBoard extends GameBoard {
  distance = 2;

  calculateBoardPosition(count: number) {
    // magical numbers obtained via eyeballing it and mycurvefit.com
    const boardX = 194.4171 + (5.681169 * count) - (1.125676 * Math.pow(count, 2)) + (0.03652708 * Math.pow(count, 3));
    const boardY = 210.4402 * Math.pow(count, -0.3913894);

    this.position = [boardX, boardY];
  }

  calculatePegSize(count: number) {
    this.size = 200 * Math.pow(count, -0.8302527);
  }

  buildBoard() {
    this.map = [];
    const size = this.size;

    for (let y = 0; y < this.count; y += 1) {
      this.map[y] = [];
      for (let x = 0; x < this.count; x += 1) {
        this.map[y][x] = x === 3 && y === 2 ? this.createSlot(x, y) : this.createPeg(x, y);
      }
    }
  }

  calculatePegPlacement(x: number, y: number): number[] {
    return [
      (x * (this.size * 1.5)),
      (y * (this.size * 1.5))
    ];
  }

  validateDistance(distX: number, distY: number): boolean {
    return Math.abs(distX | distY) === this.distance && Math.abs(distX) !== Math.abs(distY);
  }
}

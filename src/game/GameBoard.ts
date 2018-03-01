import VCR from '../rendering/VCR';
import { Printable } from '../rendering/RenderingPipeline';
import Transform from '../common/Transform';
import Peg from './Peg';
import { Provider, Service } from '../common/Provider';
import InteractionLayer from '../input/InteractionLayer';
import Slot from './Slot';

export class TriangleGameBoard extends Transform implements Printable {
  map: any;
  slots: Slot[] = [];
  pegs: Peg[] = [];
  size: number = 50;

  selectedPeg: [Peg, number, number];

  constructor(private count: number = 5) {
    super();

    this.size = Math.round((count * count) / (count * 0.4));
    this.build();
  }

  build() {
    this.map = [];
    const size = this.size;

    for (let y = 0; y < this.count; y += 1) {
      this.map[y] = [];
      for (let x = y; x < this.count; x += 1) {
        this.map[y][x] = x === 5 && y === 2 ? this.createSlot(x, y) : this.createPeg(x, y);
      }
    }
  }

  createSlot(x: number, y: number) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const slot = new Slot();
    slot.position = [
      ((this.size / 2) + ((x - y / 2) * (this.size * 1.5))),
      (y * (this.size * 1.5))
    ];

    slot.width = this.size;
    slot.height = this.size;
    slot.onClick = () => this.onSlotClick(x, y);

    this.slots.push(slot);

    // Tell interaction layer to check this for click events.
    ui.register(slot, this);

    return slot;
  }

  createPeg(x: number, y: number) {
    const ui: InteractionLayer = Provider.lookup(Service.UI);
    const peg = new Peg();
    peg.position = [
      ((this.size / 2) + ((x - y / 2) * (this.size * 1.5))),
      (y * (this.size * 1.5))
    ];

    peg.width = this.size;
    peg.height = this.size;
    peg.onClick = () => this.onPegClick(peg, x, y);

    this.pegs.push(peg);

    // Tell interaction layer to check this for click events.
    ui.register(peg, this);

    return peg;
  }

  onSlotClick(x: number, y: number) {
    console.log('slot', x, y, 'clicked');
    if (this.selectedPeg) {
      const pegX = this.selectedPeg[1];
      const pegY = this.selectedPeg[2];
      // console.log('active is', pegX, pegY);

      const distX = pegX - x;
      const distY = pegY - y;

      console.log(distX, distY);

      const delX = x + Math.round((pegX - x) / 2);
      const delY = y + Math.round((pegY - y) / 2);

      // console.log('ok', delY, delX, this.map);

      this.map[delY][delX] = null;

      // console.log('delete');

      this.selectedPeg[0].isSelected = false;
      this.selectedPeg = null;
    }
  }

  onPegClick(peg: Peg, x: number, y: number) {
    // console.log(x, y);
    if (this.selectedPeg) {
      this.selectedPeg[0].isSelected = false;
    }

    this.selectedPeg = [peg, x, y];
    peg.isSelected = true;
  }

  update(delta: number) {
    this.pegs.forEach(peg => {
      peg.update(delta);
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
}

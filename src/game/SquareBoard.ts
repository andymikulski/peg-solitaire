import GameBoard from './GameBoard';
import Peg from './Peg';
import { ServiceProvider, Service } from '../common/Provider';
import Slot from './Slot';

export default class SquareGameBoard extends GameBoard {
  distance = 2;

  calculateBoardPosition(count: number) {
    // magical numbers obtained via eyeballing it and mycurvefit.com
    const boardX = 297.2097 * Math.pow(count, -0.2192493);
    const boardY = 202.4127 * Math.pow(count, -0.5205111);

    this.transform.position = [boardX, boardY];
  }

  calculatePegSize(count: number): number {
    return 200 * Math.pow(count, -0.8302527);
  }

  buildBoard() {
    const { settings } = this;
    const rng = ServiceProvider.lookup(Service.RNG);
    this.map = [];
    const size = this.size;

    const slots = settings.slots.map((pt: number[]) => pt.join(','));

    for (let y = 0; y < settings.count; y += 1) {
      this.map[y] = [];
      for (let x = 0; x < settings.count; x += 1) {

        const isPredeterminedSlot = !!slots.find((slot: string) => slot === `${x},${y}`);

        this.map[y][x] = isPredeterminedSlot ? this.createSlot(x, y) : this.createPeg(x, y, rng.bool(settings.percentExplosive));
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

  getNeighboringPegs(peg: Peg): Peg[] {
    let thing;
    let neighbors = [];
    for (let ix = -1; ix <= 1; ix += 1) {
      for (let iy = -1; iy <= 1; iy += 1) {

        if (ix === 0 && iy === 0) { continue; }

        thing = this.map[iy + peg.y] && this.map[iy + peg.y][ix + peg.x];

        if (thing && thing instanceof Peg) {
          neighbors.push(thing);
        }
      }
    }

    return neighbors;
  }

  getPossibleMoves(peg: Peg): Slot[] {
    if (!peg.isEnabled) {
      return [];
    }
    // - look 2 up
    //   - if it's a peg, continue
    //    - if it's a slot, examine 1 up
    //    - if one up is a peg, we have a move
    // - look 2 left...

    const neighboringMoves = [
      [-2, 0],
      [2, 0],
      [0, 2],
      [0, -2],
    ];

    let currX;
    let currY;
    let thing;
    let diffX;
    let diffY;

    let possibleMoves: Slot[] = [];

    neighboringMoves.forEach(coords => {
      currX = peg.x + coords[0];
      currY = peg.y + coords[1];

      thing = this.map[currY] && this.map[currY][currX];
      if (thing && thing instanceof Slot) {
        diffX = peg.x + (coords[0] / 2);
        diffY = peg.y + (coords[1] / 2);

        if (this.map[diffY] && this.map[diffY][diffX] instanceof Peg) {
          possibleMoves.push(thing);
        }
      }
    });

    return possibleMoves;
  }
}

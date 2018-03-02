import GameBoard from './GameBoard';
import { ServiceProvider, Service } from '../common/Provider';
import Peg from './Peg';
import Slot from './Slot';

export default class TriangleGameBoard extends GameBoard {
  calculateBoardPosition(count: number) {
    // magical numbers obtained via eyeballing it and mycurvefit.com
    const boardX = 194.4171 + (5.681169 * count) - (1.125676 * Math.pow(count, 2)) + (0.03652708 * Math.pow(count, 3));
    const boardY = 210.4402 * Math.pow(count, -0.3913894);

    this.position = [boardX, boardY];
  }

  calculatePegSize(count: number) {
    return 200 * Math.pow(count, -0.8302527);
  }

  buildBoard() {
    const rng = ServiceProvider.lookup(Service.RNG);
    this.map = [];
    const size = this.size;
    const middlePoint = Math.round((this.count * this.count) / 4);
    let idx = 0;
    for (let y = 0; y < this.count; y += 1) {
      this.map[y] = [];
      for (let x = y; x < this.count; x += 1) {
        idx += 1;
        if (y === this.count - 1 && x === this.count - 1) {
          this.map[y][x] = this.createSlot(x, y);
        } else {
          const peg = this.createPeg(x, y, rng.bool(0.11));
          this.map[y][x] = peg;
        }
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

  getNeighboringPegs(peg: Peg): Peg[] {
    let thing;
    let neighbors = [];
    for (let ix = -1; ix <= 1; ix += 1) {
      for (let iy = -1; iy <= 1; iy += 1) {

        if ((ix === -1 && iy === -1)
          || (ix === 1 && iy === 1)
          || (ix === 0 || iy === 0)
        ) { continue; }

        thing = this.map[iy + peg.y] && this.map[iy + peg.y][ix + peg.x];

        if (thing && thing instanceof Peg) {
          neighbors.push(thing);
        }
      }
    }

    return neighbors;
  }

  getPossibleMoves(peg: Peg): Slot[] {
    // - look 2 up
    //   - if it's a peg, continue
    //    - if it's a slot, examine 1 up
    //    - if one up is a peg, we have a move
    // - look 2 left...

    const neighboringMoves = [
      [2, 0],
      [2, 2],
      [0, 2],
      [-2, 0],
      [-2, -2],
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
        diffX = (currX - peg.x) / 2;
        diffY = (currY - peg.y) / 2;

        if (this.map[diffY] && this.map[diffY][diffX] instanceof Peg) {
          possibleMoves.push(thing);
        }
      }
    });

    return possibleMoves;
  }
}


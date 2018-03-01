import GameBoard from './GameBoard';
import { Provider, Service } from '../common/Provider';

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
    const rng = Provider.lookup(Service.RNG);

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
          const peg = this.createPeg(x, y);
          this.map[y][x] = peg;
          peg.health = rng.integer(0, 5) > 0 ? 1 : 2;
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
}


import GameBoard from './GameBoard';

export default class SquareGameBoard extends GameBoard {
  distance = 2;

  calculateBoardPosition(count: number) {
    // magical numbers obtained via eyeballing it and mycurvefit.com
    const boardX = 297.2097 * Math.pow(count, -0.2192493);
    const boardY = 202.4127 * Math.pow(count, -0.5205111);

    this.position = [boardX, boardY];
  }

  calculatePegSize(count: number): number {
    return 200 * Math.pow(count, -0.8302527);
  }

  buildBoard() {
    this.map = [];
    const size = this.size;

    const middlePoint = Math.round((this.count * this.count) / 2);
    let idx = 0;
    for (let y = 0; y < this.count; y += 1) {
      this.map[y] = [];
      for (let x = 0; x < this.count; x += 1) {
        idx += 1;

        this.map[y][x] = (idx === middlePoint) ? this.createSlot(x, y) : this.createPeg(x, y);
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

import TriangleGameBoard from './game/TriangleBoard';
import SquareGameBoard from './game/SquareBoard';

export interface ILevelOptions {
  seed: string;
  slots: number[][];
  board: any; // GameBoard
  count: number;
  percentExplosive: number;
  percentStrong: number;
  percentRealStrong: number;
}

const LevelData: ILevelOptions[] = [
  {
    seed: 'bunny hill',
    board: TriangleGameBoard,
    slots: [[4, 4]],
    count: 5,
    percentExplosive: 0,
    percentStrong: 0,
    percentRealStrong: 0,
  },
  {
    seed: 'switching up the board',
    board: SquareGameBoard,
    slots: [[0, 0]],
    count: 4,
    percentExplosive: 0,
    percentStrong: 0,
    percentRealStrong: 0,
  },
  {
    seed: 'getting bigger',
    board: TriangleGameBoard,
    slots: [[4, 0]],
    count: 5,
    percentExplosive: 0,
    percentStrong: 0,
    percentRealStrong: 0,
  },
  {
    seed: 'double peg',
    board: SquareGameBoard,
    slots: [[2, 2], [3, 3]],
    count: 6,
    percentExplosive: 0,
    percentStrong: 0.075,
    percentRealStrong: 0,
  },
  {
    seed: 'more double pegs',
    board: TriangleGameBoard,
    slots: [[2, 2], [3, 3]],
    count: 6,
    percentExplosive: 0,
    percentStrong: 0.095,
    percentRealStrong: 0.1,
  },
  {
    seed: 'introducing exploding pegs',
    board: SquareGameBoard,
    slots: [[4, 0]],
    count: 5,
    percentExplosive: 0.025,
    percentStrong: 0,
    percentRealStrong: 0,
  },
  {
    seed: 'mixing explosion w/ strong pegs',
    board: TriangleGameBoard,
    slots: [[0, 0]],
    count: 6,
    percentExplosive: 0.07,
    percentStrong: 0.1,
    percentRealStrong: 0,
  },

  // #TODO: A SHAPE CHANGE HERE WOULD BE GOOD

  {
    seed: 'gettin into the thick of it',
    board: TriangleGameBoard,
    slots: [[3, 3]],
    count: 6,
    percentExplosive: 0.05,
    percentStrong: 0.07,
    percentRealStrong: 0.25
  },

  {
    seed: 'yiha!!!',
    board: SquareGameBoard,
    slots: [[0, 0]],
    count: 6,
    percentExplosive: 0.1,
    percentStrong: 0.15,
    percentRealStrong: 0.25
  },

  // 10
  {
    seed: 'Level Ten',
    board: SquareGameBoard,
    slots: [[2, 3]],
    count: 6,
    percentExplosive: 0.1,
    percentStrong: 0.15,
    percentRealStrong: 0.4
  },

  {
    seed: 'Level Eleven',
    board: TriangleGameBoard,
    slots: [[4, 2]],
    count: 7,
    percentExplosive: 0.11,
    percentStrong: 0.2,
    percentRealStrong: 0.25
  },
  {
    seed: 'Level Twelve',
    board: SquareGameBoard,
    slots: [[5, 0]],
    count: 6,
    percentExplosive: 0.1,
    percentStrong: 0.24,
    percentRealStrong: 0.7
  },
  {
    seed: 'Level Thirteen',
    board: SquareGameBoard,
    slots: [[0, 0], [0, 6], [6, 0], [6, 6]],
    count: 7,
    percentExplosive: 0.15,
    percentStrong: 0.23,
    percentRealStrong: 0.25
  },
  {
    seed: 'Level Fourteen',
    board: TriangleGameBoard,
    slots: [[7, 7]],
    count: 8,
    percentExplosive: 0.125,
    percentStrong: 0.35,
    percentRealStrong: 0.25
  },
  // 15
  {
    seed: 'Level Fifteen',
    board: TriangleGameBoard,
    slots: [[0, 0], [9, 0], [9, 9], [6, 3]],
    count: 10,
    percentExplosive: 0.1,
    percentStrong: 0.2,
    percentRealStrong: 0.25
  },

];

export default LevelData;
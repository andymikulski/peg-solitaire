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
    seed: 'yiha!',
    board: SquareGameBoard,
    slots: [[0, 0]],
    count: 6,
    percentExplosive: 0.1,
    percentStrong: 0.15,
    percentRealStrong: 0.25
  },
];

export default LevelData;
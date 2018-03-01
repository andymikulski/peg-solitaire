// interface Boundary {
//   origin: number[];
//   width: number;
//   height: number;
// }

// export default class QuadTree<T> {
//   northWest: QuadTree<T>;
//   northEast: QuadTree<T>;
//   southWest: QuadTree<T>;
//   southEast: QuadTree<T>;
//   data: { [origin: string]: [number, number, T][] } = {};
//   isSplit: boolean = false;

//   constructor(private bounds: Boundary) { }

//   isRectCompletlyInBounds(point: number[], width: number, height: number, bounds: Boundary) {
//     const boundXMin = bounds.origin[0];
//     const boundXMax = bounds.origin[0];

//     const pointXMin = bounds.origin[1];
//     const pointXMax = bounds.origin[1];

//     return (boundXMin <= pointXMin && boundXMax >= pointXMax) && (boundYMin <= pointYMin && boundYMax >= pointYMax);
//   }

//   set(origin: number[], width: number, height: number, data: T) {
//     if (this.isSplit) {
//       let storedInChild = false;

//       const children = [this.northWest, this.northEast, this.southWest, this.southEast];
//       let i = 0;
//       while (i < children.length) {

//         if (this.isRectCompletlyInBounds(origin, width, height, children[i].bounds)) {
//           childNode.set(origin, width, height, data);   // Go deeper into the tree
//           storedInChild = true;
//           break;
//         }
//         i += 1;
//       }
//       if (not storedInChild)
//       {
//         Add this rectangle to the current node
//       }
//     }
//     else {
//       this.data[origin] = [
//         ...(this.data[origin] || []),
//       ];
//     }
//   }
// }
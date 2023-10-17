
// type GConstructor<T = {}> = new (...args: any[]) => T; // constraint to constructors returning T!


// type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;

// function Loggable<TBase extends Positionable>(Base: TBase) {
//   return class Loggable extends Base { // config of 1 class
//     jump() {
//       this.setPos(0, 20);
//     }
//   };
// }

// new Loggable()
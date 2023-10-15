// import { DependencySingleton } from "./DependencySingleton.ts";

export enum InjectionTargetType {
  View,
  Service,
};

// export abstract class InjectionTarget extends DependencySingleton {
//   // places WHERE we are injecting something (e.g. Views, other Services)
//   constructor() {
//     super({});
//   }
// }
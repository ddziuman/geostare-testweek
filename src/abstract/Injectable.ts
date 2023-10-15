// import { DependencySingleton } from "./DependencySingleton";

// export abstract class Injectable<Props extends {} = {}> extends DependencySingleton<Props> {
//   constructor(initProps: Props) {
//     super(initProps);
//   }

//   // public getInstance(initProps: Props): Injectable<Props> { // constructor logic here
//   //   const inheritedFrom = this.constructor.name;
//   //   let instance = DependencyContainer.instancesCache[inheritedFrom];
//   //   if (!instance) {
//   //     this.props = initProps;
//   //     instance = DependencyContainer.instancesCache[inheritedFrom] = this;
//   //   }
//   //   return instance as Injectable<Props>;
//   // }

//   // // public static instanceFromContext(inheritedInstance: Injectable | InjectableInjectionTarget) {
//   // //   return inheritedInstance.getInstance
//   // // }

//   // public updateProps(newProps: Partial<Props>) { // typeof from TS, not JS!
//   //   Object.assign(this.props, newProps);    
//   // }

//   // protected props!: Props;
// }
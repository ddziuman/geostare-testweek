// import { DependencySingleton } from "./DependencySingleton";
// import { Injectable } from "./Injectable";
// import { /*InjectionTarget,*/ InjectionTargetType } from "./InjectionTarget";

// export abstract class InjectableInjectionTarget<Props extends {} = {}> extends DependencySingleton<Props> { // composition!
//   constructor(public readonly targetType: InjectionTargetType, initProps: Props) {
//     super(targetType, initProps);
//     this.injectable = this;
//     this.injectionTarget = this;
//   }
//   injectable: Injectable<Props>;
//   injectionTarget: InjectionTarget;
// };
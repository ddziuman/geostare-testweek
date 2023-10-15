import { DependencySingleton } from "./DependencySingleton";
import { Injectable } from "./Injectable";
import { InjectionTarget, InjectionTargetType } from "./InjectionTarget";

export abstract class InjectableInjectionTarget<Props extends {} = {}> extends DependencySingleton<Props> { // composition!
  constructor(public readonly targetType: InjectionTargetType, initProps: Props) {
    super(initProps);
    this.injectionTarget.setupProviders();
    injectable = this.injectable.getInstance(initProps);
  }
  injectable: Injectable<Props> = {} = this;
  injectionTarget: InjectionTarget = {} = this;
};
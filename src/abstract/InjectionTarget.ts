import { Injectable } from "./Injectable.ts";
import { DependencyContainer } from "../DependencyContainer.ts";

export enum InjectionTargetType {
  View,
  Service,
};

export abstract class InjectionTarget {
  // places WHERE we are injecting something (e.g. Views, other Services)
  constructor(public readonly targetType: InjectionTargetType) {
    this.setupProviders();
  }

  public setupProviders() {
    this.providers = DependencyContainer.getDependenciesFor(this);
    this.dependenciesSet = true; // защита от дурака, создающего новый новый InjectionTarget
  }

  protected getDependency<T extends Injectable<object>>(depKey: new() => T): T {
    if (!this.dependenciesSet) 
      throw new ReferenceError(`Attempt to access dependecy of '${this.constructor.name}' before they are set up`);

    const dep = this.providers[depKey.name]; // name of the most derived constructor
    if (dep) return dep as T;
    else throw new ReferenceError(
      `'${this.constructor.name}' injection target does not have the '${depKey.name}' dependency`);
  }

  private providers: Record<string, Injectable<object>> = {};
  private dependenciesSet = false;
}
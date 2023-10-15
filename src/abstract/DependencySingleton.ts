import { DependencyContainer } from "../DependencyContainer";
import { InjectionTargetType } from "./InjectionTarget";

export abstract class DependencySingleton<Props extends {} = {}> {
  constructor(public readonly targetType: InjectionTargetType, initProps: Props) {
    this.setupProviders();
    const inheritedFrom = this.constructor.name;
    let instance = DependencyContainer.instancesCache[inheritedFrom];
    if (!instance) {
      this.props = initProps;
      instance = DependencyContainer.instancesCache[inheritedFrom] = this;
    }
    return instance as DependencySingleton<Props>;
  }

  protected updateProps(newProps: Partial<Props>) { // typeof from TS, not JS!
    Object.assign(this.props, newProps);    
  }

  private setupProviders() {
    this.providers = DependencyContainer.getDependenciesFor(this);
    this.dependenciesSet = true; // защита от дурака, создающего новый новый InjectionTarget
  }

  protected getDependency<T extends DependencySingleton<object>>(depKey: new() => T): T {
    if (!this.dependenciesSet) 
      throw new ReferenceError(`Attempt to access dependecy of '${this.constructor.name}' before they are set up`);

    const dep = this.providers[depKey.name]; // name of the most derived constructor
    if (dep) return dep as T;
    else throw new ReferenceError(
      `'${this.constructor.name}' injection target does not have the '${depKey.name}' dependency`);
  }

  protected props!: Props;
  private providers: Record<string, DependencySingleton<object>> = {};
  private dependenciesSet = false;
}
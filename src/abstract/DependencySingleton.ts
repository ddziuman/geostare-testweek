import { InjectionTargetType } from "./InjectionTargetType";
// import { DependencyContainer } from "../DependencyContainer";

export abstract class DependencySingleton<Props extends {} = {}> {
  constructor(public readonly targetType: InjectionTargetType, initProps: Props) {
    const inheritedFrom = this.constructor.name; // FSView / ConcreteService1 / ...
    let instance = (window as any).DependencyContainer.instancesCache[inheritedFrom];
    if (!instance) {
      this.setupProviders(); // Injection Target Part
      this.props = initProps;
      instance = (window as any).DependencyContainer.instancesCache[inheritedFrom] = this;
    }
    return instance as DependencySingleton<Props>;
  } 

  protected updateProps(newProps: Partial<Props>) {
    Object.assign(this.props, newProps);    
  }

  private setupProviders() {
    this.providers = (window as any).DependencyContainer.getDependenciesFor(this);
    this.dependenciesSet = true;
  }

  protected getDependency<T extends DependencySingleton>(depKey: new(...args: any[]) => T): T {
    if (!this.dependenciesSet)
      throw new ReferenceError(`Attempt to access dependecy of '${this.constructor.name}' before they are set up`);

    const dep = this.providers[depKey.name]; // name of the most derived constructor
    if (dep) return dep as T;
    else throw new ReferenceError(
      `'${this.constructor.name}' injection target does not have the '${depKey.name}' dependency`);
  }

  public props!: Props; // props of this as a dependency
  private providers: Record<string, DependencySingleton<object>> = {}; // sub-dependencies
  private dependenciesSet = false;
}
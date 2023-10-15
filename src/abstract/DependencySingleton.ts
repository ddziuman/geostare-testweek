import { DependencyContainer } from "../DependencyContainer";

export abstract class DependencySingleton<Props extends {} = {}> {
  constructor(initProps: Props) {
    const inheritedFrom = this.constructor.name;
    let instance = DependencyContainer.instancesCache[inheritedFrom];
    if (!instance) {
      this.props = initProps;
      instance = DependencyContainer.instancesCache[inheritedFrom] = this;
    }
    return instance as DependencySingleton<Props>;
  }

  public updateProps(newProps: Partial<Props>) { // typeof from TS, not JS!
    Object.assign(this.props, newProps);    
  }

  protected props!: Props;
}
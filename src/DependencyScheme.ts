import { DependencyConstructor } from "./DependencyContainer";

export class DependencyScheme<T extends DependencyConstructor> {
  constructor(private ctor: T, private props: ConstructorParameters<T>) {}

  bootstrapDependency(): InstanceType<T> {
    return new this.ctor(...this.props) as InstanceType<T>;
  }
  
  // static init()
}
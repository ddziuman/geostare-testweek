import { DependencySingleton } from "./DependencySingleton";
import { InjectionTargetType } from "./InjectionTarget";

export abstract class Service<Props extends {} = {}> extends DependencySingleton<Props> {
  constructor(initProps: Props) {
    super(InjectionTargetType.Service, initProps);
  }
}
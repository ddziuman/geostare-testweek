import { DependencySingleton } from "./DependencySingleton";
import { InjectionTargetType } from "./InjectionTargetType";

export abstract class Service<Props extends {} = {}> extends DependencySingleton<Props> {
  constructor(initProps: Props) {
    super(InjectionTargetType.Service, initProps);
  }
}
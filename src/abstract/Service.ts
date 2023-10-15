import { Injectable } from "./Injectable";
import { InjectableInjectionTarget } from "./InjectableInjectionTarget";
import { InjectionTarget, InjectionTargetType } from "./InjectionTarget";

abstract class Service<Props extends {} = {}> extends InjectableInjectionTarget<Props> {
  constructor(initProps: Props) {
    super(InjectionTargetType.Service, initProps);
  }
}
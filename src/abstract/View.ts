import { IView, ViewComponent } from "../view/IView.ts";
import { InjectionTarget, InjectionTargetType } from "./InjectionTarget.ts";

export abstract class View extends InjectionTarget implements IView {
  constructor(components: ViewComponent[]) {
    super(InjectionTargetType.View);
    this.components = components;
  }

  public readonly components: ViewComponent[];

  public render(renderee: ViewComponent) {
    const { parent, fragment } = renderee;
    parent.innerHTML = "";
    parent.appendChild(fragment);
  }

  public getComponent(i: number) {
    return this.components[i];
  }
}
export type ViewComponent = { parent: HTMLElement; fragment: DocumentFragment };

export interface IView {
  components: ViewComponent[];
  render(renderee: ViewComponent): void;
  getComponent(i: number): ViewComponent;
}

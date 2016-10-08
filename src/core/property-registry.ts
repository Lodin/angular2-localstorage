export class PropertyRegistry {
  /** @internal */
  private _list: Function[] = [];

  public register(callback: () => void): void {
    this._list.push(callback);
  }

  public callAll(): void {
    for (const callback of this._list) {
      callback();
    }
  }
}

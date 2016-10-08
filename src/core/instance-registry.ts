export class InstanceRegistry {
  /** @internal */
  private _list = new Map<any, string>();

  public add(instance: any, data: string): void {
    this._list.set(instance, data);
  }

  public has(instance: any): boolean {
    return this._list.has(instance);
  }

  public get(instance: any): string {
    return this._list.get(instance);
  }
}

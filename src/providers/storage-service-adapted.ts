import {SerealizationRule, buildKey, stripKey} from '../core';
import {StorageServiceData} from './storage-service-data';

export class StorageServiceAdapted {
  /** @internal */
  private _serializationRule: SerealizationRule;

  constructor(private _instance: any, private _data: StorageServiceData) {}

  public get keys(): string[] {
    const keys = new Array(this._data.storage.length);

    for (let i = 0, len = keys.length; i < len; i++) {
      keys[i] = stripKey(this._data.storage.key(i), this._data.registry, this._instance);
    }

    return keys;
  }

  public has(key: string): boolean {
    return !!this._data.storage[buildKey(key, this._data.registry, this._instance)];
  }

  public get(key: string): any {
    const data = this._data.storage.getItem(buildKey(key, this._data.registry, this._instance));

    return this._serializationRule.deserialize(data);
  }

  public remove(key: string): void {
    this._data.storage.removeItem(buildKey(key, this._data.registry, this._instance));
  }

  public set(key: string, value: any): void {
    const processed = this._serializationRule.serealize(value);
    this._data.storage.setItem(buildKey(key, this._data.registry, this._instance), processed);
  }

  public setPrefix(prefix: string): void {
    this._data.registry.prefixes.add(this._instance, prefix);
  }

  public setSerealizationRule(rule: SerealizationRule): void {
    this._serializationRule = rule;
  }

  public usePostfix(): void {
    this._data.registry.postfixes.add(this._instance, this._instance.constructor.name);
  }
}
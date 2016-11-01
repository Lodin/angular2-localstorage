import {SerializationRule, StorageOperator, buildKey, stripKey} from '../core';
import {StorageServiceData} from './storage-service-data';

export class StorageServiceAdapted implements StorageOperator {
  constructor(
    private _instance: any,
    private _data: StorageServiceData,
    private _serializationRule: SerializationRule
  ) {}

  public get keys(): string[] {
    const keys = new Array(this._data.storage.length);

    for (let i = 0, len = keys.length; i < len; i++) {
      keys[i] = stripKey(this._data.storage.key(i), this._data.registry, this._instance);
    }

    return keys;
  }

  public has(key: string): boolean {
    const builtKey = buildKey(key, this._data.registry, this._instance);
    return !!this._data.storage.getItem(builtKey);
  }

  public get(key: string): any {
    const builtKey = buildKey(key, this._data.registry, this._instance);
    const data = this._data.storage.getItem(builtKey);

    return this._serializationRule.deserialize(data);
  }

  public remove(key: string): void {
    const builtKey = buildKey(key, this._data.registry, this._instance);
    this._data.storage.removeItem(builtKey);
  }

  public set(key: string, value: any): void {
    const serialized = this._serializationRule.serialize(value);
    const builtKey = buildKey(key, this._data.registry, this._instance);
    this._data.storage.setItem(builtKey, serialized);
  }

  public setPrefix(prefix: string): void {
    this._data.registry.prefixes.add(this._instance, prefix);
  }

  public setSerealizationRule(rule: SerializationRule): void {
    this._serializationRule = rule;
  }

  public usePostfix(): void {
    this._data.registry.postfixes.add(this._instance, this._instance.constructor.name);
  }
}

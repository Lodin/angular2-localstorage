import {NgZone} from '@angular/core';
import {SerializationRule, GlobalStorageRegistry, ServiceConfig, buildKey, stripKey} from '../core';
import {StorageServiceData} from './storage-service-data';
import {StorageServiceAdapted} from './storage-service-adapted';

export class StorageService {
  /** @internal */
  private _data: StorageServiceData = {
    registry: null,
    storage: null
  };

  /** @internal */
  private _serializationRule: SerializationRule;

  /** @internal */
  private _adapted = new Map<any, StorageServiceAdapted>();

  constructor(storage: Storage, zone: NgZone, config?: ServiceConfig) {
    this._data.storage = storage;
    this._data.registry = GlobalStorageRegistry.getRegistry(storage);

    if (!this._data.registry.isInitialized) {
      this._data.registry.initialize(zone);
    }

    if (config && config.prefix) {
      this._data.registry.globalPrefix = config.prefix;
    }

    if (config && config.serialization) {
      this._serializationRule = config.serialization;
    } else {
      this._serializationRule = {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      };
    }
  }

  public get keys(): string[] {
    const keys = new Array<string>(this._data.storage.length);

    for (let i = 0, len = keys.length; i < len; i++) {
      keys[i] = stripKey(this._data.storage.key(i), this._data.registry);
    }

    return keys;
  }

  public adapt(instance: any): StorageServiceAdapted {
    const adapted = new StorageServiceAdapted(instance, this._data);
    this._adapted.set(instance, adapted);
    return adapted;
  }

  public getAdapted(instance: any): StorageServiceAdapted {
    return this._adapted.get(instance);
  }

  public has(key: string): boolean {
    const builtKey = buildKey(key, this._data.registry);
    return !!this._data.storage.getItem(builtKey);
  }

  public get(key: string): any {
    const builtKey = buildKey(key, this._data.registry);
    const data = this._data.storage.getItem(builtKey);

    return this._serializationRule.deserialize(data);
  }

  public remove(key: string): void {
    const builtKey = buildKey(key, this._data.registry);
    this._data.storage.removeItem(builtKey);
  }

  public set(key: string, value: any): void {
    const builtKey = buildKey(key, this._data.registry);
    const processed = this._serializationRule.serialize(value);
    this._data.storage.setItem(builtKey, processed);
  }
}

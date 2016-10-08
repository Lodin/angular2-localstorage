import {Injectable, Inject, NgZone, Optional} from '@angular/core';
import {SerealizationRule, GlobalStorageRegistry, ServiceConfig, buildKey, stripKey} from '../core';
import {StorageServiceData} from './storage-service-data';
import {StorageServiceAdapted} from './storage-service-adapted'

export class StorageService {
  /** @internal */
  private _data: StorageServiceData = {
    registry: null,
    storage: null,
    zone: null
  };

  /** @internal */
  private _serializationRule: SerealizationRule;

  /** @internal */
  private _adapted = new Map<any, StorageServiceAdapted>();

  constructor(storage: Storage, zone: NgZone, config: ServiceConfig) {
    this._data.storage = storage;
    this._data.registry = GlobalStorageRegistry.getRegistry(storage);
    this._data.zone = zone;

    if (config.prefix) {
      this._data.registry.globalPrefix = config.prefix;
    }

    if (config.serialization) {
      this._serializationRule = config.serialization;
    }
  }

  public get keys(): string[] {
    const keys = new Array<string>(this._data.storage.length);

    for (let i = 0, len = keys.length; i < len; i++) {
      keys[i] = stripKey(this._data.storage.key(i), this._data.registry);
    }

    return keys;
  }

  public init(): void {
    if (GlobalStorageRegistry.isInitialized) {
      return;
    }

    this._data.zone.onMicrotaskEmpty.subscribe(() => {
      this._data.registry.properties.callAll();
    });

    GlobalStorageRegistry.initialize();
  }

  public adapt(instance: any) {
    const adapted = new StorageServiceAdapted(instance, this._data);
    this._adapted.set(instance, adapted);
    return adapted;
  }

  public getAdapted(instance: any) {
    return this._adapted.get(instance);
  }

  public has(key: string): boolean {
    return !!this._data.storage[buildKey(key, this._data.registry)];
  }

  public get(key: string): any {
    const data = this._data.storage.getItem(buildKey(key, this._data.registry));

    if (this._serializationRule) {
      return this._serializationRule.deserialize(data);
    }

    return data;
  }

  public set(key: string, value: any): void {
    let processed = value;

    if (this._serializationRule) {
      processed = this._serializationRule.serealize(value);
    }

    this._data.storage.setItem(buildKey(key, this._data.registry), processed);
  }

  public remove(key: string): void {
    this._data.storage.removeItem(buildKey(key, this._data.registry));
  }
}

@Injectable()
export class LocalStorageService extends StorageService {
  constructor(@Inject(NgZone) zone: NgZone,
              @Optional() config: ServiceConfig) {
    super(window.localStorage, zone, config);
  }
}

@Injectable()
export class SessionStorageService extends StorageService {
  constructor(@Inject(NgZone) zone: NgZone,
              @Optional() config: ServiceConfig) {
    super(window.sessionStorage, zone, config);
  }
}
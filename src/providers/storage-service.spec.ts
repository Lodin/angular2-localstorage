/* tslint:disable:no-unused-variable */

import * as CoreInjector from '../core';
import * as StorageServiceAdaptedInjector from './storage-service-adapted';
import {StorageService} from './storage-service';

type StorageRegistryMock = {
  globalPrefix: string;
  isInitialized: boolean,
  initialize: () => void
}

abstract class Mock {
  public static readonly zone = {zone: 'ngZone'};
  public static readonly prefix = 'testPrefix';
  public static readonly key = 'testKey';
  public static readonly anotherKey = 'testAnotherKey';
  public static readonly item = 'testItem';
  public static readonly anotherItem = 'testAnotherItem';
  public static readonly adapted = {adapted: true};
}

class Spy {
  public readonly buildKey = jasmine.createSpy('buildKey');
  public readonly stripKey = jasmine.createSpy('stripKey');
  public readonly storageServiceAdapted = jasmine.createSpy('StorageServiceAdapted#constructor');
  public readonly storage = {
    length: 2,
    key: jasmine.createSpy('Storage#key'),
    getItem: jasmine.createSpy('Storage#getItem'),
    setItem: jasmine.createSpy('Storage#setItem'),
    removeItem: jasmine.createSpy('Storage#removeItem')
  };
  public readonly globalStorageRegistry = {
    getRegistry: jasmine.createSpy('GlobalStorageRegistry#getRegistry')
  };
  public readonly registry: StorageRegistryMock = {
    globalPrefix: null,
    isInitialized: false,
    initialize: jasmine.createSpy('StorageRegistry#initialize')
  };
  public readonly serializationRule = {
    serialize: jasmine.createSpy('SerializationRule#serialize'),
    deserialize: jasmine.createSpy('SerializationRule#deserialize')
  };
}

class TestInstance {}

describe('Service "StorageService"', () => {
  let spy: Spy;

  beforeEach(() => {
    spy = new Spy();
    (<any> CoreInjector).GlobalStorageRegistry = spy.globalStorageRegistry;
    (<any> CoreInjector).buildKey = spy.buildKey;
    (<any> CoreInjector).stripKey = spy.stripKey;
    (<any> StorageServiceAdaptedInjector).StorageServiceAdapted = spy.storageServiceAdapted;
    spy.globalStorageRegistry.getRegistry.and.returnValue(spy.registry);
  });

  describe('on construction', () => {
    it('should initialize registry by zone', () => {
      const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});
      expect((<any> service)._data.registry).toEqual(spy.registry);
      expect((<any> service)._data.storage).toEqual(spy.storage);
      expect((<any> service)._serializationRule).toEqual({
        serialize: JSON.stringify,
        deserialize: JSON.parse
      });
      expect(spy.registry.initialize).toHaveBeenCalledWith(Mock.zone);
    });

    it('should set global prefix if it is set in config', () => {
      const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {
        prefix: Mock.prefix
      });
      expect(spy.registry.globalPrefix).toEqual(Mock.prefix);
    });

    it('should set serialization rule', () => {
      const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {
        serialization: spy.serializationRule
      });
      expect((<any> service)._serializationRule).toEqual(spy.serializationRule);
    });
  });

  it('should get a list of keys', () => {
    spy.storage.key.and.returnValue(Mock.key);
    spy.stripKey.and.returnValue(Mock.anotherKey);
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});

    const keys = service.keys;
    expect(keys).toEqual([Mock.anotherKey, Mock.anotherKey]);
    expect(spy.storage.key).toHaveBeenCalledWith(0);
    expect(spy.storage.key).toHaveBeenCalledWith(1);
    expect(spy.stripKey).toHaveBeenCalledWith(Mock.key, spy.registry);
  });

  it('should get an adapted service for instance', () => {
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});
    const instance = new TestInstance();
    service.adapt(instance);

    expect((<any> service)._adapted.has(instance)).toBeTruthy();
    expect(spy.storageServiceAdapted).toHaveBeenCalledWith(instance, {
      registry: spy.registry,
      storage: spy.storage
    });
  });

  it('should get adapted service for instance', () => {
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});
    const instance = new TestInstance();

    (<any> service)._adapted.set(instance, Mock.adapted);
    expect(service.getAdapted(instance)).toEqual(Mock.adapted);
  });

  it('should inform about specified key existence', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.storage.getItem.and.returnValue(Mock.item);
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});

    const hasKey = service.has(Mock.key);
    expect(hasKey).toBeTruthy();
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry);
    expect(spy.storage.getItem).toHaveBeenCalledWith(Mock.anotherKey);
  });

  it('should get and deserialize item from storage by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.storage.getItem.and.returnValue(Mock.item);
    spy.serializationRule.deserialize.and.returnValue(Mock.anotherItem);
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {
      serialization: spy.serializationRule
    });

    const item = service.get(Mock.key);
    expect(item).toEqual(Mock.anotherItem);
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry);
    expect(spy.storage.getItem).toHaveBeenCalledWith(Mock.anotherKey);
    expect(spy.serializationRule.deserialize).toHaveBeenCalledWith(Mock.item);
  });

  it('should remove item by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {});

    service.remove(Mock.key);

    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry);
    expect(spy.storage.removeItem).toHaveBeenCalledWith(Mock.anotherKey);
  });

  it('should set item by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.serializationRule.serialize.and.returnValue(Mock.anotherItem);
    const service = new StorageService(<any> spy.storage, <any> Mock.zone, <any> {
      serialization: spy.serializationRule
    });

    service.set(Mock.key, Mock.item);

    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry);
    expect(spy.serializationRule.serialize).toHaveBeenCalledWith(Mock.item);
    expect(spy.storage.setItem).toHaveBeenCalledWith(Mock.anotherKey, Mock.anotherItem);
  });
});

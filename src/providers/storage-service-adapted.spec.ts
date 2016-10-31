import * as CoreInjector from '../core';
import {StorageServiceAdapted} from './storage-service-adapted';

abstract class Mock {
  public static readonly key = 'testKey';
  public static readonly anotherKey = 'testAnotherKey';
  public static readonly item = 'testItem';
  public static readonly anotherItem = 'testAnotherItem';
  public static readonly prefix = 'testPrefix';
  public static readonly serializationRule: CoreInjector.SerializationRule = {
    serialize: (deserialized: any) => 'testSerialization',
    deserialize: (serialized: string) => 'testDeserialization'
  };
}

abstract class Backup {
  public static readonly buildKey = CoreInjector.buildKey;
  public static readonly stripKey = CoreInjector.stripKey;
}

class Spy {
  public readonly buildKey = jasmine.createSpy('buildKey');
  public readonly stripKey = jasmine.createSpy('stripKey');
  public readonly registry = {
    postfixes: {
      add: jasmine.createSpy('StorageRegistry.postfixes#add')
    },
    prefixes: {
      add: jasmine.createSpy('StorageRegistry.prefixes#add')
    }
  };
  public readonly storage = {
    length: 2,
    key: jasmine.createSpy('Storage#key'),
    getItem: jasmine.createSpy('Storage#getItem'),
    setItem: jasmine.createSpy('Storage#setItem'),
    removeItem: jasmine.createSpy('Storage#removeItem')
  };
  public readonly serializationRule = {
    serialize: jasmine.createSpy('SerializationRule#serialize'),
    deserialize: jasmine.createSpy('SerializationRule#deserialize')
  };
}

class TestInstance {}

describe('Class "StorageServiceAdapted"', () => {
  let spy: Spy;
  let instance: TestInstance;
  let service: StorageServiceAdapted;

  afterAll(() => {
    (<any> CoreInjector).buildKey = Backup.buildKey;
    (<any> CoreInjector).stripKey = Backup.stripKey;
  });

  beforeEach(() => {
    spy = new Spy();
    instance = new TestInstance();
    (<any> CoreInjector).buildKey = spy.buildKey;
    (<any> CoreInjector).stripKey = spy.stripKey;
    service = new StorageServiceAdapted(instance, {
      registry: <any> spy.registry,
      storage: <any> spy.storage
    });
    (<any> service)._serializationRule = spy.serializationRule;
  });

  it('should get a list of keys for current instance', () => {
    spy.storage.key.and.returnValue(Mock.key);
    spy.stripKey.and.returnValue(Mock.anotherKey);

    const keys = service.keys;
    expect(keys).toEqual([Mock.anotherKey, Mock.anotherKey]);
    expect(spy.storage.key).toHaveBeenCalledWith(0);
    expect(spy.storage.key).toHaveBeenCalledWith(1);
    expect(spy.stripKey).toHaveBeenCalledWith(Mock.key, spy.registry, instance);
  });

  it('should inform about specified key existence', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.storage.getItem.and.returnValue(Mock.item);

    const hasKey = service.has(Mock.key);
    expect(hasKey).toBeTruthy();
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry, instance);
    expect(spy.storage.getItem).toHaveBeenCalledWith(Mock.anotherKey);

    spy.storage.getItem.and.returnValue(null);

    const hasAnotherKey = service.has(Mock.key);
    expect(hasAnotherKey).not.toBeTruthy();
  });

  it('should get and deserialize item from storage by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.storage.getItem.and.returnValue(Mock.item);
    spy.serializationRule.deserialize.and.returnValue(Mock.anotherItem);

    const item = service.get(Mock.key);
    expect(item).toEqual(Mock.anotherItem);
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry, instance);
    expect(spy.storage.getItem).toHaveBeenCalledWith(Mock.anotherKey);
    expect(spy.serializationRule.deserialize).toHaveBeenCalledWith(Mock.item);
  });

  it('should remove item by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);

    service.remove(Mock.key);
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry, instance);
    expect(spy.storage.removeItem).toHaveBeenCalledWith(Mock.anotherKey);
  });

  it('should set item by key', () => {
    spy.buildKey.and.returnValue(Mock.anotherKey);
    spy.serializationRule.serialize.and.returnValue(Mock.anotherItem);

    service.set(Mock.key, Mock.item);
    expect(spy.serializationRule.serialize).toHaveBeenCalledWith(Mock.item);
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.registry, instance);
    expect(spy.storage.setItem).toHaveBeenCalledWith(Mock.anotherKey, Mock.anotherItem);
  });

  it('should set prefix of all keys for this instance', () => {
    service.setPrefix(Mock.prefix);
    expect(spy.registry.prefixes.add).toHaveBeenCalledWith(instance, Mock.prefix);
  });

  it('should allow to set serialization rule', () => {
    service.setSerealizationRule(Mock.serializationRule);
    expect((<any> service)._serializationRule).toEqual(Mock.serializationRule);
  });

  it('should allow to use postfix', () => {
    service.usePostfix();
    expect(spy.registry.postfixes.add).toHaveBeenCalledWith(instance, TestInstance.name);
  });
});

import * as CoreInjector from '../core';
import {makeDecorator} from './make-decorator';

abstract class Mock {
  public static readonly key = 'testKey';
  public static readonly value = 'testValue';
  public static readonly anotherValue = 'anotherTestValue';
  public static readonly serializationRule: CoreInjector.SerializationRule = {
    serialize: (deserealized: any) => `start:${deserealized.toString()}:end`,
    deserialize: (serialized: string) => serialized.split(':')[1]
  };
}

abstract class Backup {
  public static readonly buildKey = CoreInjector.buildKey;
  public static readonly globalStorageRegistry = CoreInjector.GlobalStorageRegistry;
}

class Spy {
  public readonly buildKey = jasmine.createSpy('buildKey');
  public readonly globalStorageRegistry = {
    getRegistry: jasmine.createSpy('GlobalStorageRegistry#getRegistry')
  };
  public readonly storageRegistry = {
    properties: {
      register: jasmine.createSpy('PropertyRegistry#register')
    }
  };
  public readonly storage = {
    getItem: jasmine.createSpy('Storage#getItem'),
    setItem: jasmine.createSpy('Storage#setItem')
  };
}

describe('Function "makeDecorator"', () => {
  let spy: Spy;
  let decorator: Function;

  afterAll(() => {
    (<any> CoreInjector).buildKey = Backup.buildKey;
    (<any> CoreInjector).GlobalStorageRegistry = Backup.globalStorageRegistry;
  });

  beforeEach(() => {
    spy = new Spy();
    (<any> CoreInjector).buildKey = spy.buildKey;
    (<any> CoreInjector).GlobalStorageRegistry = spy.globalStorageRegistry;
    spy.globalStorageRegistry.getRegistry.and.returnValue(spy.storageRegistry);

    decorator = makeDecorator(<any> spy.storage);
  });

  it('should create a property with getter and setter on a target', () => {
    class TestTarget {
      @decorator() public testProperty: any;
    }

    expect((<any> TestTarget).prototype._testProperty_mapped).toEqual(CoreInjector.empty);

    const descriptor = Object.getOwnPropertyDescriptor(TestTarget.prototype, 'testProperty');
    expect(descriptor.get).toBeDefined();
    expect(descriptor.set).toBeDefined();
    expect(spy.globalStorageRegistry.getRegistry).toHaveBeenCalledWith(spy.storage);
  });

  it('should initialize property and register it in PropertyRegistry during property setting',
    () => {
      spy.buildKey.and.returnValue(Mock.key);

      class TestTarget {
        @decorator() public testProperty: any;
      }

      const testInstance = new TestTarget();
      testInstance.testProperty = Mock.value;

      expect(spy.storageRegistry.properties.register).toHaveBeenCalled();
      expect(spy.buildKey).toHaveBeenCalledWith('testProperty', spy.storageRegistry, testInstance);
      expect(spy.storage.getItem).toHaveBeenCalledWith(Mock.key);
    });

  it('should not reinitialize property after initialization', () => {
    spy.buildKey.and.returnValue(Mock.key);

    class TestTarget {
      @decorator() public testProperty: any;
    }

    const testInstance = new TestTarget();
    testInstance.testProperty = Mock.value;
    testInstance.testProperty = Mock.anotherValue;

    expect(spy.storageRegistry.properties.register.calls.count()).toEqual(1);
    expect(spy.buildKey.calls.count()).toEqual(1);
    expect(spy.storage.getItem.calls.count()).toEqual(1);
  });

  it('should detect changes and write everything in Storage', () => {
    spy.buildKey.and.returnValue(Mock.key);

    let emit: Function;
    spy.storageRegistry.properties.register.and.callFake((callback: () => void) => {
      emit = callback;
    });

    class TestTarget {
      @decorator() public testProperty: any;
    }

    const testInstance = new TestTarget();
    testInstance.testProperty = Mock.value;

    emit();
    expect(spy.storage.setItem).toHaveBeenCalledWith(Mock.key, JSON.stringify(Mock.value));

    emit();
    expect(spy.storage.setItem.calls.count()).toEqual(1);
  });

  it('should initialize preset variable after instance construction', () => {
    spy.buildKey.and.returnValue(Mock.key);

    class TestTarget {
      @decorator() public testProperty = Mock.value;
    }

    const testInstance = new TestTarget();
    expect(testInstance.testProperty).toEqual(Mock.value);
  });

  it('should restore previous variable stored in Storage on property init', () => {
    spy.storage.getItem.and.returnValue(JSON.stringify(Mock.value));

    class TestTarget {
      @decorator() public testProperty = Mock.anotherValue;
    }

    const testInstance = new TestTarget();
    expect(testInstance.testProperty).toEqual(Mock.value);
  });

  it('should allow to set storage key for property', () => {
    class TestTarget {
      @decorator(Mock.key) public testProperty = Mock.value;
    }

    const testInstance = new TestTarget();
    expect(spy.buildKey).toHaveBeenCalledWith(Mock.key, spy.storageRegistry, testInstance);
  });

  it('should allow to set own serialize/deserialize methods', () => {
    spy.buildKey.and.returnValue(Mock.key);
    spy.storage.getItem.and.returnValue(Mock.serializationRule.serialize(Mock.value));

    let emit: Function;
    spy.storageRegistry.properties.register.and.callFake((callback: () => void) => {
      emit = callback;
    });

    class TestTarget {
      @decorator(Mock.serializationRule) public testProperty = Mock.value;
    }

    const testInstance = new TestTarget();
    expect(testInstance.testProperty).toEqual(Mock.value);

    emit();
    expect(spy.storage.setItem).toHaveBeenCalledWith(Mock.key, `start:${Mock.value}:end`);
  });
});

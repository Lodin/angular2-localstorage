import {NgZone} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import * as PropertyRegistryInjector from './property-registry';
import {StorageRegistry} from './storage-registry';

abstract class Mock {
  public static zone: NgZone = <any> {
    onMicrotaskEmpty: new Subject()
  };
}

abstract class Backup {
  public static readonly propertyRegistry = PropertyRegistryInjector.PropertyRegistry;
}

class Spy {
  public readonly propertyRegistry = {
    emitAll: jasmine.createSpy('PropertyRegistry#emitAll')
  };
}

describe('Class "StorageRegistry"', () => {
  let spy: Spy;
  let registry: StorageRegistry;

  afterAll(() => {
    (<any> PropertyRegistryInjector).PropertyRegistry = Backup.propertyRegistry;
  });

  beforeEach(() => {
    spy = new Spy();
    (<any> PropertyRegistryInjector).PropertyRegistry = class {
      public emitAll = spy.propertyRegistry.emitAll;
    };
    registry = new StorageRegistry();
  });

  it('should be able to be initialized', () => {
    expect(registry.isInitialized).not.toBeTruthy();
    registry.initialize(Mock.zone);
    expect(registry.isInitialized).toBeTruthy();
  });

  it('should emit all property emitters on microtask empty event', () => {
    registry.initialize(Mock.zone);
    Mock.zone.onMicrotaskEmpty.next();
    expect(spy.propertyRegistry.emitAll).toHaveBeenCalled();
  });
});

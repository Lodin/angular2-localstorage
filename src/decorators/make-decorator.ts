import * as deepEqual from 'deep-equal';
import * as assignDeep from 'assign-deep';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/pairwise';
import {GlobalStorageRegistry, StorageRegistry, buildKey} from '../core';
import {WebStorage} from './web-storage';

export function makeDecorator(storage: Storage): any {
  return (keyOrOptions: string|WebStorage = {}): any => {
    const options: WebStorage = typeof keyOrOptions === 'string'
      ? {key: keyOrOptions}
      : keyOrOptions;

    return (target: any, property: string) => {
      if (!options.key) {
        options.key = property;
      }

      if (!options.serialize) {
        options.serialize = JSON.stringify;
      }

      if (!options.deserialize) {
        options.deserialize = JSON.parse;
      }

      const mapped = `_${property}_mapped`;
      const registry = GlobalStorageRegistry.getRegistry(storage);
      const empty = Symbol('empty');

      Object.defineProperties(target, {
        [mapped]: {
          enumerable: false,
          configurable: true,
          writable: true,
          value: empty
        },
        [property]: {
          get: function get() {
            if (this[mapped] === empty) {
              const storageKey = buildKey(options.key, registry, this);
              initProperty(this, registry, storage, storageKey, mapped, options);
            }

            return this[mapped];
          },
          set: function set(value: any) {
            const storageKey = buildKey(options.key, registry, this);

            if (this[mapped] === empty) {
              initProperty(this, registry, storage, storageKey, mapped, options);
            }

            if (!deepEqual(value, this[mapped])) {
              this[mapped] = value;
              storage.setItem(storageKey, options.serialize(value));
            }
          }
        }
      });
    };
  };
}

function initProperty(instance: any, registry: StorageRegistry, storage: Storage,
                      storageKey: string, mapped: string, options: WebStorage) {
  const subject = new BehaviorSubject(null);
  const restored = storage.getItem(storageKey);

  if (restored) {
    instance[mapped] = options.deserialize(restored);
  }

  // Will be called every VM turn through ngZone's `onMicrotaskEmpty`
  registry.properties.register(() => {
    subject.next(assignDeep({}, instance[mapped]));
  });

  // Receives previous and current value, and if them are not equal,
  // writes new value to the localStorage
  subject
    .asObservable()
    .pairwise()
    .subscribe(([previous, current]: any[]) => {
      if (!deepEqual(previous, current)) {
        storage.setItem(storageKey, options.serialize(current));
      }
    });
}

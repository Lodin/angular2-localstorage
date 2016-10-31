import 'rxjs/add/operator/pairwise';
import * as deepEqual from 'deep-equal';
import * as clone from 'clone';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {GlobalStorageRegistry, StorageRegistry, empty, buildKey} from '../core';
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

      Object.defineProperties(target, {
        [mapped]: {
          enumerable: false,
          configurable: true,
          writable: true,
          value: empty
        },
        [property]: {
          enumerable: true,
          configurable: true,
          get: function get() {
            return this[mapped];
          },
          set: function set(value: any) {
            let isSkipping = false;

            if (this[mapped] === empty) {
              const storageKey = buildKey(options.key, registry, this);
              isSkipping = initProperty(this, registry, storage, storageKey, mapped, options);
            }

            if (!isSkipping) {
              this[mapped] = value;
            }
          }
        }
      });
    };
  };
}

function initProperty(instance: any, registry: StorageRegistry, storage: Storage,
                      storageKey: string, mapped: string, options: WebStorage): boolean {
  const subject = new BehaviorSubject(null);
  const restored = storage.getItem(storageKey);

  if (restored) {
    instance[mapped] = options.deserialize(restored);
  }

  // Will be called at every VM turn through ngZone's `onMicrotaskEmpty`
  registry.properties.register(() => {
    subject.next(clone(instance[mapped]));
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

  return !!restored;
}

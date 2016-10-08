import * as deepEqual from 'deep-equal';
import * as assignDeep from 'assign-deep';
import {GlobalStorageRegistry, PropertyEmitter, StorageRegistry, buildKey} from '../core';
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
    }
  };
}

function initProperty(instance: any,
                      registry: StorageRegistry,
                      storage: Storage,
                      storageKey: string,
                      mapped: string,
                      options: WebStorage) {
  const emitter = new PropertyEmitter();
  const restored = storage.getItem(storageKey);

  if (restored) {
    instance[mapped] = options.deserialize(restored);
  }

  registry.properties.register(() => {
    emitter.emit(assignDeep({}, instance[mapped]));
  });

  emitter.subscribe(([previous, current]: any[]) => {
    if (!deepEqual(previous, current)) {
      storage.setItem(storageKey, options.serialize(current));
    }
  });
}
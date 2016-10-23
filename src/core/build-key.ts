import {StorageRegistry} from './storage-registry';

export function buildKey(key: string, registry: StorageRegistry, instance?: any): string {
  let result = key;

  if (instance && registry.prefixes.has(instance)) {
    result = `${registry.prefixes.get(instance)}:${result}`;
  }

  if (registry.globalPrefix) {
    result = `${registry.globalPrefix}:${result}`;
  }

  if (instance && registry.postfixes.has(instance)) {
    result += `:${registry.postfixes.get(instance)}`;
  }

  return result;
}

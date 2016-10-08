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

export function stripKey(key: string, registry: StorageRegistry, instance?: any): string {
  const parts = key.split(':');

  let index = 0;
  if (registry.globalPrefix) {
    index += 1;
  }

  if (instance && registry.prefixes.has(instance)) {
    index += 1;
  }

  return parts[index];
}
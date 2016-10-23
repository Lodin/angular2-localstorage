import {StorageRegistry} from './storage-registry';

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

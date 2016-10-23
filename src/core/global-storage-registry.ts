import {StorageRegistry} from './storage-registry';

export abstract class GlobalStorageRegistry {
  public static readonly local = new StorageRegistry();
  public static readonly session = new StorageRegistry();

  public static getRegistry(storage: Storage): StorageRegistry {
    switch (storage) {
      case window.sessionStorage:
        return GlobalStorageRegistry.session;
      default:
        return GlobalStorageRegistry.local;
    }
  }
}

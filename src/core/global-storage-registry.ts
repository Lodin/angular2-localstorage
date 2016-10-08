import {StorageRegistry} from './storage-registry';

export abstract class GlobalStorageRegistry {
  public static local = new StorageRegistry();
  public static session = new StorageRegistry();
  private static _isInitialized = false;

  public static initialize() {
    GlobalStorageRegistry._isInitialized = true;
  }

  public static get isInitialized() {
    return GlobalStorageRegistry._isInitialized;
  }

  public static getRegistry(storage: Storage): StorageRegistry {
    switch (storage) {
      case window.sessionStorage:
        return GlobalStorageRegistry.session;
      default:
        return GlobalStorageRegistry.local;
    }
  }
}

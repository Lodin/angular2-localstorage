import {StorageRegistry} from './storage-registry';

describe('Class "StorageRegistry"', () => {
  let registry: StorageRegistry;

  beforeEach(() => {
    registry = new StorageRegistry();
  });

  it('should be able to be initialized', () => {
    expect(registry.isInitialized).not.toBeTruthy();
    registry.initialize();
    expect(registry.isInitialized).toBeTruthy();
  });
});
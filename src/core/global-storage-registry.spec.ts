import {GlobalStorageRegistry} from './global-storage-registry';

describe('Abstract class "GlobalStorageRegistry"', () => {
  it('should get registry depending on the received storage', () => {
    expect(GlobalStorageRegistry.getRegistry(window.localStorage))
      .toEqual(GlobalStorageRegistry.local);
    expect(GlobalStorageRegistry.getRegistry(window.sessionStorage))
      .toEqual(GlobalStorageRegistry.session);
  });
});

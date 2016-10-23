import {stripKey} from './strip-key';

type StorageRegistryMock = {
  globalPrefix: string;
  prefixes: Map<any, string>;
};

abstract class Mock {
  public static readonly instance = {};
  public static readonly key = 'key';
  public static readonly prefix = 'prefix';
  public static readonly globalPrefix = 'global';
}

class Spy {
  public readonly registry: StorageRegistryMock = {
    globalPrefix: null,
    prefixes: new Map()
  };
}

describe('Function "stripKey"', () => {
  let spy: Spy;

  beforeEach(() => {
    spy = new Spy();
  });

  it('should remove global prefix from a received key', () => {
    spy.registry.globalPrefix = Mock.globalPrefix;

    const key = `${Mock.globalPrefix}:${Mock.key}`;
    expect(stripKey(key, <any> spy.registry))
      .toEqual(Mock.key);
  });

  it('should remove local prefix from a received key', () => {
    spy.registry.prefixes.set(Mock.instance, Mock.prefix);

    const key = `${Mock.prefix}:${Mock.key}`;
    expect(stripKey(key, <any> spy.registry, Mock.instance))
      .toEqual(Mock.key);
  });

  it('should remove from received key global and local prefixes both', () => {
    spy.registry.globalPrefix = Mock.globalPrefix;
    spy.registry.prefixes.set(Mock.instance, Mock.prefix);

    const key = `${Mock.globalPrefix}:${Mock.prefix}:${Mock.key}`;
    expect(stripKey(key, <any> spy.registry, Mock.instance))
      .toEqual(Mock.key);
  });
});

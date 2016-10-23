import {buildKey} from './build-key';

type StorageRegistryMock = {
  globalPrefix: string;
  prefixes: Map<any, string>;
  postfixes: Map<any, string>;
};

abstract class Mock {
  public static readonly instance = {};
  public static readonly key = 'key';
  public static readonly prefix = 'prefix';
  public static readonly postfix = 'postfix';
  public static readonly globalPrefix = 'global';
}

class Spy {
  public readonly registry: StorageRegistryMock = {
    globalPrefix: null,
    prefixes: new Map(),
    postfixes: new Map()
  };
}

describe('Function "buildKey"', () => {
  let spy: Spy;

  beforeEach(() => {
    spy = new Spy();
  });

  it('should add global prefix to a received key', () => {
    spy.registry.globalPrefix = Mock.globalPrefix;
    expect(buildKey('key', <any> spy.registry))
      .toEqual(`${Mock.globalPrefix}:${Mock.key}`);
  });

  it('should add prefixes to a received key', () => {
    spy.registry.prefixes.set(Mock.instance, Mock.prefix);
    expect(buildKey('key', <any> spy.registry, Mock.instance))
      .toEqual(`${Mock.prefix}:${Mock.key}`);
  });

  it('should add postfixes to a received key', () => {
    spy.registry.postfixes.set(Mock.instance, Mock.postfix);
    expect(buildKey('key', <any> spy.registry, Mock.instance))
      .toEqual(`${Mock.key}:${Mock.postfix}`);
  });

  it('should build everything along with each other', () => {
    spy.registry.globalPrefix = Mock.globalPrefix;
    spy.registry.postfixes.set(Mock.instance, Mock.postfix);
    spy.registry.prefixes.set(Mock.instance, Mock.prefix);
    expect(buildKey('key', <any> spy.registry, Mock.instance))
      .toEqual(`${Mock.globalPrefix}:${Mock.prefix}:${Mock.key}:${Mock.postfix}`);
  });
});
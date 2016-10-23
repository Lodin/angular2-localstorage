import {InstanceRegistry} from './instance-registry';

abstract class Mock {
  public static readonly instance = {};
}

describe('Class "InstanceRegistry"', () => {
  let registry: InstanceRegistry;

  beforeEach(() => {
    registry = new InstanceRegistry();
  });

  it('should add prefix/postfix by instance', () => {
    registry.add(Mock.instance, 'prefix');
    expect((<any> registry)._list.has(Mock.instance)).toBeTruthy();
  });

  it('should get information about existence instance in registry', () => {
    (<any> registry)._list.set(Mock.instance, 'prefix');
    expect(registry.has(Mock.instance)).toBeTruthy();
  });

  it('should get prefix/postfix by index', () => {
    (<any> registry)._list.set(Mock.instance, 'prefix');
    expect(registry.get(Mock.instance)).toEqual('prefix');
  });
});

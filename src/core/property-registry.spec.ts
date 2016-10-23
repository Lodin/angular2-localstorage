import {PropertyRegistry} from './property-registry';

abstract class Mock {
  public static readonly callback = (): undefined => void 0;
}

class Spy {
  public readonly callbacks = jasmine.createSpyObj('callbacks', ['first', 'second', 'third']);
}

describe('Class "PropertyRegistry"', () => {
  let registry: PropertyRegistry;
  let spy: Spy;

  beforeEach(() => {
    registry = new PropertyRegistry();
    spy = new Spy();
  });

  it('should register property emitter callback', () => {
    registry.register(Mock.callback);
    expect((<any> registry)._list.includes(Mock.callback)).toBeTruthy();
  });

  it('should call all emitter callback', () => {
    registry.register(spy.callbacks.first);
    registry.register(spy.callbacks.second);
    registry.register(spy.callbacks.third);

    registry.emitAll();

    expect(spy.callbacks.first).toHaveBeenCalled();
    expect(spy.callbacks.second).toHaveBeenCalled();
    expect(spy.callbacks.third).toHaveBeenCalled();
  });
});

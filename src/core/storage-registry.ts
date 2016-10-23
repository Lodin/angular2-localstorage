import {InstanceRegistry} from './instance-registry';
import {PropertyRegistry} from './property-registry';

export class StorageRegistry {
  public globalPrefix: string;
  public readonly prefixes = new InstanceRegistry();
  public readonly postfixes = new InstanceRegistry();
  public readonly properties = new PropertyRegistry();
  private _isInitialized = false;

  public initialize() {
    this._isInitialized = true;
  }

  public get isInitialized() {
    return this._isInitialized;
  }
}

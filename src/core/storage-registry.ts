import {InstanceRegistry} from './instance-registry';
import {PropertyRegistry} from './property-registry';

export class StorageRegistry {
  public globalPrefix: string;
  public prefixes = new InstanceRegistry();
  public postfixes = new InstanceRegistry();
  public properties = new PropertyRegistry();
}

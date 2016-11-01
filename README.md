# angular2-localstorage
This module implements functionality of HTML5 Storage for Angular 2. 
It gives an ability to save, restore, remove etc. manually, or through 
the `@LocalStorage` or `@SessionStorage` decorator for class property.

## Install
```bash
$ npm install --save angular2-localstorage
```
## Use
First add `NgStorageModule` as dependency to your module. If your module
is a root module, you can configure storage module. It receives an object
with `StorageConfig` type, that has following notation:
```typescript
interface StorageConfig {
  prefix?: string,
  serialization?: {
    serialize: (deserialized: any) => string,
    deserialize: (serialized: string) => any
  }
}
```
* `prefix` is a global prefix for all storage records that will be saved
using this module. If it is not set, nothing will be used. 
* `serialization` is a set of functions that processes serialization and 
deserialization of data before creating a storage record. By default there
are `JSON.stringify` and `JSON.parse`, but you can use your own. Default rule 
can be redefined at any time for service or even for instance. 

So, module adding can looks like following:
```typescript
import {NgStorageModule} from 'angular2-localstorage';

@NgModule({
  imports: [
    NgStorageModule.forRoot({
      prefix: 'foo',
      serialization: {
        serialize: JSON.stringify,
        deserialize: JSON.parse 
      }
    })
  ]
})
export class AppModule {}
```

### Decorators
Decorators provides automatic save and restore of class properties. But there is some conditions
you should fulfil before it will work properly. 
1. Always initialize your property by default value, even by `null`. 
2. Always inject a service, decorator of what you use in the current structure. 
```typescript
import {LocalStorageService, LocalStorage} from 'angular2-localstorage';

@Injectable()
export class FooService {
  @LocalStorage() public bar: string = null;
  
  constructor(@Inject(LocalStorageService) private localStorageService: LocalStorageService) {}
}
```
After that every reload the property will be restored, and every change will be recorded in the 
`localStorage`.

In addition, you can configure decorator by a string key:
```typescript
@LocalStorage('foo') public bar: string = null;
```
or a following config:
```typescript
interface WebStorage {
  key?: string;
  serialize?: (deserealized: any) => string;
  deserialize?: (serialized: string) => any;
}
```
In this config you can describe serialization functions that will be 
used only for this property. 

### Services
Besides decorators, you can use storage services as well. Both 
`LocalStorageService` and `SessionStorageService` implements 
`StorageOperator` interface: 
```typescript
export interface StorageOperator {
  keys: string[]; // gets list of storage keys
  get(key: string): any; // gets storage value by key
  has(key: string): boolean; // inspects storage record existence
  remove(key: string): void; // removes storage record
  set(key: string, value: any): void; // adds new storage record
}
```
To change serialization rule for the current service you can call method
`setSerializationRule`:
```typescript
service.setSerializationRule({
  serialize: JSON.stringify,
  deserialize: JSON.parse
});
```
Another feature of storage service is the ability to adapt it for current
instance. It means that you will be able to add prefixes and postfixes 
depending on instance (service or component) you are working now. Adaptation
is processed by `adapt` method. 
```typescript
const adaptedService = service.adapt(this);
```
Adapted service implements the same `StorageOperator` interface and has a few 
additional methods:
* `setSerializationRule` - changes serialization rule for current instance.
```typescript
adaptedService.setSerializationRule({
  serialize: JSON.stringify,
  deserialize: JSON.parse
});
```
* `setPrefix` - defines a prefix for instance that will be added to every 
storage record for this storage.
```typescript
adaptedService.setPrefix('foo');
```
* `usePostfix` - allows using postfix. Postfix is a name of current instance,
so it will completely bind storage key with the instance. 
```typescript
adaptedService.usePostfix();
```

### Prefixes
Prefix system aims to completely separate storage keys. Module can have a 
global prefix that separates it from another cases of storage usage. Every
instance that uses storage can have it's own prefix defined by developer and
postfix that will be name of this instance's class. Every part of this 
system can be used or not. Key have a following mask:
```typescript
'globalPrefix:prefix:key:postfix'
```

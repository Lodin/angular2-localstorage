import {NgModule} from '@angular/core';
import {ServiceConfig} from './core';
import {LocalStorageService, SessionStorageService} from './providers';

@NgModule({
  providers: [LocalStorageService, SessionStorageService]
})
export class Ng2StorageModule {
  public static forRoot(config?: ServiceConfig) {
    return {
      ngModule: Ng2StorageModule,
      providers: [
        {provide: ServiceConfig, useValue: config}
      ]
    };
  }
}

import {NgModule} from '@angular/core';
import {ServiceConfig} from './core';
import {LocalStorageService, SessionStorageService} from './providers';

@NgModule({
  providers: [LocalStorageService, SessionStorageService]
})
export class NgStorageModule {
  public static forRoot(config?: ServiceConfig) {
    return {
      ngModule: NgStorageModule,
      providers: [
        {provide: ServiceConfig, useValue: config}
      ]
    };
  }
}
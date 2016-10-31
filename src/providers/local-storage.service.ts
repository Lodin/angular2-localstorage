import {NgZone, Injectable, Inject, Optional} from '@angular/core';
import {ServiceConfig} from '../core';
import {StorageService} from './storage-service';

@Injectable()
export class LocalStorageService extends StorageService {
  constructor(@Inject(NgZone) zone: NgZone,
              @Optional() config: ServiceConfig) {
    super(window.localStorage, zone, config);
  }
}

import {NgZone, Injectable, Inject, Optional} from '@angular/core';
import {ServiceConfig} from '../core';
import {StorageService} from './storage-service';

@Injectable()
export class SessionStorageService extends StorageService {
  constructor(@Inject(NgZone) zone: NgZone,
              @Optional() config: ServiceConfig) {
    super(window.sessionStorage, zone, config);
  }
}

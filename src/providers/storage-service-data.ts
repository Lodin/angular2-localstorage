import {NgZone} from '@angular/core';
import {StorageRegistry} from '../core';

export type StorageServiceData = {
  registry: StorageRegistry;
  storage: Storage;
  zone: NgZone;
};
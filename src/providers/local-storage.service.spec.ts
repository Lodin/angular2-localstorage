/* tslint:disable:no-unused-variable */

import {TestBed, inject} from '@angular/core/testing';
import {LocalStorageService} from './local-storage.service';

describe('Service "LocalStorageService"', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService]
    });
  });

  it('should construct a new successor of StorageService', inject([LocalStorageService],
    (service: LocalStorageService) => {
      expect((<any> service)._data.storage).toEqual(window.localStorage);
    }));
});

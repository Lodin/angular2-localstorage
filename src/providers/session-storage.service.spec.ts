/* tslint:disable:no-unused-variable */

import {TestBed, inject} from '@angular/core/testing';
import {SessionStorageService} from './session-storage.service';

describe('Service "LocalStorageService"', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionStorageService]
    });
  });

  it('should construct a new successor of StorageService', inject([SessionStorageService],
    (service: SessionStorageService) => {
      expect((<any> service)._data.storage).toEqual(window.sessionStorage);
    }));
});

import {WebStorage} from './web-storage';
import {makeDecorator} from './make-decorator';

export interface WebStorageDecorator {
  (keyOrOptions?: string|WebStorage): any;
  new (keyOrOptions?: string|WebStorage): any;
}

export interface LocalStorageDecorator extends WebStorageDecorator {
}

export interface LocalStorage extends WebStorage {
}

export interface SessionStorageDecorator extends WebStorageDecorator {
}

export interface SessionStorage extends WebStorage {
}

export const LocalStorage: LocalStorageDecorator = makeDecorator(window.localStorage);
export const SessionStorage: SessionStorageDecorator = makeDecorator(window.sessionStorage);

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {PartialObserver} from 'rxjs/Observer';
import 'rxjs/add/operator/pairwise';

export class PropertyEmitter {
  /** @internal */
  private _subject = new BehaviorSubject<any>(null);
  /** @internal */
  private _observable: Observable<any>;

  constructor() {
    this._observable = this._subject.asObservable();
  }

  emit(value: any): void {
    this._subject.next(value);
  }

  subscribe(observerOrNext?: PartialObserver<any> | ((value: any) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {
    return this._observable
      .pairwise()
      .subscribe(observerOrNext, error, complete);
  }
}
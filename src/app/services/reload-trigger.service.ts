import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReloadTriggerService {
  public timeLogDeleted: EventEmitter<number>;
  public timeLogUpdated: EventEmitter<number>;

  constructor() {
    this.timeLogDeleted = new EventEmitter();
    this.timeLogUpdated = new EventEmitter();
  }

  public triggerTimeLogDeleted(id: number = -1) {
    this.timeLogDeleted.emit(id);
  }

  public triggerTimeLogUpdated(id: number = -1) {
    this.timeLogUpdated.emit(id);
  }
}

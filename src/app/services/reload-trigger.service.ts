import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReloadTriggerService {
  public timeLogDeleted: EventEmitter<number>;

  constructor() {
    this.timeLogDeleted = new EventEmitter();
  }

  public triggerTimeLogDeleted(id: number = -1) {
    this.timeLogDeleted.emit(id);
  }
}

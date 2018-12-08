import { EventEmitter, Injectable } from '@angular/core';
import { TimeLog } from '../model/time-log.interface';

@Injectable({
  providedIn: 'root'
})
export class ReloadTriggerService {
  public timeLogAdded: EventEmitter<TimeLog>;
  public timeLogDeleted: EventEmitter<number>;
  public timeLogUpdated: EventEmitter<number>;

  constructor() {
    this.timeLogAdded = new EventEmitter();
    this.timeLogDeleted = new EventEmitter();
    this.timeLogUpdated = new EventEmitter();
  }

  public triggerTimeLogAdded(timelog: TimeLog) {
    this.timeLogAdded.emit(timelog);
  }

  public triggerTimeLogDeleted(id: number = -1) {
    this.timeLogDeleted.emit(id);
  }

  public triggerTimeLogUpdated(id: number = -1) {
    this.timeLogUpdated.emit(id);
  }
}

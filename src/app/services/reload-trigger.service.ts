import { EventEmitter, Injectable } from '@angular/core';
import { TimeLog } from '../model/time-log.interface';

@Injectable({
  providedIn: 'root'
})
export class ReloadTriggerService {
  public timeLogAdded: EventEmitter<TimeLog>;
  public timeLogUpdated: EventEmitter<TimeLog>;
  public timeLogDeleted: EventEmitter<number>;

  constructor() {
    this.timeLogAdded = new EventEmitter();
    this.timeLogDeleted = new EventEmitter();
    this.timeLogUpdated = new EventEmitter();
  }

  public triggerTimeLogAdded(timelog: TimeLog) {
    this.timeLogAdded.emit(timelog);
  }

  public triggerTimeLogUpdated(timelog: TimeLog) {
    this.timeLogUpdated.emit(timelog);
  }

  public triggerTimeLogDeleted(id: number) {
    this.timeLogDeleted.emit(id);
  }
}

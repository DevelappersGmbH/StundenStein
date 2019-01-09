import { Injectable, EventEmitter } from '@angular/core';
import { DataService } from '../data/data.service';
import { UserService } from '../user/user.service';
import { Observable, forkJoin } from 'rxjs';
import { isNull, isUndefined } from 'util';
import { TimeTracker } from 'src/app/model/time-tracker.interface';
import { ReloadTriggerService } from '../reload-trigger.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private reloadTriggerService: ReloadTriggerService,
    private errorService: ErrorService
  ) {
    this.reTrackingInProgress = new EventEmitter();
    this.trackerModified = new EventEmitter();
  }

  public reTrackingInProgress: EventEmitter<boolean>;
  public trackerModified: EventEmitter<TimeTracker>;

  private triggerInProgress(inProgress: boolean) {
    this.reTrackingInProgress.emit(inProgress);
  }

  track(timeTracker: Partial<TimeTracker>) {
    this.triggerInProgress(true);
    if (isUndefined(timeTracker) || isNull(timeTracker) || !isUndefined(timeTracker.id)) {
      console.error('Tried to start invalid time tracker.');
    }
    const calls: Observable<any>[] = [
      this.dataService.getProjects(),
      this.dataService.getIssues()
    ];
    forkJoin(calls).subscribe(x => {
      this.dataService.getTimeTrackerByUserId(this.userService.getUser().id).subscribe(t => {
        if (!isNull(t) && !(isUndefined(t))) {
          // tracker is running
          this.stopAndStart(t, timeTracker);
        } else {
          // no tracker is running
          this.start(timeTracker);
        }
      });
    });
  }

  private stopAndStart(toStop: TimeTracker, toStart: Partial<TimeTracker>) {
    this.dataService.stopTimeTracker(toStop).subscribe( logCreated => {
      if (logCreated === undefined || logCreated === null) {
        this.errorService.errorDialog('Couldn\'t stop time tracker');
      } else {
        this.reloadTriggerService.triggerTimeLogAdded(logCreated);
        this.start(toStart);
      }
    }, error => {
      this.errorService.errorDialog('Couldn\'t stop time tracker');
    }
    );
  }

  private start(timeTracker: Partial<TimeTracker>) {
    this.dataService.startTimeTracker(timeTracker).subscribe(
      returnedTracker => {
        this.trackerModified.emit(returnedTracker);
        this.triggerInProgress(false);
      }
     );
  }

}

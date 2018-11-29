import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
import { UserService } from '../user/user.service';
import { Observable, forkJoin } from 'rxjs';
import { isNull, isUndefined } from 'util';
import { TimeTracker } from 'src/app/model/time-tracker.interface';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  constructor(
    private dataService: DataService ,
    private userService: UserService
  ) { }

  public reloadNeeded = false;

  track(timeTracker: Partial<TimeTracker>) {
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
        }
      });
    });
  }

  private stopAndStart(toStop: TimeTracker, toStart: Partial<TimeTracker>) {
    this.dataService.stopTimeTracker(toStop).subscribe( data => {
      if (data === false) {
        console.error('Couldn\'t stop time tracker');
      } else {
        this.start(toStart);
      }
    }, error => {
      console.error('Couldn\'t stop time tracker');
    }
    );
  }

  private start(timeTracker: Partial<TimeTracker>) {
    this.dataService.startTimeTracker(timeTracker).subscribe(
      returnedTracker => {
        this.reloadNeeded = true;
      }
     );
  }

}

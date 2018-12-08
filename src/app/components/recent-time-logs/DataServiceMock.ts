import { User } from 'src/app/model/user.interface';
import { Project } from 'src/app/model/project.interface';
import { TimeLog } from 'src/app/model/time-log.interface';
import { Observable, of } from 'rxjs';
const mockUser = {
  name: "TestUser",
  id: 99
};

const mockProject = {
  id: 2,
  name: "TestProject",
  color: "Red"
};

const mockIssue = {
  id: 3,
  subject: "TestIssue",
  tracker: "TestTracker",
  project: mockProject,
  assignedTo: mockUser
};

const mockTimeLog= {
  id: 1,
  timeStarted: new Date("October 1, 2018 11:00:00"),
  timeStopped: new Date("October 1, 2018 16:00:00"),
  comment: "Testcomment 1",
  timeInHours: 5,
  booked: true,
  hourGlassTimeBookingId: 1,
  redmineTimeEntryId: 1,
  billable: true,
  issue: mockIssue,
  project: mockProject,
  user: mockUser
};

const mockTimeLogs: TimeLog[] = new Array();
mockTimeLogs.push(mockTimeLog);

export class DataServiceMock {
   
  public getTimeLogs(id: number): Observable<TimeLog[]> {
    return of(mockTimeLogs);
  }
}
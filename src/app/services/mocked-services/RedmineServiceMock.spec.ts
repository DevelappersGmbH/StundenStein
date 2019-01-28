import { Observable, of } from 'rxjs';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';

export const mockRedmineProjects: RedmineProject[] = new Array();
const mockRedmineProject = {
  id: 1,
  name: 'name',
  identifier: 'identifier',
  description: 'description',
  parent: {
    id: 2,
    name: 'name2'
  },
  status: 1,
  created_on: '12.12.12',
  updated_on: '13.13.13'
};
mockRedmineProjects.push(mockRedmineProject);

export class RedmineServiceMock {
  getProjects(): Observable<RedmineProject[]> {
    return of(mockRedmineProjects);
  }
}

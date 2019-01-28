import { mockRedmineProjects } from './../mocked-services/RedmineServiceMock.spec';
import { CookieService } from 'ngx-cookie-service';
import { TestBed } from '@angular/core/testing';

import { DataService } from './data.service';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RedmineService } from '../redmine/redmine.service';
import { RedmineServiceMock } from '../mocked-services/RedmineServiceMock.spec';
import { RedmineMapper } from 'src/app/model/mappers/redmine-mapper';
import { ColorService } from '../color/color.service';
import { UserService } from '../user/user.service';

describe('DataService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CookieService, DatePipe,
        { provide: RedmineService, useClass: RedmineServiceMock }]
})
  );

  it('should be created', () => {
    const service: DataService = TestBed.get(DataService);
    expect(service).toBeTruthy();
  });

  it('should get Projects', () => {
    const service: DataService = TestBed.get(DataService);
    const mapper: RedmineMapper = new RedmineMapper(new ColorService(), new UserService());
    let projectArray = [{
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
    }];
    expect(service.getProjects()).toEqual(mapper.mapRedmineProjectArrayToProjectArray(projectArray));
  });
});

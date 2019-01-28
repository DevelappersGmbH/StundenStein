import { ColorService } from '../color/color.service';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from './data.service';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { RedmineMapper } from 'src/app/model/mappers/redmine-mapper';
import { RedmineService } from '../redmine/redmine.service';
import { RedmineServiceMock } from '../mocked-services/RedmineServiceMock.spec';
import { TestBed } from '@angular/core/testing';
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

  it('should get Projects correctly', () => {
    const service: DataService = TestBed.get(DataService);
    const mapper: RedmineMapper = new RedmineMapper(new ColorService(), new UserService());
    service.getProjects().subscribe(data => {
      expect(data).toEqual(mapper.mapRedmineProjectArrayToProjectArray(RedmineServiceMock.mockRedmineProjects));
    });
  });

  it('Should get Issues correctly', () => {
    const service: DataService = TestBed.get(DataService);
    const mapper: RedmineMapper = new RedmineMapper(new ColorService(), new UserService());
    service.getIssues().subscribe(data => {
      expect(data).toEqual(mapper.mapRedmineIssueArrayToIssueArray(
        RedmineServiceMock.mockRedmineIssues,
        mapper.mapRedmineProjectArrayToProjectArray(RedmineServiceMock.mockRedmineProjects)));
    });
  });
});

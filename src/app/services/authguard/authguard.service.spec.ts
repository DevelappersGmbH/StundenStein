import { AuthGuard } from './authguard.service';
import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './authguard.service';
describe('AuthguardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthGuard = TestBed.get(AuthGuard);
    expect(service).toBeTruthy();
  });
});

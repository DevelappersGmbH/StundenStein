import { TestBed } from '@angular/core/testing';

import { ReloadTriggerService } from './reload-trigger.service';

describe('ReloadTriggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReloadTriggerService = TestBed.get(ReloadTriggerService);
    expect(service).toBeTruthy();
  });
});

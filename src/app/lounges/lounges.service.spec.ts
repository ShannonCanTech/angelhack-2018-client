import { TestBed } from '@angular/core/testing';

import { LoungesService } from './lounges.service';

describe('LoungesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoungesService = TestBed.get(LoungesService);
    expect(service).toBeTruthy();
  });
});

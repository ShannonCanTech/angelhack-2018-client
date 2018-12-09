import { TestBed } from '@angular/core/testing';

import { ControllerDatasetService } from './controller-dataset.service';

describe('ControllerDatasetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ControllerDatasetService = TestBed.get(ControllerDatasetService);
    expect(service).toBeTruthy();
  });
});

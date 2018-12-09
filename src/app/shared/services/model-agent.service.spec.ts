import { TestBed } from '@angular/core/testing';

import { ModelAgentService } from './model-agent.service';

describe('ModelAgentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModelAgentService = TestBed.get(ModelAgentService);
    expect(service).toBeTruthy();
  });
});

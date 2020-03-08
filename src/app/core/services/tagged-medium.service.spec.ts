import { TestBed } from '@angular/core/testing';

import { TaggedMediumService } from './tagged-medium.service';

describe('TaggedMediumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaggedMediumService = TestBed.get(TaggedMediumService);
    expect(service).toBeTruthy();
  });
});

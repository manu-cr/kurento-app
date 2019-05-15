/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KurentoService } from './kurento.service';

describe('Service: Kurento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KurentoService]
    });
  });

  it('should ...', inject([KurentoService], (service: KurentoService) => {
    expect(service).toBeTruthy();
  }));
});

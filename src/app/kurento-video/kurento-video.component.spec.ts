/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KurentoVideoComponent } from './kurento-video.component';

describe('KurentoVideoComponent', () => {
  let component: KurentoVideoComponent;
  let fixture: ComponentFixture<KurentoVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KurentoVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KurentoVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

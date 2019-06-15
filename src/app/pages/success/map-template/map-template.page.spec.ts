import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTemplatePage } from './map-template.page';

describe('MapTemplatePage', () => {
  let component: MapTemplatePage;
  let fixture: ComponentFixture<MapTemplatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapTemplatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

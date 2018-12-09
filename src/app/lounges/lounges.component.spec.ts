import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoungesComponent } from './lounges.component';

describe('LoungesComponent', () => {
  let component: LoungesComponent;
  let fixture: ComponentFixture<LoungesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoungesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoungesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

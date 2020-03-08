import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagUpdateModalComponent } from './tag-update-modal.component';

describe('TagUpdateModalComponent', () => {
  let component: TagUpdateModalComponent;
  let fixture: ComponentFixture<TagUpdateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagUpdateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

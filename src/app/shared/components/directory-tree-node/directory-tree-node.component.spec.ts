import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryTreeNodeComponent } from './directory-tree-node.component';

describe('DirectoryTreeNodeComponent', () => {
  let component: DirectoryTreeNodeComponent;
  let fixture: ComponentFixture<DirectoryTreeNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryTreeNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

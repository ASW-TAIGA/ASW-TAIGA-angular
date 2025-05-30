import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterIssuesModalComponent } from './filter-issues-modal.component';

describe('FilterIssuesModalComponent', () => {
  let component: FilterIssuesModalComponent;
  let fixture: ComponentFixture<FilterIssuesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterIssuesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterIssuesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

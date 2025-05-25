import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDetailDescComponent } from './issue-detail-desc.component';

describe('IssueDetailDescComponent', () => {
  let component: IssueDetailDescComponent;
  let fixture: ComponentFixture<IssueDetailDescComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueDetailDescComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueDetailDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

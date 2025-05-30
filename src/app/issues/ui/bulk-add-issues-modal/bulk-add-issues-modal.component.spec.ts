import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAddIssuesModalComponent } from './bulk-add-issues-modal.component';

describe('BulkAddIssuesModalComponent', () => {
  let component: BulkAddIssuesModalComponent;
  let fixture: ComponentFixture<BulkAddIssuesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkAddIssuesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkAddIssuesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

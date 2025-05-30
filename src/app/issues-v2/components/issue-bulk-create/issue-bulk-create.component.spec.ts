import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueBulkCreateComponent } from './issue-bulk-create.component';

describe('IssueBulkCreateComponent', () => {
  let component: IssueBulkCreateComponent;
  let fixture: ComponentFixture<IssueBulkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueBulkCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueBulkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

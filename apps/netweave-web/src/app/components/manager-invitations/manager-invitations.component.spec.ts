import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerInvitationsComponent } from './manager-invitations.component';

describe('ManagerInvitationsComponent', () => {
  let component: ManagerInvitationsComponent;
  let fixture: ComponentFixture<ManagerInvitationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerInvitationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerInvitationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

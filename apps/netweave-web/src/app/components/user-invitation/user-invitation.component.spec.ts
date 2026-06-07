import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInvitationComponent } from './user-invitation.component';

describe('UserInvitationComponent', () => {
  let component: UserInvitationComponent;
  let fixture: ComponentFixture<UserInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInvitationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInvitationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberListItemComponent } from './member-list-item.component';

describe('MemberListItemComponent', () => {
  let fixture: ComponentFixture<MemberListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberListItemComponent);
  });

  const text = (selector: string) =>
    (fixture.nativeElement as HTMLElement)
      .querySelector(selector)
      ?.textContent?.trim();

  it("shows the email and the organization's name", () => {
    fixture.componentRef.setInput('member', {
      id: 1,
      name: 'Acme e.V.',
      email: 'nt@example.com',
    });
    fixture.detectChanges();

    expect(text('.member-list-item__email')).toBe('nt@example.com');
    expect(text('.member-list-item__name')).toBe('Acme e.V.');
  });

  it('says so when the member has no email', () => {
    fixture.componentRef.setInput('member', {
      id: 1,
      name: 'Acme e.V.',
      email: null,
    });
    fixture.detectChanges();

    expect(text('.member-list-item__email')).toBe('Keine E-Mail-Adresse');
  });
});

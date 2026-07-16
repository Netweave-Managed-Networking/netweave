import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSidebar } from '@netweave/icons';
import { TopNavComponent } from './top-nav.component';

@Component({
  selector: 'app-user-menu',
  template: '<div class="mock-user-menu"></div>',
})
class MockUserMenuComponent {}

describe('TopNavComponent', () => {
  let fixture: ComponentFixture<TopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavComponent],
    })
      .overrideComponent(TopNavComponent, {
        set: { imports: [MockUserMenuComponent, IconSidebar] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopNavComponent);
    fixture.componentRef.setInput('sideNavId', 'sidebar');
    fixture.detectChanges();
  });

  it('renders the navigation shell and title for the user', () => {
    const nav = fixture.nativeElement.querySelector('.top-nav');
    const title = fixture.nativeElement.querySelector('.top-nav__title');

    expect(nav).toBeTruthy();
    expect(title?.textContent).toContain('netweave');
  });

  it('shows a toggle button that targets the provided sidebar id', () => {
    const toggle = fixture.nativeElement.querySelector(
      'label[aria-label="Sidebar öffnen"]',
    );

    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('for')).toBe('sidebar');
  });

  it('updates the toggle target when the sidebar id input changes', () => {
    fixture.componentRef.setInput('sideNavId', 'secondary-sidebar');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      'label[aria-label="Sidebar öffnen"]',
    );

    expect(toggle.getAttribute('for')).toBe('secondary-sidebar');
  });

  it('renders the user menu placeholder', () => {
    const userMenu = fixture.nativeElement.querySelector(
      'app-user-menu .mock-user-menu',
    );

    expect(userMenu).toBeTruthy();
  });

  it('keeps the toggle accessible when the sidebar id is empty', () => {
    fixture.componentRef.setInput('sideNavId', '');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      'label[aria-label="Sidebar öffnen"]',
    );

    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('for')).toBe('');
  });
});

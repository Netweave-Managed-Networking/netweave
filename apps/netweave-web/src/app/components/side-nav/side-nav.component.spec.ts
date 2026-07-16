import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HasSideNavId } from '../../interfaces/has-side-nav-id.interface';
import { SideNavComponent } from './side-nav.component';

describe('SideNavComponent (DOM behavior)', () => {
  @Component({
    imports: [SideNavComponent],
    template: `
      <app-side-nav [sideNavId]="sideNavId()">
        <div ngProjectAs="top-nav" class="test-top">TOP SLOT</div>
        <div ngProjectAs="main" class="test-main">MAIN SLOT</div>
      </app-side-nav>
    `,
  })
  class HostComponent implements HasSideNavId {
    public sideNavId = () => 'sidenav-1';
  }

  let hostFixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavComponent, FormsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();
  });

  it('creates the host and the side-nav component', () => {
    const hostEl = hostFixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('app-side-nav')).toBeTruthy();
  });

  it('binds `sideNavId` to the drawer input `id` and the overlay `for`', () => {
    const root = hostFixture.nativeElement as HTMLElement;
    const input = root.querySelector('input.drawer-toggle') as HTMLInputElement;
    const label = root.querySelector(
      'label.drawer-overlay',
    ) as HTMLLabelElement;

    expect(input).toBeTruthy();
    expect(label).toBeTruthy();
    expect(input.id).toBe('sidenav-1');
    expect(label.getAttribute('for')).toBe('sidenav-1');
  });

  it('toggles the drawer checkbox when the overlay label is clicked', async () => {
    const root = hostFixture.nativeElement as HTMLElement;
    const input = root.querySelector('input.drawer-toggle') as HTMLInputElement;
    const label = root.querySelector(
      'label.drawer-overlay',
    ) as HTMLLabelElement;

    expect(input.checked).toBe(false);

    label.click();
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(input.checked).toBe(true);

    label.click();
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(input.checked).toBe(false);
  });

  it('renders projected `top-nav` and `main` content', () => {
    const root = hostFixture.nativeElement as HTMLElement;
    const top = root.querySelector('.test-top');
    const main = root.querySelector('.test-main');

    expect(top?.textContent?.trim()).toBe('TOP SLOT');
    expect(main?.textContent?.trim()).toBe('MAIN SLOT');
  });

  it('shows primary menu buttons (Home) in the DOM', () => {
    const debugBtn = hostFixture.debugElement.query(
      By.css('button[data-tip="Home"]'),
    );
    expect(debugBtn).toBeTruthy();
  });

  it('does not render admin section for a default/non-admin context', () => {
    const root = hostFixture.nativeElement as HTMLElement;
    const adminSection = root.querySelector('.sidenav__menu--bottom');
    expect(adminSection).toBeNull();
  });
});

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { UserRemoveComponent } from './user-remove.component';

describe('UserRemoveComponent', () => {
  let http: HttpClient;
  const mockToRemove = {
    id: 8,
    email: 'editor@example.de',
    role: 'editor',
  } as UserDTO;

  beforeEach(async () => {
    // JSDOM does not support dialog APIs
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UserRemoveComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  function create() {
    const fixture = TestBed.createComponent(UserRemoveComponent);

    fixture.componentRef.setInput('toRemove', mockToRemove);
    fixture.detectChanges();
    return fixture;
  }

  it('opens modal via button click (mocked dialog API)', () => {
    const fixture = create();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector(
      '.user-remove__modal',
    );
    const showModalSpy = vi.spyOn(dialog, 'showModal');

    const button = fixture.debugElement.query(By.css('.user-remove__open'));
    button.nativeElement.click();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });

  it('shows the correct user in the modal', () => {
    const fixture = create();

    const button = fixture.debugElement.query(By.css('.user-remove__open'));
    button.nativeElement.click();
    fixture.detectChanges();

    const modalText = fixture.nativeElement.querySelector(
      '.user-remove__modal-box',
    ).textContent;

    expect(modalText).toContain(mockToRemove.email);
  });

  it('disables the open button when disabled input is true', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.user-remove__open');

    expect(button.disabled).toBe(true);
  });

  it('submits form, calls the API, emits the removed user, closes the modal', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    const dialog = fixture.nativeElement.querySelector('.user-remove__modal');
    const httpSpy = vi.spyOn(http, 'delete').mockReturnValue(of(true));
    const emitSpy = vi.spyOn(component.removed, 'emit');
    const closeSpy = vi.spyOn(dialog, 'close');

    const removeBtn = fixture.nativeElement.querySelector(
      '.user-remove__confirm',
    );
    removeBtn.click();
    fixture.detectChanges();

    expect(httpSpy).toHaveBeenCalledWith(`/api/users/${mockToRemove.id}`);
    expect(emitSpy).toHaveBeenCalledWith(mockToRemove);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('shows an error message and keeps the modal open when the request fails', () => {
    const fixture = create();

    vi.spyOn(http, 'delete').mockReturnValue(throwError(() => new Error()));

    const removeBtn = fixture.nativeElement.querySelector(
      '.user-remove__confirm',
    );
    removeBtn.click();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-error');
    expect(alert).toBeTruthy();
  });
});

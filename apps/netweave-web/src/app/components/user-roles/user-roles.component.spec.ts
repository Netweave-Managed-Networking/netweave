import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UserDTO } from '@netweave/api-types';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { UserRolesComponent } from './user-roles.component';

const admin: UserDTO = {
  id: 1,
  email: 'admin@example.de',
  role: 'admin',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const editor: UserDTO = {
  id: 2,
  email: 'editor@example.de',
  role: 'editor',
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
};

describe('UserRolesComponent', () => {
  let http: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRolesComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
    TestBed.inject(AuthService).me.set(admin);
  });

  async function create() {
    vi.spyOn(http, 'get').mockReturnValue(of([admin, editor]));

    const fixture = TestBed.createComponent(UserRolesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function rows(fixture: Awaited<ReturnType<typeof create>>) {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.user-roles__row'),
    ) as HTMLElement[];
  }

  function select(row: HTMLElement) {
    return row.querySelector('.user-roles__select') as HTMLSelectElement;
  }

  function saveButton(row: HTMLElement) {
    return row.querySelector('.user-roles__save') as HTMLButtonElement;
  }

  it('shows the current role of every user', async () => {
    const fixture = await create();

    const [adminRow, editorRow] = rows(fixture);
    expect(rows(fixture)).toHaveLength(2);
    expect(select(adminRow).value).toBe('admin');
    expect(select(editorRow).value).toBe('editor');
  });

  it('does not allow changing the own role', async () => {
    const fixture = await create();

    const [adminRow] = rows(fixture);
    expect(select(adminRow).disabled).toBe(true);
    expect(saveButton(adminRow).disabled).toBe(true);
  });

  it('enables saving only after a different role was selected', async () => {
    const fixture = await create();
    const [, editorRow] = rows(fixture);

    expect(saveButton(editorRow).disabled).toBe(true);

    select(editorRow).value = 'viewer';
    select(editorRow).dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(saveButton(editorRow).disabled).toBe(false);
  });

  it('saves the new role and shows a success toast', async () => {
    const fixture = await create();
    const patchSpy = vi
      .spyOn(http, 'patch')
      .mockReturnValue(of({ ...editor, role: 'viewer' }));
    const [, editorRow] = rows(fixture);

    select(editorRow).value = 'viewer';
    select(editorRow).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    saveButton(editorRow).click();
    fixture.detectChanges();

    expect(patchSpy).toHaveBeenCalledWith('/api/users/2/role', {
      role: 'viewer',
    });
    expect(select(rows(fixture)[1]).value).toBe('viewer');
    expect(saveButton(rows(fixture)[1]).disabled).toBe(true);

    const toast = fixture.nativeElement.querySelector('.user-roles__toast');
    expect(toast.querySelector('.alert-success')).toBeTruthy();
    expect(toast.textContent).toContain('Viewer');
  });

  it('shows an error toast when saving fails', async () => {
    const fixture = await create();
    vi.spyOn(http, 'patch').mockReturnValue(throwError(() => new Error()));
    const [, editorRow] = rows(fixture);

    select(editorRow).value = 'admin';
    select(editorRow).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    saveButton(editorRow).click();
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.user-roles__toast');
    expect(toast.querySelector('.alert-error')).toBeTruthy();
  });
});

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberListItemDTO } from '@netweave/api-types';
import { MembersComponent } from './members.component';

const URL = '/api/members';

describe('MembersComponent', () => {
  let fixture: ComponentFixture<MembersComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MembersComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const compiled = () => fixture.nativeElement as HTMLElement;

  const flush = async (
    items: MemberListItemDTO[],
    { page = 1, total = items.length, search = null as string | null } = {},
  ) => {
    const req = httpTesting.expectOne(
      (r) => r.method === 'GET' && r.url === URL,
    );
    expect(req.request.params.get('page')).toBe(String(page));
    expect(req.request.params.get('pageSize')).toBe('20');
    expect(req.request.params.get('search')).toBe(search);
    req.flush({ items, page, pageSize: 20, total });
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const names = () =>
    Array.from(
      compiled().querySelectorAll('.members__item .member-list-item__name'),
    ).map((el) => el.textContent?.trim());

  // no whenStable, it would wait for the request to be flushed
  const click = (selector: string) => {
    compiled().querySelector<HTMLButtonElement>(selector)?.click();
    fixture.detectChanges();
  };

  it('shows a spinner while loading', async () => {
    expect(compiled().querySelector('.members__loading')).toBeTruthy();
    await flush([]);
  });

  it('lists the name of every member in the order the API delivers', async () => {
    await flush([
      { id: 1, name: 'Acme e.V.', email: null },
      { id: 2, name: 'Beta gGmbH', email: null },
    ]);

    expect(names()).toEqual(['Acme e.V.', 'Beta gGmbH']);
  });

  it('shows a legend for the email and organization columns', async () => {
    await flush([{ id: 1, name: 'Acme e.V.', email: null }]);

    const legend = Array.from(
      compiled().querySelectorAll('.members__legend [role="columnheader"]'),
    ).map((el) => el.textContent?.trim());
    expect(legend).toEqual(['E-Mail', 'Organisation']);
    expect(
      compiled().querySelectorAll('.members__item [role="cell"]').length,
    ).toBe(legend.length);
  });

  it('shows no pagination when all members fit on one page', async () => {
    await flush([{ id: 1, name: 'Acme e.V.', email: null }]);

    expect(compiled().querySelector('.members__pagination')).toBeNull();
  });

  it('pages through the members', async () => {
    await flush([{ id: 1, name: 'Acme e.V.', email: null }], { total: 21 });
    expect(compiled().querySelector('.members__pagination')).toBeTruthy();
    expect(
      compiled().querySelector<HTMLButtonElement>('.members__prev-page')
        ?.disabled,
    ).toBe(true);

    click('.members__next-page');
    await flush([{ id: 21, name: 'Zeta e.V.', email: null }], {
      page: 2,
      total: 21,
    });

    expect(names()).toEqual(['Zeta e.V.']);
    expect(
      compiled().querySelector<HTMLButtonElement>('.members__next-page')
        ?.disabled,
    ).toBe(true);
  });

  describe('search', () => {
    // real timers: whenStable never settles with fake ones
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const input = (value: string) => {
      const el = compiled().querySelector<HTMLInputElement>(
        '.members__search-input',
      ) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    // types into the search bar and lets the debounce pass; no whenStable, it would wait for the request
    const type = async (value: string) => {
      input(value);
      await wait(350);
      fixture.detectChanges();
    };

    it('loads the members matching the trimmed search, starting on the first page', async () => {
      await flush([{ id: 1, name: 'Acme e.V.', email: null }], { total: 21 });
      click('.members__next-page');
      await flush([{ id: 21, name: 'Zeta e.V.', email: null }], {
        page: 2,
        total: 21,
      });

      await type('  acme ');
      await flush([{ id: 1, name: 'Acme e.V.', email: null }], {
        search: 'acme',
      });

      expect(names()).toEqual(['Acme e.V.']);
    });

    it('waits for a pause in typing before searching', async () => {
      await flush([]);

      input('ac');
      await wait(100);
      fixture.detectChanges();
      httpTesting.expectNone((r) => r.url === URL);

      await type('acme');
      await flush([], { search: 'acme' });
    });

    it('says so when nothing matches the search', async () => {
      await flush([{ id: 1, name: 'Acme e.V.', email: null }]);

      await type('xyz');
      await flush([], { search: 'xyz' });

      expect(
        compiled().querySelector('.members__empty')?.textContent,
      ).toContain('Keine Netzwerkteilnehmer zu „xyz“ gefunden.');
    });
  });

  it('says so when there are no members yet', async () => {
    await flush([]);

    expect(compiled().querySelector('.members__table')).toBeNull();
    expect(compiled().querySelector('.members__empty')).toBeTruthy();
  });

  it('shows an error when loading fails', async () => {
    httpTesting
      .expectOne((r) => r.url === URL)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled().querySelector('.members__error')).toBeTruthy();
    expect(compiled().querySelector('.members__table')).toBeNull();
  });
});

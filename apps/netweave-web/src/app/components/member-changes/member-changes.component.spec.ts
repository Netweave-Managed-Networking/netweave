import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberChangesSinceMatchingDTO } from '@netweave/api-types';
import { MemberChangesComponent } from './member-changes.component';

const URL = '/api/matchings/member-changes';

describe('MemberChangesComponent', () => {
  let fixture: ComponentFixture<MemberChangesComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberChangesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberChangesComponent);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const text = (selector: string) =>
    (
      fixture.nativeElement.querySelector(selector) as HTMLElement | null
    )?.textContent?.trim();

  const flush = (changes: MemberChangesSinceMatchingDTO) => {
    httpTesting.expectOne({ method: 'GET', url: URL }).flush(changes);
    fixture.detectChanges();
  };

  it('shows how many organizations are new or updated since the last matching, with their names', () => {
    flush({
      since: new Date('2026-10-01T10:00:00Z'),
      newMembers: [
        { id: 4, name: 'Neu e.V.' },
        { id: 5, name: 'Auch neu gGmbH' },
      ],
      updatedMembers: [{ id: 2, name: 'Alt e.V.' }],
    });

    expect(text('.member-changes__new-count')).toBe('2');
    expect(text('.member-changes__new-names')).toBe('Neu e.V., Auch neu gGmbH');
    expect(text('.member-changes__updated-count')).toBe('1');
    expect(text('.member-changes__updated-names')).toBe('Alt e.V.');
  });

  it('shows zeros without name lists when nothing changed', () => {
    flush({
      since: new Date('2026-10-01T10:00:00Z'),
      newMembers: [],
      updatedMembers: [],
    });

    expect(text('.member-changes__new-count')).toBe('0');
    expect(text('.member-changes__updated-count')).toBe('0');
    expect(text('.member-changes__new-names')).toBeUndefined();
    expect(text('.member-changes__updated-names')).toBeUndefined();
  });

  it('says so when no matching was calculated yet', () => {
    flush({
      since: null,
      newMembers: [{ id: 1, name: 'A' }],
      updatedMembers: [],
    });

    expect(text('.member-changes__new-desc')).toContain(
      'noch kein Matching berechnet',
    );
  });

  it('shows nothing when loading fails', () => {
    httpTesting
      .expectOne({ method: 'GET', url: URL })
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.member-changes')).toBeNull();
  });

  it('loads the changes again on reload, e.g. after a matching run finished', () => {
    flush({
      since: new Date('2026-10-01T10:00:00Z'),
      newMembers: [{ id: 4, name: 'Neu e.V.' }],
      updatedMembers: [],
    });

    fixture.componentInstance.reload();
    flush({
      since: new Date('2026-10-15T10:00:00Z'),
      newMembers: [],
      updatedMembers: [],
    });

    expect(text('.member-changes__new-count')).toBe('0');
  });
});

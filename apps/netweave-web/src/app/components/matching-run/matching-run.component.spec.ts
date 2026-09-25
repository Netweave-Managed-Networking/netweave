import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchingRunDTO } from '@netweave/api-types';
import { MatchingRunComponent } from './matching-run.component';

describe('MatchingRunComponent', () => {
  let fixture: ComponentFixture<MatchingRunComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingRunComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchingRunComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const button = () =>
    fixture.nativeElement.querySelector(
      '.matching-run__button',
    ) as HTMLButtonElement;
  const result = () =>
    (
      fixture.nativeElement.querySelector('.matching-run__result') as
        | HTMLElement
        | undefined
    )?.textContent?.trim();

  const clickAndExpectRequest = () => {
    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    return httpTesting.expectOne({
      method: 'POST',
      url: '/api/matchings/runs',
    });
  };

  it('starts a run and shows how many matchings were calculated', async () => {
    clickAndExpectRequest().flush({
      id: 7,
      matchingCount: 3,
    } as MatchingRunDTO);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(button().disabled).toBe(false);
    expect(result()).toContain('#7');
    expect(result()).toContain('3 Matchings');
  });

  it('tells when a run is already in progress', async () => {
    clickAndExpectRequest().flush(null, {
      status: 409,
      statusText: 'Conflict',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result()).toBe('Es läuft bereits eine Berechnung.');
  });

  it('shows an error when the run fails', async () => {
    clickAndExpectRequest().flush(null, {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result()).toBe('Berechnung fehlgeschlagen.');
  });
});

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  InvitationTokenDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
} from '@netweave/api-types';
import { MemberQuestionsComponent } from './member-questions.component';

const emptyResourcesRequirements = RESOURCE_REQUIREMENT_CATEGORIES.map(
  (category) => ({ category, resources: null, requirements: null }),
);

describe('MemberQuestionsComponent', () => {
  let component: MemberQuestionsComponent;
  let fixture: ComponentFixture<MemberQuestionsComponent>;
  let httpTesting: HttpTestingController;

  const configure = async (token: string) => {
    await TestBed.configureTestingModule({
      imports: [MemberQuestionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ token }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberQuestionsComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', async () => {
    await configure('some-token');
    expect(component).toBeTruthy();
  });

  it('requests the invitation for the token from the route and shows the email in a disabled field', async () => {
    await configure('some-token');
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/invitations/by-token/some-token',
    });

    const mockInvitation: InvitationTokenDTO = {
      email: 'nt@example.com',
      member: null,
    };
    req.flush(mockInvitation);

    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input#email',
    ) as HTMLInputElement;

    expect(input.value).toBe(mockInvitation.email);
    expect(input.disabled).toBe(true);
  });

  it('shows an empty, disabled field when the token is invalid', async () => {
    await configure('invalid-token');
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/invitations/by-token/invalid-token',
    });
    req.flush(null, { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input#email',
    ) as HTMLInputElement;

    expect(input.value).toBe('');
    expect(input.disabled).toBe(true);
  });

  const query = <T extends Element>(selector: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(selector) as T;

  const typeInto = (selector: string, value: string) => {
    const input = query<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const loadInvitation = async (invitation: InvitationTokenDTO) => {
    await configure('some-token');
    fixture.detectChanges();

    httpTesting
      .expectOne({
        method: 'GET',
        url: '/api/invitations/by-token/some-token',
      })
      .flush(invitation);

    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('shows organization and contact fields inside the "Allgemeine Daten" fieldset, and the email below it', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    const fieldset = query<HTMLFieldSetElement>('fieldset');

    expect(fieldset.querySelector('legend')?.textContent?.trim()).toBe(
      'Allgemeine Daten',
    );
    expect(fieldset.querySelector('input#name')).toBeTruthy();
    expect(fieldset.querySelector('input#contact')).toBeTruthy();
    expect(fieldset.querySelector('input#email')).toBeNull();
    expect(query('input#email')).toBeTruthy();
  });

  it('prefills the fields with previously saved member data', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      member: {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        resourcesRequirements: [],
        cultureWeights: [],
      },
    });

    expect(query<HTMLInputElement>('input#name').value).toBe('Acme e.V.');
    expect(query<HTMLInputElement>('input#contact').value).toBe(
      'Erika Musterfrau',
    );
  });

  it('saves organization name and contact for the token', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    typeInto('input#name', 'Acme e.V.');
    typeInto('input#contact', 'Erika Musterfrau');
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne({
      method: 'PUT',
      url: '/api/members/by-token/some-token',
    });
    expect(req.request.body).toEqual({
      name: 'Acme e.V.',
      contact: 'Erika Musterfrau',
      resourcesRequirements: emptyResourcesRequirements,
      cultureWeights: [],
    });
    req.flush(req.request.body);

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Gespeichert.',
    );
  });

  it('sends an empty contact as null', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    typeInto('input#name', 'Acme e.V.');
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne('/api/members/by-token/some-token');
    expect(req.request.body).toEqual({
      name: 'Acme e.V.',
      contact: null,
      resourcesRequirements: emptyResourcesRequirements,
      cultureWeights: [],
    });
    req.flush(req.request.body);
  });

  it('disables saving while the organization name is empty', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    expect(
      query<HTMLButtonElement>('button.member-questions__submit').disabled,
    ).toBe(true);
  });

  it('shows an error when saving fails', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    typeInto('input#name', 'Acme e.V.');
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    httpTesting
      .expectOne('/api/members/by-token/some-token')
      .flush(null, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Speichern fehlgeschlagen.',
    );
  });

  it('disables saving when the token is invalid', async () => {
    await configure('invalid-token');
    fixture.detectChanges();

    httpTesting
      .expectOne('/api/invitations/by-token/invalid-token')
      .flush(null, { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    typeInto('input#name', 'Acme e.V.');
    fixture.detectChanges();

    expect(
      query<HTMLButtonElement>('button.member-questions__submit').disabled,
    ).toBe(true);
  });
  it('shows a resources and a requirements textarea with description for each of the 7 categories', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    const categories = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'fieldset.member-questions__category',
    );

    expect(
      Array.from(categories).map((c) =>
        c.querySelector('legend')?.textContent?.trim(),
      ),
    ).toEqual([
      'Kompetenzen',
      'Finanzielle Mittel',
      'Räumlichkeiten',
      'Flächen',
      'Geräte / physische Ausstattung',
      'Netzwerke / Beziehungen',
      'Helfende Hände',
    ]);

    for (const category of Array.from(categories)) {
      expect(
        category
          .querySelector('.member-questions__category-description')
          ?.textContent?.trim(),
      ).toBeTruthy();
      expect(category.querySelectorAll('textarea').length).toBe(2);
    }

    expect(
      query<HTMLTextAreaElement>('textarea#competencies-resources').placeholder,
    ).toBe('Beschreibe alle deine Ressourcen möglichst präzise');
    expect(
      query<HTMLTextAreaElement>('textarea#competencies-requirements')
        .placeholder,
    ).toBe('Beschreibe alle deine Bedarfe möglichst präzise');
  });

  it('prefills the textareas with previously saved resources and requirements', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      member: {
        name: 'Acme e.V.',
        contact: null,
        resourcesRequirements: [
          {
            category: 'premises',
            resources: 'Seminarraum für 20 Personen',
            requirements: null,
          },
        ],
        cultureWeights: [],
      },
    });

    expect(
      query<HTMLTextAreaElement>('textarea#premises-resources').value,
    ).toBe('Seminarraum für 20 Personen');
    expect(
      query<HTMLTextAreaElement>('textarea#premises-requirements').value,
    ).toBe('');
  });

  it('saves the resources and requirements of all categories', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    typeInto('input#name', 'Acme e.V.');
    typeInto('textarea#competencies-resources', 'Moderation');
    typeInto('textarea#land-requirements', 'Ackerfläche');
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne('/api/members/by-token/some-token');
    expect(req.request.body.resourcesRequirements).toEqual(
      emptyResourcesRequirements.map((item) => {
        if (item.category === 'competencies') {
          return { ...item, resources: 'Moderation' };
        }
        if (item.category === 'land') {
          return { ...item, requirements: 'Ackerfläche' };
        }
        return item;
      }),
    );
    req.flush(req.request.body);
  });

  const cultureTopics = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'fieldset.member-questions__culture-topic',
      ),
    );

  it('shows a priority ranker with four statements for each of the 4 culture topics', async () => {
    await loadInvitation({ email: 'nt@example.com', member: null });

    expect(
      cultureTopics().map((t) =>
        t.querySelector('legend')?.textContent?.trim(),
      ),
    ).toEqual([
      'Zusammenarbeit und Entscheidungen',
      'Umgang mit Veränderungen und Unsicherheit',
      'Einsatz von Zeit und Ressourcen',
      'Gelungene organisationsübergreifende Kooperation',
    ]);

    for (const topic of cultureTopics()) {
      expect(topic.querySelectorAll('[role="slider"]').length).toBe(4);
    }
  });

  it('saves the culture weights of answered topics only, keeping saved ones', async () => {
    const savedZ3 = [
      { itemId: 'Z3-G', weight: 10 },
      { itemId: 'Z3-I', weight: 100 },
      { itemId: 'Z3-W', weight: 45 },
      { itemId: 'Z3-S', weight: 0 },
    ] as const;

    await loadInvitation({
      email: 'nt@example.com',
      member: {
        name: 'Acme e.V.',
        contact: null,
        resourcesRequirements: [],
        cultureWeights: [...savedZ3],
      },
    });

    const firstTopic = cultureTopics()[0];
    firstTopic
      .querySelector<HTMLElement>('[role="slider"]')
      ?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne('/api/members/by-token/some-token');
    const sent: { itemId: string; weight: number }[] =
      req.request.body.cultureWeights;

    expect(sent.map(({ itemId }) => itemId)).toEqual([
      'Z1-G',
      'Z1-I',
      'Z1-W',
      'Z1-S',
      'Z3-G',
      'Z3-I',
      'Z3-W',
      'Z3-S',
    ]);
    expect(sent.slice(4)).toEqual(savedZ3);
    for (const { weight } of sent) {
      expect(Number.isInteger(weight) && weight >= 0 && weight <= 100).toBe(
        true,
      );
    }
    req.flush(req.request.body);
  });
});

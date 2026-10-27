import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  InvitationTokenDTO,
  MemberUpsertDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
} from '@netweave/api-types';
import { MemberQuestionsComponent } from './member-questions.component';

const emptyResourcesRequirements = RESOURCE_REQUIREMENT_CATEGORIES.map(
  (category) => ({ category, resources: null, requirements: null }),
);

const savedResponse = (member: MemberUpsertDTO): InvitationTokenDTO => ({
  email: 'nt@example.com',
  pendingEmail: null,
  member,
});

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

  it('requests the invitation for the token from the route and shows the email in an editable field', async () => {
    await configure('some-token');
    fixture.detectChanges();

    const req = httpTesting.expectOne({
      method: 'GET',
      url: '/api/invitations/by-token/some-token',
    });

    const mockInvitation: InvitationTokenDTO = {
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    };
    req.flush(mockInvitation);

    await fixture.whenStable();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input#email',
    ) as HTMLInputElement;

    expect(input.value).toBe(mockInvitation.email);
    expect(input.disabled).toBe(false);
  });

  it('shows an empty email field when the token is invalid', async () => {
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
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

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
      pendingEmail: null,
      member: {
        name: 'Acme e.V.',
        contact: 'Erika Musterfrau',
        email: 'nt@example.com',
        resourcesRequirements: [],
        cultureWeights: [],
        viewOfEnvironmentAnswers: [],
      },
    });

    expect(query<HTMLInputElement>('input#name').value).toBe('Acme e.V.');
    expect(query<HTMLInputElement>('input#contact').value).toBe(
      'Erika Musterfrau',
    );
  });

  it('saves organization name and contact for the token', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

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
      email: 'nt@example.com',
      resourcesRequirements: emptyResourcesRequirements,
      cultureWeights: [],
      viewOfEnvironmentAnswers: [],
    });
    req.flush(savedResponse(req.request.body));

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Gespeichert.',
    );
  });

  it('sends an empty contact as null', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

    typeInto('input#name', 'Acme e.V.');
    fixture.detectChanges();

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne('/api/members/by-token/some-token');
    expect(req.request.body).toEqual({
      name: 'Acme e.V.',
      contact: null,
      email: 'nt@example.com',
      resourcesRequirements: emptyResourcesRequirements,
      cultureWeights: [],
      viewOfEnvironmentAnswers: [],
    });
    req.flush(savedResponse(req.request.body));
  });

  describe('email', () => {
    const pendingHint = () =>
      query<HTMLElement>('.member-general-data__pending-email');

    it('shows an error and disables saving for an invalid email', async () => {
      await loadInvitation({
        email: 'nt@example.com',
        pendingEmail: null,
        member: null,
      });

      typeInto('input#name', 'Acme e.V.');
      typeInto('input#email', 'keine-email');
      query<HTMLInputElement>('input#email').dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Ungültiges Email-Format.',
      );
      expect(
        query<HTMLButtonElement>('button.member-questions__submit').disabled,
      ).toBe(true);
    });

    it('disables saving for an empty email', async () => {
      await loadInvitation({
        email: 'nt@example.com',
        pendingEmail: null,
        member: null,
      });

      typeInto('input#name', 'Acme e.V.');
      typeInto('input#email', '');
      fixture.detectChanges();

      expect(
        query<HTMLButtonElement>('button.member-questions__submit').disabled,
      ).toBe(true);
    });

    it('saves a changed email and then shows that it waits for confirmation', async () => {
      await loadInvitation({
        email: 'nt@example.com',
        pendingEmail: null,
        member: null,
      });
      expect(pendingHint()).toBeNull();

      typeInto('input#name', 'Acme e.V.');
      typeInto('input#email', ' neu@example.com ');
      fixture.detectChanges();

      query<HTMLButtonElement>('button.member-questions__submit').click();

      const req = httpTesting.expectOne('/api/members/by-token/some-token');
      expect(req.request.body.email).toBe('neu@example.com');
      req.flush({
        email: 'nt@example.com',
        pendingEmail: 'neu@example.com',
        member: req.request.body,
      });
      fixture.detectChanges();

      expect(pendingHint().textContent).toContain('neu@example.com');
      expect(pendingHint().textContent).toContain('nt@example.com');
      expect(query<HTMLInputElement>('input#email').value).toBe(
        'neu@example.com',
      );
    });

    it('shows a pending email in the field, with a hint that the current one stays valid', async () => {
      await loadInvitation({
        email: 'nt@example.com',
        pendingEmail: 'neu@example.com',
        member: {
          name: 'Acme e.V.',
          contact: null,
          email: 'nt@example.com',
          resourcesRequirements: [],
          cultureWeights: [],
          viewOfEnvironmentAnswers: [],
        },
      });

      expect(query<HTMLInputElement>('input#email').value).toBe(
        'neu@example.com',
      );
      expect(pendingHint().textContent).toContain('nt@example.com');
    });

    it.each([
      [409, 'bereits von einer anderen Organisation verwendet'],
      [503, 'Bestätigungsmail an die neue Email konnte nicht gesendet werden'],
    ])('explains why saving failed with status %d', async (status, message) => {
      await loadInvitation({
        email: 'nt@example.com',
        pendingEmail: null,
        member: null,
      });

      typeInto('input#name', 'Acme e.V.');
      typeInto('input#email', 'neu@example.com');
      fixture.detectChanges();

      query<HTMLButtonElement>('button.member-questions__submit').click();

      httpTesting
        .expectOne('/api/members/by-token/some-token')
        .flush(null, { status, statusText: 'Error' });
      fixture.detectChanges();

      expect(
        query<HTMLElement>('.member-questions__save-error').textContent,
      ).toContain(message);
    });
  });

  it('disables saving while the organization name is empty', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

    expect(
      query<HTMLButtonElement>('button.member-questions__submit').disabled,
    ).toBe(true);
  });

  it('shows an error when saving fails', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

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
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

    const categories = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'fieldset.member-resources-requirements__category',
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
          .querySelector('.member-resources-requirements__category-description')
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
      pendingEmail: null,
      member: {
        name: 'Acme e.V.',
        contact: null,
        email: 'nt@example.com',
        resourcesRequirements: [
          {
            category: 'premises',
            resources: 'Seminarraum für 20 Personen',
            requirements: null,
          },
        ],
        cultureWeights: [],
        viewOfEnvironmentAnswers: [],
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
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

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
    req.flush(savedResponse(req.request.body));
  });

  const cultureTopics = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'fieldset.member-culture__topic',
      ),
    );

  it('shows a priority ranker with four statements for each of the 4 culture topics', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

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
      pendingEmail: null,
      member: {
        name: 'Acme e.V.',
        contact: null,
        email: 'nt@example.com',
        resourcesRequirements: [],
        cultureWeights: [...savedZ3],
        viewOfEnvironmentAnswers: [],
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
    req.flush(savedResponse(req.request.body));
  });

  const viewOfEnvironmentRanges = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
        'fieldset.member-worldview__view-of-environment input[type="range"]',
      ),
    );

  it('shows the ten Umweltanschauung questions within the "Ökologische Weltanschauung" section', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: null,
    });

    const section = query<HTMLElement>('section.member-worldview');
    expect(section.querySelector('h2')?.textContent?.trim()).toBe(
      'Ökologische Weltanschauung',
    );
    expect(
      section
        .querySelector('fieldset.member-worldview__view-of-environment legend')
        ?.textContent?.trim(),
    ).toBe('Umweltanschauung');
    expect(
      section.querySelector('.member-worldview__progress')?.textContent,
    ).toMatch(/0\s+von\s+10 beantwortet/);
    expect(viewOfEnvironmentRanges().length).toBe(10);
    expect(section.textContent).toContain(
      'Die Erde ist begrenzt. Deshalb können Bevölkerung, Konsum und Produktion nicht immer weiter wachsen.',
    );
  });

  it('loads saved Umweltanschauung answers and saves changed and saved ones, leaving out unanswered', async () => {
    await loadInvitation({
      email: 'nt@example.com',
      pendingEmail: null,
      member: {
        name: 'Acme e.V.',
        contact: null,
        email: 'nt@example.com',
        resourcesRequirements: [],
        cultureWeights: [],
        viewOfEnvironmentAnswers: [
          { itemId: 'UA2', answer: 0 },
          { itemId: 'UA10', answer: 4 },
        ],
      },
    });

    const ranges = viewOfEnvironmentRanges();
    expect(ranges[1].getAttribute('aria-valuetext')).toBe('stimmt nicht');
    expect(ranges[9].getAttribute('aria-valuetext')).toBe('stimmt sehr');
    expect(ranges[0].getAttribute('aria-valuetext')).toBe(
      'Noch nicht beantwortet',
    );

    ranges[0].value = '3';
    ranges[0].dispatchEvent(new Event('input'));
    ranges[1].value = '1';
    ranges[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(
      query<HTMLElement>('.member-worldview__progress').textContent,
    ).toMatch(/3\s+von\s+10 beantwortet/);

    query<HTMLButtonElement>('button.member-questions__submit').click();

    const req = httpTesting.expectOne('/api/members/by-token/some-token');
    expect(req.request.body.viewOfEnvironmentAnswers).toEqual([
      { itemId: 'UA1', answer: 3 },
      { itemId: 'UA2', answer: 1 },
      { itemId: 'UA10', answer: 4 },
    ]);
    req.flush(savedResponse(req.request.body));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriorityRankerComponent } from './priority-ranker.component';
import { PriorityWeights } from './priority-ranker.layout';

const statements = [
  { id: 'G', html: 'Gemeinsam entscheiden' },
  { id: 'I', html: 'Neues ausprobieren' },
  { id: 'W', html: 'Ziele erreichen' },
  { id: 'S', html: 'Klare Verfahren' },
];

describe('PriorityRankerComponent', () => {
  let fixture: ComponentFixture<PriorityRankerComponent>;
  let component: PriorityRankerComponent;

  const create = async (value: PriorityWeights | null = null) => {
    await TestBed.configureTestingModule({
      imports: [PriorityRankerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityRankerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('statements', statements);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
  };

  const element = () => fixture.nativeElement as HTMLElement;

  const boxes = () =>
    Array.from(element().querySelectorAll<HTMLElement>('[role="slider"]'));

  const box = (text: string) => {
    const found = boxes().find((b) => b.textContent?.includes(text));
    if (!found) throw new Error(`no box for ${text}`);
    return found;
  };

  const press = (target: HTMLElement, key: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  it('shows all statements between the "Hohe Priorität" and "Niedrige Priorität" labels', async () => {
    await create();

    expect(
      boxes()
        .map((b) => b.textContent?.trim())
        .sort(),
    ).toEqual(statements.map(({ html }) => html).sort());
    expect(element().textContent).toContain('Hohe Priorität');
    expect(element().textContent).toContain('Niedrige Priorität');
  });

  it('never renders the statement ids', async () => {
    await create({ G: 100, I: 60, W: 30, S: 0 });

    const html = element().innerHTML;
    for (const { id } of statements) {
      expect(html).not.toMatch(new RegExp(`\\b${id}\\b`));
    }
  });

  it('renders the statements as HTML and names the boxes by their text', async () => {
    await create();
    fixture.componentRef.setInput('statements', [
      { id: 'G', html: 'Gemeinsam <strong>entscheiden</strong>' },
    ]);
    fixture.detectChanges();

    const [only] = boxes();
    expect(only.querySelector('strong')?.textContent).toBe('entscheiden');
    const label = element().querySelector(
      `#${only.getAttribute('aria-labelledby')}`,
    );
    expect(label?.textContent).toBe('Gemeinsam entscheiden');
  });

  it('has no value and shows no priorities until the first move', async () => {
    await create();

    expect(component.value()).toBeNull();
    expect(element().querySelector('.priority-ranker__priority')).toBeNull();
    expect(box('Ziele erreichen').getAttribute('aria-valuetext')).toBe(
      'Noch nicht priorisiert',
    );
  });

  it('sets the value of all statements on the first move', async () => {
    await create();

    press(box('Ziele erreichen'), 'ArrowUp');

    const value = component.value();
    expect(Object.keys(value ?? {}).sort()).toEqual(['G', 'I', 'S', 'W']);
    expect(
      element().querySelectorAll('.priority-ranker__priority').length,
    ).toBe(4);
  });

  it('keeps the value null when a box is only clicked, not moved', async () => {
    await create();
    const target = box('Klare Verfahren');
    target.setPointerCapture = vi.fn();

    for (const type of ['pointerdown', 'pointerup']) {
      target.dispatchEvent(
        new PointerEvent(type, { isPrimary: true, button: 0, bubbles: true }),
      );
    }
    fixture.detectChanges();

    expect(component.value()).toBeNull();
  });

  it('places the statements by a given value, highest priority on top', async () => {
    await create({ G: 20, I: 100, W: 0, S: 65 });

    const byPosition = [...boxes()].sort(
      (a, b) => parseFloat(a.style.top) - parseFloat(b.style.top),
    );
    expect(byPosition.map((b) => b.getAttribute('aria-valuenow'))).toEqual([
      '100',
      '65',
      '20',
      '0',
    ]);
    expect(byPosition[0].textContent).toContain('Neues ausprobieren');
  });

  it('moves a statement by one point per arrow key', async () => {
    await create({ G: 20, I: 100, W: 0, S: 65 });

    press(box('Klare Verfahren'), 'ArrowUp');

    expect(component.value()).toEqual({ G: 20, I: 100, W: 0, S: 66 });
  });
});

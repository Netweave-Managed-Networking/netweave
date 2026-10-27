import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LikertAnswer } from '@netweave/api-types';
import { LikertQuestionComponent } from './likert-question.component';

describe('LikertQuestionComponent', () => {
  let fixture: ComponentFixture<LikertQuestionComponent>;
  let component: LikertQuestionComponent;

  const create = async (value: LikertAnswer | null = null) => {
    await TestBed.configureTestingModule({
      imports: [LikertQuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LikertQuestionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('text', 'Die Erde ist begrenzt.');
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
  };

  const element = () => fixture.nativeElement as HTMLElement;
  const range = () =>
    element().querySelector('input[type="range"]') as HTMLInputElement;
  const labels = () =>
    Array.from(
      element().querySelectorAll<HTMLButtonElement>(
        'button.likert-question__label',
      ),
    );

  it('shows the statement, labelling the slider', async () => {
    await create();

    const text = element().querySelector(
      `#${range().getAttribute('aria-labelledby')}`,
    );
    expect(text?.textContent?.trim()).toBe('Die Erde ist begrenzt.');
  });

  it('shows the five fixed answers from "stimmt nicht" to "stimmt sehr"', async () => {
    await create();

    expect(
      labels().map((label) =>
        Array.from(label.querySelectorAll('span'))
          .map((part) => part.textContent?.trim())
          .join(' '),
      ),
    ).toEqual([
      'stimmt nicht',
      'stimmt wenig',
      'stimmt mittelmäßig',
      'stimmt ziemlich',
      'stimmt sehr',
    ]);
    expect(range().min).toBe('0');
    expect(range().max).toBe('4');
    expect(range().step).toBe('1');
  });

  it('stays unanswered until an answer is chosen', async () => {
    await create();

    expect(component.value()).toBeNull();
    expect(range().getAttribute('aria-valuetext')).toBe(
      'Noch nicht beantwortet',
    );
  });

  it('shows a given answer', async () => {
    await create(3);

    expect(range().value).toBe('3');
    expect(range().getAttribute('aria-valuetext')).toBe('stimmt ziemlich');
  });

  it('takes the answer the slider is moved to', async () => {
    await create();

    range().value = '0';
    range().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe(0);
    expect(range().getAttribute('aria-valuetext')).toBe('stimmt nicht');
  });

  it('takes the answer the unanswered slider rests at when it is clicked', async () => {
    await create();

    range().click();

    expect(component.value()).toBe(2);
  });

  it('jumps to an answer when its text is clicked', async () => {
    await create(0);

    labels()[4].click();
    fixture.detectChanges();

    expect(component.value()).toBe(4);
    expect(range().value).toBe('4');
  });

  it('shows its number, if given', async () => {
    await create();
    fixture.componentRef.setInput('number', 7);
    fixture.detectChanges();

    expect(
      element().querySelector('.likert-question__number')?.textContent?.trim(),
    ).toBe('7');
  });

  it('marks itself and the chosen answer once answered', async () => {
    await create();
    expect(element().querySelector('.likert-question--answered')).toBeNull();

    labels()[1].click();
    fixture.detectChanges();

    expect(
      element().querySelector('.likert-question--answered'),
    ).not.toBeNull();
    expect(
      element().querySelectorAll('.likert-question__label--selected'),
    ).toEqual(element().querySelectorAll('button:nth-child(2)'));
  });
});

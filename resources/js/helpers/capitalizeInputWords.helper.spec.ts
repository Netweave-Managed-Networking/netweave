import { capitalizeInputWords } from './capitalizeInputWords.helper';

describe('capitalizeInputWords', () => {
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    inputElement = document.createElement('input');
  });

  it('should capitalize each word in the input value', () => {
    inputElement.value = 'hello world';
    const event = { target: inputElement };

    const result = capitalizeInputWords(event);

    expect(result).toBe('Hello World');
    expect(inputElement.value).toBe('Hello World');
  });

  it('should preserve the cursor position', () => {
    inputElement.value = 'hello world';
    inputElement.setSelectionRange(6, 6);
    const event = { target: inputElement };

    capitalizeInputWords(event);

    expect(inputElement.selectionStart).toBe(6);
    expect(inputElement.selectionEnd).toBe(6);
  });

  it('should handle empty input', () => {
    inputElement.value = '';
    const event = { target: inputElement };

    const result = capitalizeInputWords(event);

    expect(result).toBe('');
    expect(inputElement.value).toBe('');
  });

  it('should handle input with multiple spaces', () => {
    inputElement.value = 'hello   world';
    const event = { target: inputElement };

    const result = capitalizeInputWords(event);

    expect(result).toBe('Hello   World');
    expect(inputElement.value).toBe('Hello   World');
  });
});

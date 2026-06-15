import { registerDecorator } from 'class-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IsEmailOrDomain } from './is-email-or-domain.validator';

vi.mock('class-validator', () => ({
  registerDecorator: vi.fn(),
  isEmail: vi.fn(),
}));

const mockRegisterDecorator = vi.mocked(registerDecorator);

describe('IsEmailOrDomain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decorator registration', () => {
    it('should call registerDecorator with the correct metadata', () => {
      const target = {};
      const propertyName = 'contact';

      IsEmailOrDomain()(target, propertyName);

      expect(mockRegisterDecorator).toHaveBeenCalledOnce();
      expect(mockRegisterDecorator).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'isEmailOrDomain',
          target: target.constructor,
          propertyName,
        }),
      );
    });

    it('should forward validationOptions to registerDecorator', () => {
      const validationOptions = { message: 'Must be an email or domain' };

      IsEmailOrDomain(validationOptions)({}, 'prop');

      expect(mockRegisterDecorator).toHaveBeenCalledWith(
        expect.objectContaining({ options: validationOptions }),
      );
    });

    it('should register without validationOptions when omitted', () => {
      IsEmailOrDomain()({}, 'prop');

      expect(mockRegisterDecorator).toHaveBeenCalledWith(
        expect.objectContaining({ options: undefined }),
      );
    });
  });
});

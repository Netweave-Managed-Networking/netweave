import { registerDecorator } from 'class-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IsEmailOrDomain } from './is-email-or-domain.validator';

vi.mock('class-validator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('class-validator')>();
  return {
    ...actual,
    registerDecorator: vi.fn(),
  };
});

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

  describe('validator.validate', () => {
    function getValidator() {
      IsEmailOrDomain()({}, 'prop');
      const call = mockRegisterDecorator.mock.calls[0][0];
      return call.validator as { validate: (value: unknown) => boolean };
    }

    describe('valid emails', () => {
      it('should return true for a valid email address', () => {
        const { validate } = getValidator();
        expect(validate('user@example.com')).toBe(true);
      });

      it('should return true for a valid email with subdomain', () => {
        const { validate } = getValidator();
        expect(validate('user@mail.example.com')).toBe(true);
      });
    });

    describe('valid domains', () => {
      it('should return true for a domain string starting with @', () => {
        const { validate } = getValidator();
        expect(validate('@example.com')).toBe(true);
      });

      it('should return true for a domain with subdomain', () => {
        const { validate } = getValidator();
        expect(validate('@mail.example.com')).toBe(true);
      });
    });

    describe('invalid values', () => {
      it('should return false for a plain string without @', () => {
        const { validate } = getValidator();
        expect(validate('notanemail')).toBe(false);
      });

      it('should return false for an invalid domain (@ only)', () => {
        const { validate } = getValidator();
        expect(validate('@')).toBe(false);
      });

      it('should return false for a number', () => {
        const { validate } = getValidator();
        expect(validate(42)).toBe(false);
      });

      it('should return false for null', () => {
        const { validate } = getValidator();
        expect(validate(null)).toBe(false);
      });

      it('should return false for undefined', () => {
        const { validate } = getValidator();
        expect(validate(undefined)).toBe(false);
      });

      it('should return false for an object', () => {
        const { validate } = getValidator();
        expect(validate({ email: 'user@example.com' })).toBe(false);
      });

      it('should return false for an array', () => {
        const { validate } = getValidator();
        expect(validate(['user@example.com'])).toBe(false);
      });

      it('should return false for an empty string', () => {
        const { validate } = getValidator();
        expect(validate('')).toBe(false);
      });
    });
  });
});

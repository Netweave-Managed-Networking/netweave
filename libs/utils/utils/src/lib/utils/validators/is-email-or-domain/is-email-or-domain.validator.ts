import { isEmail, registerDecorator, ValidationOptions } from 'class-validator';

export function IsEmailOrDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrDomain',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (isEmail(value)) return true;
          if (typeof value !== 'string') return false;
          if (value.charAt(0) === '@' && isEmail('a' + value)) return true;
          return false;
        },
      },
    });
  };
}

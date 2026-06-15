import { registerDecorator, ValidationOptions } from 'class-validator';
import { isEmailOrDomain } from './is-email-or-domain.fn';

export function IsEmailOrDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrDomain',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: { validate: (value: unknown) => isEmailOrDomain(value) },
    });
  };
}

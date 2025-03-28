import { ContactPerson } from './contact-person.model';
import { PickStringAsNumber } from './max-string-lengths.type';

export type ContactPersonCreate = Partial<
  Pick<
    ContactPerson,
    'name' | 'email' | 'phone' | 'postcode_city' | 'street_hnr'
  >
>;

export const emptyContactPerson = {
  name: '',
  email: '',
  phone: '',
  postcode_city: '',
  street_hnr: '',
};

/** these numbers are derived from the database limits */
export const personMax: PickStringAsNumber<ContactPersonCreate> = {
  name: 127,
  email: 63,
  phone: 63,
  postcode_city: 63,
  street_hnr: 127,
};

export type ContactPersonCreateErrors = Partial<
  Record<keyof ContactPersonCreate, string>
>;

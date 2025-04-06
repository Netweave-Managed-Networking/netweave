import { Notes } from './notes.model';

export type NotesCreate = Partial<Pick<Notes, 'notes'>>;

export const emptyNotes: NotesCreate = { notes: '' };

export const notesMax = { notes: 4095 };

export type NotesCreateErrors = Partial<Record<keyof NotesCreate, string>>;

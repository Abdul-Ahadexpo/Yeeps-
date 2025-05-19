import { ref, set, get, push, remove, update, onValue, off, DatabaseReference } from 'firebase/database';
import { database } from '../firebase/config';
import { User } from 'firebase/auth';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isCheckList: boolean;
  items?: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const getNotesRef = (user: User) => {
  return ref(database, `users/${user.uid}/notes`);
};

const getNoteRef = (user: User, noteId: string) => {
  return ref(database, `users/${user.uid}/notes/${noteId}`);
};

export const getNotes = async (user: User): Promise<Note[]> => {
  const notesRef = getNotesRef(user);
  const snapshot = await get(notesRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const notesData = snapshot.val();
  return Object.keys(notesData).map(key => ({
    id: key,
    ...notesData[key]
  }));
};

export const subscribeToNotes = (
  user: User,
  callback: (notes: Note[]) => void
): () => void => {
  const notesRef = getNotesRef(user);
  
  onValue(notesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const notesData = snapshot.val();
    const notes = Object.keys(notesData).map(key => ({
      id: key,
      ...notesData[key]
    }));
    
    callback(notes);
  });
  
  // Return unsubscribe function
  return () => off(notesRef);
};

export const addNote = async (user: User, note: Omit<Note, 'id'>): Promise<string> => {
  const notesRef = getNotesRef(user);
  const newNoteRef = push(notesRef);
  
  await set(newNoteRef, note);
  return newNoteRef.key as string;
};

export const updateNote = async (user: User, note: Note): Promise<void> => {
  const noteRef = getNoteRef(user, note.id);
  const { id, ...noteWithoutId } = note;
  
  // Update the updatedAt timestamp
  const updatedNote = {
    ...noteWithoutId,
    updatedAt: Date.now()
  };
  
  await update(noteRef, updatedNote);
};

export const deleteNote = async (user: User, noteId: string): Promise<void> => {
  const noteRef = getNoteRef(user, noteId);
  await remove(noteRef);
};

export const toggleChecklistItem = async (
  user: User,
  noteId: string,
  itemId: string,
  checked: boolean
): Promise<void> => {
  const itemRef = ref(database, `users/${user.uid}/notes/${noteId}/items/${itemId}/checked`);
  await set(itemRef, checked);
  
  // Update the note's updatedAt timestamp
  const updatedAtRef = ref(database, `users/${user.uid}/notes/${noteId}/updatedAt`);
  await set(updatedAtRef, Date.now());
};
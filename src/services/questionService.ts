import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { User } from 'firebase/auth';

export interface Question {
  id: string;
  text: string;
  alreadyAsked: boolean;
  notes?: string;
  createdAt: number;
  askedAt?: number;
}

const getQuestionsRef = (user: User) => {
  return ref(database, `users/${user.uid}/questions`);
};

const getQuestionRef = (user: User, questionId: string) => {
  return ref(database, `users/${user.uid}/questions/${questionId}`);
};

export const getQuestions = async (user: User): Promise<Question[]> => {
  const questionsRef = getQuestionsRef(user);
  const snapshot = await get(questionsRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const questionsData = snapshot.val();
  return Object.keys(questionsData).map(key => ({
    id: key,
    ...questionsData[key]
  }));
};

export const subscribeToQuestions = (
  user: User,
  callback: (questions: Question[]) => void
): () => void => {
  const questionsRef = getQuestionsRef(user);
  
  onValue(questionsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const questionsData = snapshot.val();
    const questions = Object.keys(questionsData).map(key => ({
      id: key,
      ...questionsData[key]
    }));
    
    // Sort by newest first
    questions.sort((a, b) => b.createdAt - a.createdAt);
    
    callback(questions);
  });
  
  // Return unsubscribe function
  return () => off(questionsRef);
};

export const addQuestion = async (user: User, question: Omit<Question, 'id'>): Promise<string> => {
  const questionsRef = getQuestionsRef(user);
  const newQuestionRef = push(questionsRef);
  
  await set(newQuestionRef, question);
  return newQuestionRef.key as string;
};

export const updateQuestion = async (user: User, question: Question): Promise<void> => {
  const questionRef = getQuestionRef(user, question.id);
  const { id, ...questionWithoutId } = question;
  
  await update(questionRef, questionWithoutId);
};

export const markQuestionAsAsked = async (user: User, questionId: string, asked: boolean): Promise<void> => {
  const questionRef = getQuestionRef(user, questionId);
  
  await update(questionRef, {
    alreadyAsked: asked,
    askedAt: asked ? Date.now() : null
  });
};

export const deleteQuestion = async (user: User, questionId: string): Promise<void> => {
  const questionRef = getQuestionRef(user, questionId);
  await remove(questionRef);
};
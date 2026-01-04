export type Subject = 'python programming' | 'project management' | 'custom' | string;
export interface Card {
    id: string;
    front: string;
    back: string;
    subject: Subject;
    topic?: string;
    strength: 'new' | 'weak' | 'moderate' | 'strong';
    lastReviewed?: number;
    tags?: string[];
}
export interface Deck {
    id: string;
    title: string;
    subject: Subject;
    cards: string[];
}
export interface Question {
    id: string;
    subject: Subject;
    topic: string;
    question: string;
    answer: string;
    notes?: string;
    type: 'theory' | 'code';
}
export interface Note {
    id: string;
    title: string;
    content: string;
    subject: Subject;
    isPinned: boolean;
    createdAt: number;
    updatedAt: number;
}
export interface AppData {
    cards: Record<string, Card>;
    decks: Record<string, Deck>;
    questions: Record<string, Question>;
    notes: Record<string, Note>;
    subjects: Subject[];
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppData, Card, Note, Question } from '../types';
const STORAGE_KEY = 'revapp_v1';
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
interface DataContextType {
    data: AppData;
    isLoading: boolean;
    actions: {
        addCard: (c: Omit<Card, 'id' | 'strength'>) => string;
        updateCard: (id: string, u: Partial<Card>) => void;
        deleteCard: (id: string) => void;
        addQuestion: (q: Omit<Question, 'id'>) => string;
        addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
        updateNote: (id: string, u: Partial<Note>) => void;
        reset: () => void;
        io: {
            export: () => Promise<string>;
            import: (json: string) => Promise<boolean>;
        };
    };
}
const initialData: AppData = {
    cards: {},
    decks: {},
    questions: {},
    notes: {},
    subjects: [],
};
const DataContext = createContext<DataContextType | undefined>(undefined);
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const cache = useRef(JSON.stringify(initialData));
    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setData(JSON.parse(stored));
                cache.current = stored;
            }
            setIsLoading(false);
        })();
    }, []);
    useEffect(() => {
        if (isLoading) return;
        const current = JSON.stringify(data);
        if (current === cache.current) return;
        const sync = setTimeout(() => {
            AsyncStorage.setItem(STORAGE_KEY, current).then(() => cache.current = current);
        }, 800);
        return () => clearTimeout(sync);
    }, [data, isLoading]);
    const addCard = useCallback((card: Omit<Card, 'id' | 'strength'>) => {
        const id = uid();
        setData(prev => {
            const existingDeck = Object.values(prev.decks).find(d => d.subject === card.subject);
            const targetDeckId = existingDeck ? existingDeck.id : uid();
            return {
                ...prev,
                cards: { ...prev.cards, [id]: { ...card, id, strength: 'new' } },
                decks: {
                    ...prev.decks,
                    [targetDeckId]: existingDeck ? { ...existingDeck, cards: [...existingDeck.cards, id] }
                        : { id: targetDeckId, title: `${card.subject} Deck`, subject: card.subject, cards: [id] }
                }
            };
        });
        return id;
    }, []);
    const updateCard = useCallback((id: string, u: Partial<Card>) =>
        setData(p => ({ ...p, cards: { ...p.cards, [id]: { ...p.cards[id], ...u } } })), []);
    const deleteCard = useCallback((id: string) => setData(p => {
        const { [id]: _, ...cards } = p.cards;
        const decks = Object.fromEntries(Object.entries(p.decks).map(([k, d]) => [k, { ...d, cards: d.cards.filter(c => c !== id) }]));
        return { ...p, cards, decks };
    }), []);
    const addQuestion = useCallback((q: Omit<Question, 'id'>) => {
        const id = uid();
        setData(p => ({
            ...p,
            questions: { ...p.questions, [id]: { ...q, id } },
            subjects: p.subjects.includes(q.subject) ? p.subjects : [...p.subjects, q.subject]
        }));
        return id;
    }, []);
    const addNote = useCallback((n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        const id = uid(), t = now();
        setData(p => ({ ...p, notes: { ...p.notes, [id]: { ...n, id, createdAt: t, updatedAt: t } } }));
        return id;
    }, []);
    const updateNote = useCallback((id: string, u: Partial<Note>) =>
        setData(p => ({ ...p, notes: { ...p.notes, [id]: { ...p.notes[id], ...u, updatedAt: now() } } })), []);
    const actions = useMemo(() => ({
        addCard, updateCard, deleteCard, addQuestion, addNote, updateNote,
        reset: () => { setData(initialData); AsyncStorage.removeItem(STORAGE_KEY); },
        io: {
            export: async () => JSON.stringify(data, null, 2),
            import: async (json: string) => {
                try {
                    const p = JSON.parse(json);
                    if (!p || typeof p !== 'object') return false;
                    if (Array.isArray(p)) {
                        if (p.length === 0) return true;
                        const newQs: Record<string, any> = {};
                        const newSubs = new Set(data.subjects);
                        p.forEach((q: any) => {
                            const id = uid();
                            const sub = q.subject || 'imported';
                            newQs[id] = {
                                topic: 'Imported', question: 'No question body', answer: 'No answer body',
                                type: 'theory', ...q, id, subject: sub
                            };
                            newSubs.add(sub);
                        });
                        setData(curr => ({
                            ...curr,
                            questions: { ...curr.questions, ...newQs },
                            subjects: Array.from(newSubs)
                        }));
                        return true;
                    }
                    setData(curr => ({
                        ...curr,
                        cards: { ...curr.cards, ...(p.cards || {}) },
                        notes: { ...curr.notes, ...(p.notes || {}) },
                        questions: { ...curr.questions, ...(p.questions || {}) },
                        subjects: [...new Set([...curr.subjects, ...(p.subjects || [])])],
                        decks: Object.entries((p.decks || {}) as Record<string, any>).reduce((acc, [id, d]) => ({
                            ...acc,
                            [id]: acc[id] ? { ...acc[id], cards: [...new Set([...(acc[id].cards || []), ...(d.cards || [])])] } : d
                        }), { ...curr.decks })
                    }));
                    return true;
                } catch (e) {
                    console.error('Import process failed:', e);
                    return false;
                }
            }
        }
    }), [data, addCard, updateCard, deleteCard, addQuestion, addNote, updateNote]);
    return <DataContext.Provider value={{ data, isLoading, actions }}>{children}</DataContext.Provider>;
};
export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('Data context missing');
    return ctx;
};
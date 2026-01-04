import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
export default function NoteEditor() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colors = Colors[useColorScheme() ?? 'light'];
    const { data, actions: { addNote, updateNote } } = useData();
    const [note, setNote] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);
    const idRef = useRef<string | null>(null);
    useEffect(() => {
        if (id && id !== 'new' && data.notes[id as string]) {
            const { title, content } = data.notes[id as string];
            setNote({ title, content });
            idRef.current = id as string;
        }
    }, [id]);
    const performSave = useCallback(() => {
        const { title: t, content: c } = note;
        if (!t.trim() && !c.trim()) return;
        setIsSaving(true);
        if (idRef.current) {
            updateNote(idRef.current, { title: t, content: c });
        } else {
            idRef.current = addNote({ title: t, content: c, subject: 'notes', isPinned: false });
        }
        setTimeout(() => setIsSaving(false), 500);
    }, [note, addNote, updateNote]);
    useEffect(() => {
        const h = setTimeout(performSave, 1500);
        return () => clearTimeout(h);
    }, [note, performSave]);
    const exit = () => { performSave(); router.back(); };
    return (
        <KeyboardAvoidingView style={[s.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Stack.Screen options={{
                headerTitle: () => <Text style={{ fontSize: 12, color: colors.textSecondary, opacity: isSaving ? 1 : 0 }}>Saving...</Text>,
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.tint,
                headerShadowVisible: false,
                headerLeft: () => <TouchableOpacity onPress={exit} style={s.btn}><Ionicons name="chevron-back" size={28} color={colors.tint} /></TouchableOpacity>,
                headerRight: () => <TouchableOpacity onPress={exit} style={s.btn}><Ionicons name="checkmark-sharp" size={26} color={colors.tint} /></TouchableOpacity>
            }} />
            <ScrollView style={s.flex} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
                <TextInput
                    style={[s.title, { color: colors.text }]}
                    placeholder="Title"
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={note.title}
                    onChangeText={t => setNote(p => ({ ...p, title: t }))}
                />
                <TextInput
                    style={[s.body, { color: colors.text }]}
                    placeholder="Start writing..."
                    placeholderTextColor={colors.textSecondary + '60'}
                    value={note.content}
                    onChangeText={c => setNote(p => ({ ...p, content: c }))}
                    multiline textAlignVertical="top" scrollEnabled={false}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
const s = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    pad: { padding: 24, paddingTop: 12 },
    btn: { padding: 4 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 },
    body: { fontSize: 18, lineHeight: 28, flex: 1, minHeight: 400 },
});
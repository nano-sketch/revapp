import { InputModal } from '@/components/InputModal';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
const QItem = React.memo(({ item, open, onToggle, colors }: any) => (
    <TouchableOpacity style={[s.qCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onToggle} activeOpacity={0.7}>
        <View style={s.qHead}>
            <View style={s.flex}>
                <ThemedText type="defaultSemiBold" style={[s.topic, { color: colors.tint }]}>{item.topic}</ThemedText>
                <ThemedText style={s.qText}>{item.question}</ThemedText>
            </View>
            <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </View>
        {open && <View style={[s.ansBox, { borderTopColor: colors.border }]}>
            <ThemedText style={s.ansLab}>Answer:</ThemedText>
            <ThemedText style={s.ansText}>{item.answer}</ThemedText>
            {item.notes && <View style={[s.nBox, { backgroundColor: colors.tintBackground }]}><ThemedText style={s.nText}>{item.notes}</ThemedText></View>}
        </View>}
    </TouchableOpacity>
));
export default function Bank() {
    const colors = Colors[useColorScheme() ?? 'light'];
    const { data, actions: { addQuestion, io } } = useData();
    const [sub, setSub] = useState<string | null>(null);
    const [exp, setExp] = useState<string | null>(null);
    const [vis, setVis] = useState(false);
    const questions = useMemo(() => Object.values(data.questions).filter(q => !sub || q.subject === sub), [data.questions, sub]);
    const exportData = async () => { try { await Clipboard.setStringAsync(await io.export()); Alert.alert('Done', 'Copied to clipboard'); } catch { Alert.alert('Fail', 'Export failed'); } };
    const importData = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
            if (res.canceled || !res.assets?.length) return;
            const content = await FileSystem.readAsStringAsync(res.assets[0].uri);
            const ok = await io.import(content);
            Alert.alert(ok ? 'Success' : 'Error', ok ? 'Data merged successfully' : 'Invalid file format');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not read the selected file');
        }
    };
    return (
        <SafeAreaView style={[s.base, { backgroundColor: colors.background }]}>
            <View style={s.header}>
                <ThemedText type="title">Bank</ThemedText>
                <View style={s.hActions}>
                    <TouchableOpacity onPress={exportData} hitSlop={15}><Ionicons name="share-outline" size={24} color={colors.tint} /></TouchableOpacity>
                    <TouchableOpacity onPress={importData} hitSlop={15}><Ionicons name="download-outline" size={24} color={colors.tint} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setVis(true)} hitSlop={15}><Ionicons name="add-circle" size={24} color={colors.tint} /></TouchableOpacity>
                </View>
            </View>
            <View style={s.subs}><FlatList data={data.subjects} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sList} renderItem={({ item }) => (
                <TouchableOpacity style={[s.chip, { backgroundColor: sub === item ? colors.tint : colors.card, borderColor: sub === item ? colors.tint : colors.border }]} onPress={() => setSub(sub === item ? null : item)}>
                    <ThemedText style={[s.chipT, { color: sub === item ? '#fff' : colors.text }]}>{item.toUpperCase()}</ThemedText>
                </TouchableOpacity>
            )} /></View>
            <FlatList
                data={questions}
                keyExtractor={q => q.id}
                contentContainerStyle={s.qList}
                renderItem={({ item }) => (
                    <QItem item={item} open={exp === item.id} onToggle={() => setExp(exp === item.id ? null : item.id)} colors={colors} />
                )}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <Ionicons name="library-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                        <ThemedText style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, opacity: 0.6 }}>No questions found in this category.</ThemedText>
                    </View>
                }
            />
            <InputModal visible={vis} title="New Question" fields={[{ key: 'subject', label: 'Subject', type: 'tag', options: data.subjects }, { key: 'topic', label: 'Topic' }, { key: 'question', label: 'Question', multiline: true }, { key: 'answer', label: 'Answer', multiline: true }, { key: 'notes', label: 'Notes', multiline: true }]}
                initialValues={{ subject: sub || '', topic: '', question: '', answer: '', notes: '' }} onClose={() => setVis(false)} onSave={v => { addQuestion({ ...v, subject: v.subject || sub || 'custom', type: 'theory' } as any); setVis(false); }} />
        </SafeAreaView>
    );
}
const s = StyleSheet.create({
    base: { flex: 1 },
    flex: { flex: 1 },
    header: { padding: 24, paddingTop: Platform.OS === 'android' ? 40 : 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hActions: { flexDirection: 'row', gap: 16 },
    subs: { height: 50 },
    sList: { paddingHorizontal: 20 },
    chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, justifyContent: 'center' },
    chipT: { fontSize: 11, fontWeight: '700' },
    qList: { padding: 20 },
    qCard: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
    qHead: { padding: 16, flexDirection: 'row', alignItems: 'center' },
    topic: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    qText: { fontSize: 15, fontWeight: '500' },
    ansBox: { padding: 16, borderTopWidth: 1 },
    ansLab: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4, opacity: 0.5 },
    ansText: { fontSize: 14, lineHeight: 22 },
    nBox: { marginTop: 12, padding: 10, borderRadius: 10 },
    nText: { fontSize: 12, opacity: 0.8 },
    empty: { flex: 1, paddingTop: 120, alignItems: 'center', justifyContent: 'center' }
});
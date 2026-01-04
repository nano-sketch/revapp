import { Flashcard } from '@/components/Flashcard';
import { InputModal } from '@/components/InputModal';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Deck } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
const DeckItem = React.memo(({ item, colors, onSelect }: { item: Deck, colors: any, onSelect: (id: string) => void }) => (
    <TouchableOpacity style={[s.deck, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => onSelect(item.id)}>
        <View><ThemedText type="subtitle">{item.title}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{item.subject}</ThemedText></View>
        <View style={[s.badge, { backgroundColor: colors.tint }]}><ThemedText style={s.badgeT}>{item.cards.length}</ThemedText></View>
    </TouchableOpacity>
));
export default function Flashcards() {
    const colors = Colors[useColorScheme() ?? 'light'];
    const { data, actions: { addCard, updateCard, deleteCard } } = useData();
    const [deckId, setDeckId] = useState<string | null>(null);
    const [idx, setIdx] = useState(0);
    const [done, setDone] = useState(false);
    const [vis, setVis] = useState({ cfg: false, add: false, create: false });
    const queue = useMemo(() => {
        if (!deckId || !data.decks[deckId]) return [];
        return data.decks[deckId].cards.map(id => data.cards[id]).filter(Boolean);
    }, [deckId, data.decks, data.cards]);
    const cur = queue[idx];
    const next = (res: 'weak' | 'strong') => {
        if (cur) updateCard(cur.id, { strength: res, lastReviewed: Date.now() });
        idx >= queue.length - 1 ? setDone(true) : setIdx(p => p + 1);
    };
    const reset = () => { setDeckId(null); setIdx(0); setDone(false); setVis({ cfg: false, add: false, create: false }); };
    const handleCreateCard = (v: any) => {
        const subject = v.subject || (deckId ? data.decks[deckId]?.subject : 'custom');
        const newId = addCard({ ...v, subject });
        setVis(p => ({ ...p, create: false, add: false }));
    };
    if (deckId) {
        if (done) return (
            <SafeAreaView style={[s.base, { backgroundColor: colors.background }]}>
                <View style={s.center}><View style={s.iconC}><Ionicons name="checkmark-done" size={60} color={colors.success} /></View>
                    <ThemedText type="title">Done!</ThemedText>
                    <ThemedText style={s.sum}>Reviewed {queue.length} cards.</ThemedText>
                    <TouchableOpacity style={[s.btn, { backgroundColor: colors.tint }]} onPress={reset}><ThemedText style={s.btnT}>Finish</ThemedText></TouchableOpacity></View>
            </SafeAreaView>
        );
        if (queue.length === 0) return (
            <SafeAreaView style={[s.base, { backgroundColor: colors.background }]}>
                <View style={s.center}><ThemedText type="subtitle">Deck is empty.</ThemedText>
                    <TouchableOpacity style={[s.btn, { backgroundColor: colors.tint, marginTop: 24 }]} onPress={() => setVis(p => ({ ...p, add: true }))}><ThemedText style={s.btnT}>Add Card</ThemedText></TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 12 }} onPress={reset}><ThemedText style={{ color: colors.textSecondary }}>Go Back</ThemedText></TouchableOpacity></View>
                <InputModal visible={vis.add} title="Add Card" fields={[{ key: 'front', label: 'Front', multiline: true }, { key: 'back', label: 'Back', multiline: true }]}
                    initialValues={{ front: '', back: '' }} onClose={() => setVis(p => ({ ...p, add: false }))} onSave={handleCreateCard} />
            </SafeAreaView>
        );
        return (
            <View style={[s.base, { backgroundColor: colors.background }]}>
                <SafeAreaView style={s.flex}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
                        <View style={s.sHead}><TouchableOpacity onPress={reset}><Ionicons name="close" size={28} color={colors.text} /></TouchableOpacity>
                            <ThemedText style={s.prog}>{idx + 1} / {queue.length}</ThemedText>
                            <TouchableOpacity onPress={() => setVis(p => ({ ...p, cfg: true }))}><Ionicons name="settings-outline" size={24} color={colors.text} /></TouchableOpacity></View>
                        <View style={s.cardA}>{cur && <Flashcard key={cur.id} id={cur.id} front={cur.front} back={cur.back} />}</View>
                        <View style={s.ctrl}>
                            <TouchableOpacity style={[s.actB, { borderColor: colors.error }]} onPress={() => next('weak')}><Ionicons name="close" size={32} color={colors.error} /></TouchableOpacity>
                            <View style={{ width: 40 }} />
                            <TouchableOpacity style={[s.actB, { borderColor: colors.success }]} onPress={() => next('strong')}><Ionicons name="checkmark" size={32} color={colors.success} /></TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
                <Modal visible={vis.cfg} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView style={[s.flex, { backgroundColor: colors.background }]}>
                        <View style={s.mHead}><ThemedText type="subtitle">Options</ThemedText><TouchableOpacity onPress={() => setVis(p => ({ ...p, cfg: false }))}><ThemedText style={{ color: colors.tint, fontWeight: '700' }}>Done</ThemedText></TouchableOpacity></View>
                        <ScrollView contentContainerStyle={s.mScroll}>
                            <View style={s.mSecHead}><ThemedText style={s.mSecT}>Cards ({queue.length})</ThemedText>
                                <TouchableOpacity style={[s.addB, { backgroundColor: colors.tint }]} onPress={() => setVis({ ...vis, cfg: false, add: true })}><Ionicons name="add" size={18} color="#fff" /><ThemedText style={s.addBT}>Add</ThemedText></TouchableOpacity></View>
                            {queue.map(c => (
                                <View key={c.id} style={[s.item, { borderBottomColor: colors.border }]}><View style={s.flex}><ThemedText numberOfLines={1} style={s.iF}>{c.front}</ThemedText><ThemedText numberOfLines={1} style={s.iB}>{c.back}</ThemedText></View>
                                    <TouchableOpacity onPress={() => deleteCard(c.id)}><Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity></View>
                            ))}
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
                <InputModal visible={vis.add} title="Add to Deck" fields={[{ key: 'front', label: 'Front', multiline: true }, { key: 'back', label: 'Back', multiline: true }]}
                    initialValues={{ front: '', back: '' }} onClose={() => setVis(p => ({ ...p, add: false }))} onSave={handleCreateCard} />
            </View>
        );
    }
    return (
        <SafeAreaView style={[s.base, { backgroundColor: colors.background }]}>
            <View style={s.mainH}><ThemedText type="title">Flashcards</ThemedText></View>
            <FlatList
                data={Object.values(data.decks)}
                renderItem={({ item }) => <DeckItem item={item} colors={colors} onSelect={setDeckId} />}
                keyExtractor={d => d.id}
                contentContainerStyle={s.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={s.emptyC}>
                        <Ionicons name="layers-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                        <ThemedText style={[s.emptyT, { color: colors.textSecondary }]}>
                            Your flashcards will appear here.
                        </ThemedText>
                    </View>
                }
            />
            <TouchableOpacity style={[s.fab, { backgroundColor: colors.tint }]} onPress={() => setVis(p => ({ ...p, create: true }))}><Ionicons name="add" size={32} color="#fff" /></TouchableOpacity>
            <InputModal visible={vis.create} title="New Deck/Card" fields={[{ key: 'front', label: 'Front', multiline: true }, { key: 'back', label: 'Back', multiline: true }, { key: 'subject', label: 'Subject' }]}
                initialValues={{ front: '', back: '', subject: '' }} onClose={() => setVis(p => ({ ...p, create: false }))} onSave={handleCreateCard} />
        </SafeAreaView>
    );
}
const s = StyleSheet.create({
    base: { flex: 1 }, flex: { flex: 1 },
    mainH: { padding: 24, paddingBottom: 12 },
    list: { padding: 20 },
    deck: { padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    badgeT: { color: '#fff', fontSize: 12, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    sHead: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    prog: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
    cardA: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    ctrl: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 60, paddingHorizontal: 40 },
    actB: { flex: 1, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1 },
    center: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
    iconC: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.02)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    sum: { marginVertical: 12, opacity: 0.6 },
    btn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, minWidth: 160 },
    btnT: { color: '#fff', fontWeight: '700', textAlign: 'center' },
    mHead: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    mScroll: { padding: 20 },
    mSecHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    mSecT: { fontSize: 16, fontWeight: '700' },
    addB: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
    addBT: { color: '#fff', fontSize: 12, fontWeight: '600' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    iF: { fontWeight: '600', fontSize: 15 },
    iB: { fontSize: 12, opacity: 0.5 },
    emptyC: { flex: 1, paddingTop: 100, alignItems: 'center', justifyContent: 'center' },
    emptyT: { marginTop: 16, fontSize: 16, opacity: 0.6 },
});
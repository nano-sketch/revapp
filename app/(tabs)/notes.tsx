import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Note } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
export default function NotesPage() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { data } = useData();
    const router = useRouter();
    const notes = useMemo(() =>
        Object.values(data.notes).sort((a, b) => b.updatedAt - a.updatedAt)
        , [data.notes]);
    const handleCreate = useCallback(() => {
        router.push('/note/new');
    }, [router]);
    const handleEdit = useCallback((noteId: string) => {
        router.push(`/note/${noteId}`);
    }, [router]);
    const renderNoteItem = useCallback(({ item }: { item: Note }) => (
        <TouchableOpacity
            style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleEdit(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <ThemedText type="subtitle" numberOfLines={1} style={styles.noteTitle}>
                    {item.title || 'Untitled Note'}
                </ThemedText>
                <ThemedText style={styles.dateText}>
                    {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </ThemedText>
            </View>
            <ThemedText numberOfLines={1} style={[styles.previewText, { color: colors.textSecondary }]}>
                {item.content || 'No additional text'}
            </ThemedText>
        </TouchableOpacity>
    ), [colors, handleEdit]);
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <ThemedText type="title">Notes</ThemedText>
                <TouchableOpacity
                    onPress={handleCreate}
                    style={[styles.createButton, { backgroundColor: colors.tintBackground }]}
                    hitSlop={10}
                >
                    <Ionicons name="add" size={24} color={colors.tint} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={notes}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderNoteItem}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Your notes will appear here.
                        </ThemedText>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 40 : 12,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: { padding: 16, paddingBottom: 100 },
    noteCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    noteTitle: { flex: 1, marginRight: 12, fontSize: 17, fontWeight: '700' },
    dateText: { fontSize: 10, opacity: 0.5, fontWeight: '600' },
    previewText: { fontSize: 13, opacity: 0.8 },
    emptyContainer: {
        flex: 1,
        paddingTop: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: { marginTop: 16, fontSize: 16, opacity: 0.6 },
});
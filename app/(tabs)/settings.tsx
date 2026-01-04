import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
export default function SettingsPage() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { actions: { reset } } = useData();
    const isDark = colorScheme === 'dark';
    const handleReset = () => {
        Alert.alert(
            "Reset All Data",
            "Are you sure? This will delete all decks, cards, questions, and notes. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Everything",
                    style: "destructive",
                    onPress: () => {
                        reset();
                        Alert.alert("Success", "App data has been reset.");
                    }
                }
            ]
        );
    };
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <ThemedText type="title">Settings</ThemedText>
            </View>
            <View style={styles.section}>
                <View style={styles.simpleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.text} />
                        <ThemedText>Dark Mode (System)</ThemedText>
                    </View>
                    <Switch
                        value={isDark}
                        disabled={true}
                    />
                </View>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 5 }}>
                    Change device settings to toggle mode.
                </ThemedText>
            </View>
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.simpleRow}
                    onPress={handleReset}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                        <ThemedText style={{ color: colors.error }}>Reset Data</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.error} />
                </TouchableOpacity>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 5 }}>
                    Clears all decks, questions, cards, and cache.
                </ThemedText>
            </View>
            <View style={{ marginTop: 'auto', alignItems: 'center', marginBottom: 20 }}>
                <ThemedText style={{ color: colors.textSecondary }}>RevApp v1.0.0</ThemedText>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Offline Revision Toolkit</ThemedText>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    simpleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    }
});
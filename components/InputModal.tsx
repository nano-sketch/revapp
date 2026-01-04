import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';
interface Field {
    key: string;
    label: string;
    multiline?: boolean;
    type?: 'text' | 'tag';
    options?: string[];
}
interface InputModalProps {
    visible: boolean;
    title: string;
    fields: Field[];
    initialValues: Record<string, string>;
    onClose: () => void;
    onSave: (values: Record<string, string>) => void;
}
export function InputModal({ visible, title, fields = [], initialValues = {}, onClose, onSave }: InputModalProps) {
    const colors = Colors[useColorScheme() ?? 'light'];
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    useEffect(() => { if (visible) setValues(initialValues); }, [initialValues, visible]);
    const save = () => { onSave(values); onClose(); };
    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.overlay}>
                <View style={[s.modal, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={[s.head, { borderBottomColor: colors.border }]}>
                        <ThemedText type="subtitle">{title}</ThemedText>
                        <TouchableOpacity onPress={onClose} hitSlop={15}>
                            <Ionicons name="close-circle-outline" size={28} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {fields.map((f) => (
                            <View key={f.key} style={s.fC}>
                                <ThemedText style={[s.lab, { color: colors.textSecondary }]}>{f.label}</ThemedText>
                                {f.type === 'tag' && f.options && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tags}>
                                        {f.options.map(o => (
                                            <TouchableOpacity key={o} onPress={() => setValues(p => ({ ...p, [f.key]: o }))}
                                                style={[s.chip, { backgroundColor: values[f.key] === o ? colors.tint : colors.card, borderColor: values[f.key] === o ? colors.tint : colors.border }]}>
                                                <ThemedText style={[s.chipT, { color: values[f.key] === o ? '#fff' : colors.text }]}>{o}</ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                                <TextInput
                                    style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, minHeight: f.multiline ? 100 : 52 }]}
                                    value={values[f.key] || ''} onChangeText={t => setValues(p => ({ ...p, [f.key]: t }))}
                                    multiline={f.multiline} textAlignVertical={f.multiline ? 'top' : 'center'}
                                    placeholder={`Enter ${f.label.toLowerCase()}...`} placeholderTextColor={colors.textSecondary + '60'}
                                />
                            </View>
                        ))}
                    </ScrollView>
                    <View style={[s.foot, { borderTopColor: colors.border }]}>
                        <TouchableOpacity style={[s.sBtn, { backgroundColor: colors.tint }]} onPress={save}>
                            <ThemedText style={s.sBtnT}>Save Changes</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
    modal: { borderRadius: 24, borderWidth: 1, maxHeight: '85%', overflow: 'hidden', elevation: 10, shadowOpacity: 0.2 },
    head: { padding: 20, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    body: { padding: 20 },
    fC: { marginBottom: 20 },
    lab: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    tags: { marginBottom: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1 },
    chipT: { fontSize: 12, fontWeight: '600' },
    input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1 },
    foot: { padding: 20, borderTopWidth: 1 },
    sBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    sBtnT: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
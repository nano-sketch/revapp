import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
const Stat = ({ val, label, col }: { val: number | string, label: string, col: string }) => (
  <View style={[s.statBox, { borderColor: Colors.light.border }]}>
    <ThemedText type="title" style={{ color: col, fontSize: 22 }}>{val}</ThemedText>
    <ThemedText style={s.statLabel}>{label}</ThemedText>
  </View>
);
export default function Home() {
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  const { data } = useData();
  const stats = useMemo(() => {
    const c = Object.values(data.cards);
    return {
      bad: c.filter(x => x.strength === 'weak').length,
      all: c.length,
      notes: Object.keys(data.notes).length
    };
  }, [data.cards, data.notes]);
  const recent = useMemo(() => Object.values(data.notes).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3), [data.notes]);
  return (
    <SafeAreaView style={[s.base, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.head}>
          <ThemedText style={s.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</ThemedText>
          <ThemedText type="title" style={s.greet}>Daily Overview</ThemedText>
        </View>
        <View style={s.row}>
          <Stat val={stats.bad} label="Weak Items" col={colors.error} />
          <Stat val={stats.all} label="Questions" col={colors.tint} />
          <Stat val={stats.notes} label="Notes" col={colors.success} />
        </View>
        <View style={s.sec}>
          <ThemedText type="subtitle" style={s.secTitle}>Continue Learning</ThemedText>
          <TouchableOpacity style={[s.btn, { backgroundColor: colors.tint }]} onPress={() => router.push('/flashcards')} activeOpacity={0.8}>
            <View style={s.ico}><Ionicons name="layers" size={24} color="#fff" /></View>
            <View style={s.flex}>
              <ThemedText type="defaultSemiBold" style={s.btnT}>Review Sessions</ThemedText>
              <ThemedText style={s.btnD}>{stats.bad > 0 ? `${stats.bad} cards need attention` : 'Start daily review'}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSec, { borderColor: colors.border }]} onPress={() => router.push('/bank')} activeOpacity={0.7}>
            <View style={[s.icoSec, { backgroundColor: colors.tintBackground }]}><Ionicons name="journal" size={20} color={colors.tint} /></View>
            <View style={s.flex}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>Question Bank</ThemedText>
              <ThemedText style={s.btnD2}>Browse theory & practice</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {recent.length > 0 && <View style={s.sec}>
          <View style={s.secHead}>
            <ThemedText type="subtitle" style={{ fontSize: 18, fontWeight: '700' }}>Recent Notes</ThemedText>
            <TouchableOpacity onPress={() => router.push('/notes')}><ThemedText style={{ color: colors.tint, fontWeight: '700' }}>See All</ThemedText></TouchableOpacity>
          </View>
          <View style={{ gap: 8 }}>
            {recent.map(n => (
              <TouchableOpacity key={n.id} style={[s.nRow, { borderColor: colors.border }]} onPress={() => router.push(`/note/${n.id}`)}>
                <View style={[s.nTab, { backgroundColor: colors.tint }]} />
                <View style={s.flex}>
                  <ThemedText numberOfLines={1} style={s.nT}>{n.title || 'Untitled'}</ThemedText>
                  <ThemedText numberOfLines={1} style={s.nB}>{n.content || '...'}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  base: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  flex: { flex: 1 },
  head: { marginBottom: 20, marginTop: Platform.OS === 'android' ? 10 : 0 },
  date: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.6, marginBottom: 4 },
  greet: { fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: 'flex-start' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', opacity: 0.7, marginTop: 2 },
  sec: { marginBottom: 24 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  btn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, elevation: 3, shadowOpacity: 0.1 },
  btnSec: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1 },
  ico: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  icoSec: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  btnT: { color: '#fff', fontSize: 16 },
  btnD: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  btnD2: { fontSize: 12, opacity: 0.7 },
  nRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1 },
  nTab: { width: 3, height: 20, borderRadius: 4, marginRight: 10 },
  nT: { fontSize: 15, fontWeight: '600' },
  nB: { fontSize: 12, opacity: 0.6 }
});
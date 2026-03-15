import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, useColorScheme } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import pb from '../../lib/pocketbase';
import { Colors, Theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as Haptics from 'expo-haptics';
import { deleteNote, getNotes } from '@/stores/noteStore';

type Note = {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
};

export default function NotesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };


  const fetchNotes = async () => {
    try {
      const records = await getNotes() as Note[];
      setNotes(records);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const handleLogout = () => {
    pb.authStore.clear();
    router.replace('/(auth)/login');
  };

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: Theme.spacing.lg, marginBottom: Theme.spacing.md },
    title: { fontSize: Theme.font.xxxl, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
    logoutBtn: { paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.xs,
      borderRadius: Theme.radius.full, borderWidth: 1, borderColor: colors.border },
    logoutText: { fontSize: Theme.font.sm, color: colors.secondary },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: Theme.spacing.lg,
      marginBottom: Theme.spacing.md,
      backgroundColor: colors.surface,
      borderRadius: Theme.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Theme.spacing.md,
    },
    searchIcon: {
      marginRight: Theme.spacing.sm,
    },
    search: {
      flex: 1,
      padding: Theme.spacing.md,
      fontSize: Theme.font.md,
      color: colors.primary,
    },
    list: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 100 },
    card: { backgroundColor: colors.surface, borderRadius: Theme.radius.lg,
      padding: Theme.spacing.md, marginBottom: Theme.spacing.sm,
      borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: Theme.font.lg, fontWeight: '700', color: colors.primary, marginBottom: 4 },
    cardPreview: { fontSize: Theme.font.sm, color: colors.secondary, marginBottom: 8, lineHeight: 18 },
    cardDate: { fontSize: Theme.font.xs, color: colors.muted },
    empty: { textAlign: 'center', color: colors.muted, marginTop: 80, fontSize: Theme.font.md },
    fab: { position: 'absolute', bottom: 32, right: 24, width: 58, height: 58,
      borderRadius: Theme.radius.full, backgroundColor: colors.accent,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
    hiddenRow: {
      flex: 1,
      backgroundColor: colors.danger,
      borderRadius: Theme.radius.lg,
      marginBottom: Theme.spacing.sm,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    deleteAction: {
      width: 90,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    deleteActionText: { color: '#fff', fontSize: Theme.font.xs, fontWeight: '600' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search notes..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>{search ? 'No matching notes.' : 'No notes yet. Tap + to start.'}</Text>
      ) : (
        <SwipeListView
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card}
              onPress={() => router.push({ pathname: '/(app)/note', params: { id: item.id } })}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled'}</Text>
              <Text style={styles.cardPreview} numberOfLines={2}>{item.content || 'No content'}</Text>
              <Text style={styles.cardDate}>{new Date(item.updated).toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
          renderHiddenItem={({ item }) => (
            <View style={styles.hiddenRow}>
              <View style={styles.deleteAction}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
                <Text style={styles.deleteActionText}>Delete</Text>
              </View>
            </View>
          )}
          rightOpenValue={-90}
          disableRightSwipe
          onSwipeValueChange={({ key, value }) => {
            if (value < -250) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          }}
          onRowOpen={(rowKey, rowMap) => {
            // close the row immediately, show Alert instead
            rowMap[rowKey]?.closeRow();
            const note = filtered.find(n => n.id === rowKey);
            Alert.alert(
              'Delete Note',
              `Delete "${note?.title || 'Untitled'}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    await deleteNote(rowKey);
                    fetchNotes();
                  },
                },
              ]
            );
          }}
        />

      )}

      <TouchableOpacity style={styles.fab}
        onPress={() => router.push({ pathname: '/(app)/note', params: { id: 'new' } })}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

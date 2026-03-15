import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import pb from '../../lib/pocketbase';

type Note = {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const records = await pb.collection('notes').getFullList<Note>({
        sort: '-updated',
        filter: `user = "${pb.authStore.model?.id}"`,
      });
      setNotes(records);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    // realtime sync
    pb.collection('notes').subscribe('*', () => fetchNotes());
    return () => { pb.collection('notes').unsubscribe('*'); };
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : notes.length === 0 ? (
        <Text style={styles.empty}>No notes yet. Tap + to create one.</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.noteCard}
              onPress={() => router.push({ pathname: '/(app)/note', params: { id: item.id } })}
            >
              <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
              <Text style={styles.noteMeta}>{new Date(item.updated).toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(app)/note', params: { id: 'new' } })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  logout: { color: '#999', fontSize: 14 },
  empty: { textAlign: 'center', color: '#999', marginTop: 80, fontSize: 16 },
  noteCard: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 10, backgroundColor: '#f5f5f5' },
  noteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  noteMeta: { fontSize: 12, color: '#999' },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
